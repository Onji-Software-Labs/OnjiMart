import { StyleSheet } from 'react-native';
import { Link } from 'expo-router';

import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.centerContainer}>
        <ThemedText type="subtitle">OTP Authentication</ThemedText>
        <Link href="/otpverify" style={styles.link}>
          <ThemedText type="defaultSemiBold">Go to OTP Page</ThemedText>
        </Link>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    alignItems: 'center',
    gap: 16,
  },
  link: {
    textDecorationLine: 'underline',
  },
});
