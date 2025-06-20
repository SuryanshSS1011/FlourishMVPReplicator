import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function ShopScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Shop</Text>
        <Text style={styles.subtitle}>Garden Marketplace</Text>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>🛍️</Text>
          <Text style={styles.comingSoon}>Coming Soon</Text>
          <Text style={styles.description}>
            Discover and purchase seeds, tools, and decorations for your garden. Earn coins by completing tasks and achieving milestones.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBF5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0F5132',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B705C',
    marginBottom: 30,
  },
  placeholder: {
    backgroundColor: '#F3F6F2',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    marginTop: 50,
  },
  placeholderText: {
    fontSize: 60,
    marginBottom: 20,
  },
  comingSoon: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0F5132',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#6B705C',
    textAlign: 'center',
    lineHeight: 24,
  },
});