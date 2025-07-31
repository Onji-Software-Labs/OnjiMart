// Home tab placeholder
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const RetailerHomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Retailer Home Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F8FF', // AliceBlue
  },
});

export default RetailerHomeScreen;
