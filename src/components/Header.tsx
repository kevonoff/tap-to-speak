import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActiveScreen } from '../types';

interface HeaderProps {
  activeScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeScreen, onNavigate }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
      <Pressable onPress={() => onNavigate('workspace')} style={styles.brand}>
        <View style={styles.logo}>
          <Ionicons name="sparkles" size={20} color="#fff" />
        </View>
        <Text style={styles.title}>Tap to Speak</Text>
      </Pressable>

      {activeScreen === 'workspace' && (
        <Pressable onPress={() => onNavigate('settings')} style={styles.settingsBtn}>
          <Ionicons name="settings-outline" size={20} color="#4B5563" />
          <Text style={styles.settingsText}>Settings</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 16,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: '#1F2937',
  },
  settingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  settingsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
});
