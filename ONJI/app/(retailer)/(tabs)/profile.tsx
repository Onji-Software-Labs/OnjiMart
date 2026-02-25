// Profile tab placeholder
/**
 * Retailer Profile Screen
 * ------------------------
 * Shows retailer account information.
 * 
 * Placeholder screen to ensure router stability.
 */

import { View, Text, StyleSheet } from "react-native";

export default function RetailerProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Retailer Profile</Text>
      <Text>This screen will show retailer profile details.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
//Added by Me 