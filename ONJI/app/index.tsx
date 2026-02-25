/**
 * Root route of the application ("/")
 *
 * When the app starts, Expo loads this file.
 * We redirect users to authentication flow.
 */

import { Redirect } from "expo-router";

export default function Index() {
  // Redirect to auth group
  return <Redirect href="/(auth)" />;
}
// Added by Me 