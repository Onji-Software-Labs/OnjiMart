// Supplier layout placeholder
/**
 * Supplier Layout
 * ----------------
 * This layout wraps all supplier screens.
 * 
 * We are using Stack navigation for supplier flow.
 * Header is hidden for clean UI.
 */

import { Stack } from "expo-router";

export default function SupplierLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* All supplier screens will be nested inside this layout */}
    </Stack>
  );
}
// Added by Me

