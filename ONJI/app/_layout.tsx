import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router, Stack } from 'expo-router';
import SplashScreen from './(auth)/SplashScreen'; 

const App = () => {
  const [isSplashAnimationComplete, setSplashAnimationComplete] = useState(false);

  useEffect(() => {

  }, []);

  if (!isSplashAnimationComplete) {
    return (
      <SplashScreen
        onAnimationEnd={() => {
          setSplashAnimationComplete(true);
          setTimeout(() => {
            router.replace('/(auth)');
          }, 100);
        }}
      />
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />

      {/* Placeholder for other main app sections if needed later */}
      {/* <Stack.Screen name="(retailer)" options={{ headerShown: false }} /> */}
      {/* <Stack.Screen name="(supplier)" options={{ headerShown: false }} /> */}

      <Stack.Screen name="+not-found" />
    </Stack>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    fontSize: 18,
    color: '#4B5563',
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
  },
});

export default App;
