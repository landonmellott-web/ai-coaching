import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Colors } from '../constants/Colors';

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts if needed (using system fonts for now)
        await Font.loadAsync({});

        // Small delay to ensure smooth transition
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (e) {
        console.warn('Error loading fonts:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  };

  if (!appIsReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container} onLayout={onLayoutRootView}>
        <StatusBar style="light" backgroundColor={Colors.background} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.background },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen
            name="onboarding/welcome"
            options={{ animation: 'fade' }}
          />
          <Stack.Screen
            name="onboarding/name"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="onboarding/focus"
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{ animation: 'fade' }}
          />
        </Stack>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
