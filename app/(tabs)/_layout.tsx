import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import HomeScreen from './index'; // Ensure this import is correct based on your file structure

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <HomeScreen /> // Render the HomeScreen component directly
  );
}
