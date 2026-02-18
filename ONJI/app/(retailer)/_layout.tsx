// Retailer layout placeholder
/**
 * Retailer Layout
 * ---------------
 * This layout wraps all retailer tab screens.
 * It renders nested routes like:
 * home, orders, profile
 */

import { Slot } from "expo-router";

export default function RetailerLayout() {
  // Slot renders child routes inside this layout
  return <Slot />;
}
// Added by Me 