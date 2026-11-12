import { Link, Stack } from 'expo-router';
import { View } from 'react-native';

import { AppText as Text } from '@/components/app-text';
import { useTranslation } from '@/utils/i18n';
import { space, typeScale, useAppTheme } from '@/theme';

export default function NotFoundScreen() {
  const theme = useAppTheme();
  const t = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t('Page not found') }} />
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: space.xxl,
          gap: space.lg,
          backgroundColor: theme.background,
        }}>
        <Text style={{ color: theme.text, fontSize: typeScale.heading, fontWeight: '700' }}>
          {t('This screen doesn’t exist.')}
        </Text>
        <Link href="/" style={{ padding: space.md }}>
          <Text style={{ color: theme.primary, fontSize: typeScale.body, fontWeight: '700' }}>
            {t('Return to the start')}
          </Text>
        </Link>
      </View>
    </>
  );
}
