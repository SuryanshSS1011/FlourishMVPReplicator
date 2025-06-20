import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function EncyclopediaScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Encyclopedia</Text>
        <Text style={styles.subtitle}>Plant Knowledge Base</Text>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>📚</Text>
          <Text style={styles.comingSoon}>Coming Soon</Text>
          <Text style={styles.description}>
            Learn about different plants, gardening techniques, and unlock achievements. Build your botanical knowledge library.
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