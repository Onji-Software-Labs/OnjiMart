// Retailer layout placeholder
/**
 * Retailer Layout
 * ----------------
 * This layout wraps all retailer screens.
 * 
 * We are using Stack navigation for Retailer flow.
 * Header is hidden for clean UI.
 */

import { Stack } from "expo-router";

export default function RetailerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* All retailer screens will be nested inside this layout */}
    </Stack>
  );
}
// Added by Me

