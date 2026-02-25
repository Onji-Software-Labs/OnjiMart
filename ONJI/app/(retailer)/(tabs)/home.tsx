// Home tab placeholder
/**
 * Retailer Home Screen
 * ---------------------
 * This is the main dashboard screen for retailer users.
 * 
 * For now, this is a placeholder screen
 * to prevent Expo Router from crashing.
 */

import { View, Text, StyleSheet } from "react-native";

export default function RetailerHomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Retailer Home</Text>
      <Text>This is the retailer dashboard screen.</Text>
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
// Added by Me