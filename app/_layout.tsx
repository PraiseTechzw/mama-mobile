import { Nunito_400Regular } from '@expo-google-fonts/nunito/400Regular';
import { Nunito_600SemiBold } from '@expo-google-fonts/nunito/600SemiBold';
import { Nunito_700Bold } from '@expo-google-fonts/nunito/700Bold';
import { Nunito_800ExtraBold } from '@expo-google-fonts/nunito/800ExtraBold';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';

import { ActionButton } from '@/components/action-button';
import { AppText as Text } from '@/components/app-text';
import { AppStateProvider, useAppState } from '@/contexts/app-state';
import { configureReminderNotifications } from '@/services/reminder-notifications';
import { useTranslation } from '@/utils/i18n';
import { useAppTheme } from '@/theme';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });
  const theme = useAppTheme();

  if (fontError) throw fontError;
  if (!fontsLoaded) return null;

  return (
    <AppStateProvider>
      <AppNavigator theme={theme} />
    </AppStateProvider>
  );
}

function AppNavigator({ theme }: { theme: ReturnType<typeof useAppTheme> }) {
  const t = useTranslation();
  const { isReady, loadFailed, error, retryLoad } = useAppState();

  useEffect(() => {
    configureReminderNotifications();
  }, []);

  if (!isReady) return null;

  if (loadFailed) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          padding: 24,
          gap: 16,
          backgroundColor: theme.background,
        }}>
        <Text style={{ color: theme.text, fontSize: 24, fontWeight: '800' }}>
          {t('Your saved information could not be opened')}
        </Text>
        <Text selectable style={{ color: theme.muted, fontSize: 15, lineHeight: 22 }}>
          {error}
        </Text>
        <ActionButton title={t('Try again')} icon="arrow" onPress={retryLoad} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: theme.background },
            headerStyle: { backgroundColor: theme.primary },
            headerTintColor: theme.white,
            headerTitleStyle: { color: theme.white, fontFamily: 'Nunito_700Bold' },
            headerShadowVisible: false,
          }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="welcome" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="reminder-form" options={{ title: 'Add a reminder' }} />
          <Stack.Screen name="danger-signs" options={{ title: 'Danger signs' }} />
        </Stack>
        {error ? (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              right: 12,
              bottom: 12,
              left: 12,
              padding: 12,
              borderRadius: 12,
              backgroundColor: theme.dangerSoft,
            }}>
            <Text accessibilityLiveRegion="polite" style={{ color: theme.danger, fontSize: 13 }}>
              {t(error)}
            </Text>
          </View>
        ) : null}
      </View>
    </>
  );
}
