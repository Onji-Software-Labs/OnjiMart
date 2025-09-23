import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SplashScreen" />
      <Stack.Screen name="index" />
      <Stack.Screen name="signup"/>
      <Stack.Screen name="login" />
      <Stack.Screen name="otpverify" />
      <Stack.Screen name="personalProfile"/>
      <Stack.Screen name="buisnessScreen"/>
    </Stack>
  );
}