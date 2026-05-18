import { useEffect } from 'react';
import { router } from 'expo-router';
import { onboardingStorage } from '../hooks/useStorage';

export default function Index() {
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const isOnboarded = await onboardingStorage.isComplete();
        if (isOnboarded) {
          router.replace('/(tabs)/home');
        } else {
          router.replace('/onboarding/welcome');
        }
      } catch (error) {
        // Default to onboarding on error
        router.replace('/onboarding/welcome');
      }
    };

    checkOnboarding();
  }, []);

  return null;
}
