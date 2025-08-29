// ChatPlaceholder.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ChatPlaceholder() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>💬 Chat tez orada ishga tushadi...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8A0D0D',
  },
  subText: {
    fontSize: 16,
    color: '#555',
    marginTop: 8,
  },
});
