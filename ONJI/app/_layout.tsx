import 'react-native-get-random-values';

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";

import { useFonts } from "expo-font";

import {
  AlbertSans_400Regular,
  AlbertSans_700Bold,
  AlbertSans_300Light,
  AlbertSans_500Medium,
  AlbertSans_600SemiBold,
} from "@expo-google-fonts/albert-sans";

import {
  Inter_400Regular,
  Inter_700Bold,
  Inter_300Light,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";

import { SafeAreaProvider } from "react-native-safe-area-context";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [loaded] = useFonts({
    AlbertSans_400Regular,
    AlbertSans_300Light,
    AlbertSans_500Medium,
    AlbertSans_600SemiBold,
    AlbertSans_700Bold,
    Inter_400Regular,
    Inter_700Bold,
    Inter_300Light,
    Inter_500Medium,
    Inter_600SemiBold,
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(retailer)" />
          <Stack.Screen name="(supplier)" />
          <Stack.Screen name="+not-found" />
        </Stack>

        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}