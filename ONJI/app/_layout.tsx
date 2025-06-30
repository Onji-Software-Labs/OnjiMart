import { Stack } from "expo-router";
import "../global.css"
import { useNavigation } from "@react-navigation/native";


export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      ></Stack.Screen>
      <Stack.Screen
        name="Screens/BusinessDetailsScreen"
        options={{ headerShown: false }}
      ></Stack.Screen>
    </Stack>
  );
}
