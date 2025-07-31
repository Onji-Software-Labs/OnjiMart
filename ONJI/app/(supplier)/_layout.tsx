// Supplier layout placeholder
import React from 'react';
import { Stack } from 'expo-router';

export default function SupplierRootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Add your supplier-specific screens here */}
      {/* Example: <Stack.Screen name="dashboard" /> */}
      {/* If you have tabs under supplier, it might be <Stack.Screen name="(tabs)" /> */}
    </Stack>
  );
}
