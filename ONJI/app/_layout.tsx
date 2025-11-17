import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css"

import { useColorScheme } from "@/hooks/useColorScheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    return null;
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
