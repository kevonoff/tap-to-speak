import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

export const AuthScreen: React.FC = () => {
  const { signInWithGoogle, signInWithApple } = useAuth();
  const insets = useSafeAreaInsets();
  const [pendingProvider, setPendingProvider] = useState<'google' | 'apple' | null>(null);

  const handlePress = async (provider: 'google' | 'apple') => {
    setPendingProvider(provider);
    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else {
        await signInWithApple();
      }
    } catch (err) {
      console.warn(`${provider} sign-in failed:`, err);
    } finally {
      setPendingProvider(null);
    }
  };

  const isBusy = pendingProvider !== null;

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.logo}>
        <Ionicons name="sparkles" size={32} color="#fff" />
      </View>
      <Text style={styles.title}>Tap to Speak</Text>
      <Text style={styles.subtitle}>Sign in to sync your communication cards across devices</Text>

      <View style={styles.buttons}>
        <Pressable
          style={[styles.button, styles.googleButton, isBusy && styles.buttonDisabled]}
          onPress={() => handlePress('google')}
          disabled={isBusy}
        >
          {pendingProvider === 'google' ? (
            <ActivityIndicator color="#1F2937" />
          ) : (
            <>
              <Ionicons name="logo-google" size={20} color="#1F2937" />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </>
          )}
        </Pressable>

        <Pressable
          style={[styles.button, styles.appleButton, isBusy && styles.buttonDisabled]}
          onPress={() => handlePress('apple')}
          disabled={isBusy}
        >
          {pendingProvider === 'apple' ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="logo-apple" size={20} color="#fff" />
              <Text style={styles.appleButtonText}>Continue with Apple</Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#CBD5E1',
    textAlign: 'center',
    marginBottom: 40,
    maxWidth: 280,
  },
  buttons: {
    width: '100%',
    gap: 12,
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 52,
    borderRadius: 14,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  googleButton: {
    backgroundColor: '#fff',
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  appleButton: {
    backgroundColor: '#000',
  },
  appleButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
