import { Text, View } from "react-native";
import { BusinessDetailsScreen } from "./Screens/BusinessDetailsScreen";
import { Link } from "expo-router";
import "../global.css";


export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Link href="/Screens/BusinessDetailsScreen" className="text-black">
        Go to business Screen
      </Link>
      
    </View>
  );
}
