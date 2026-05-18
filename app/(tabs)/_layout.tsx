import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';

interface TabIconProps {
  name: React.ComponentProps<typeof Ionicons>['name'];
  focused: boolean;
  label: string;
}

function TabIcon({ name, focused, label }: TabIconProps) {
  const focusedName = name;
  const unfocusedName = (name + '-outline') as React.ComponentProps<typeof Ionicons>['name'];

  return (
    <View style={styles.tabIconContainer}>
      <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
        <Ionicons
          name={focused ? focusedName : unfocusedName}
          size={22}
          color={focused ? Colors.primary : Colors.textMuted}
        />
      </View>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 82,
          paddingBottom: 20,
          paddingTop: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home" focused={focused} label="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          title: 'Coach',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="chatbubble-ellipses" focused={focused} label="Coach" />
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Goals',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="flag" focused={focused} label="Goals" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="person" focused={focused} label="Profile" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingTop: 2,
  },
  iconWrapper: {
    width: 44,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperActive: {
    backgroundColor: Colors.primary + '20',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
