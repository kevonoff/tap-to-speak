import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { makeRedirectUri } from 'expo-auth-session';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

type OAuthProvider = 'google' | 'apple';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Where Supabase redirects back to after the provider's hosted login page.
// Requires app.json's "scheme" (or a custom dev client) to resolve outside Expo Go.
const redirectTo = makeRedirectUri();

async function createSessionFromUrl(url: string) {
  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) throw new Error(errorCode);

  const { access_token, refresh_token } = params;
  if (!access_token || !refresh_token) return;

  const { error } = await supabase.auth.setSession({ access_token, refresh_token });
  if (error) throw error;
}

async function performOAuth(provider: OAuthProvider) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });
  if (error) throw error;
  if (!data.url) throw new Error(`Supabase did not return an OAuth URL for ${provider}`);

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type === 'success') {
    await createSessionFromUrl(result.url);
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Catches the OAuth redirect if it lands while the app is already running,
  // or if the app was launched cold via the redirect link.
  useEffect(() => {
    const handleUrl = ({ url }: { url: string }) => {
      createSessionFromUrl(url).catch((err) => console.warn('Auth redirect error:', err));
    };

    const subscription = Linking.addEventListener('url', handleUrl);
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url });
    });

    return () => subscription.remove();
  }, []);

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    isLoading,
    signInWithGoogle: () => performOAuth('google'),
    signInWithApple: () => performOAuth('apple'),
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
