import { Link, Tabs } from 'expo-router';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { Pressable, View, type ColorValue } from 'react-native';

import mamaBotIllustration from '@/assets/onboarding/mother-and-mamabot.png';
import motherBabyLogo from '@/assets/brand/mother-baby-heart-logo.png';
import { AppIcon } from '@/components/app-icon';
import { AppText as Text } from '@/components/app-text';
import { useTranslation } from '@/utils/i18n';
import { useAppTheme, typeScale } from '@/theme';
import type { IconName } from '@/theme';

function TabIcon({
  name,
  color,
  focused,
}: {
  name: IconName;
  color: ColorValue;
  focused: boolean;
}) {
  const theme = useAppTheme();

  return (
    <View
      style={{
        width: 42,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 15,
        backgroundColor: focused ? theme.primarySoft : 'transparent',
      }}>
      <AppIcon name={name} color={color} size={20} />
    </View>
  );
}

function ChatTabIcon() {
  const theme = useAppTheme();

  return (
    <View
      style={{
        width: 52,
        height: 52,
        marginTop: -12,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 26,
        borderWidth: 3,
        borderColor: theme.surface,
        backgroundColor: theme.surface,
        boxShadow: '0 3px 8px rgba(37, 99, 235, 0.3)',
      }}>
      <Image
        source={mamaBotIllustration}
        contentFit="cover"
        accessibilityLabel="MamaBot assistant illustration"
        style={{ width: 46, height: 46, borderRadius: 23 }}
      />
    </View>
  );
}

export default function TabLayout() {
  const theme = useAppTheme();
  const t = useTranslation();

  return (
    <>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: true,
          headerStyle: { backgroundColor: theme.primary },
          headerTintColor: theme.white,
          headerTitleStyle: { color: theme.white, fontFamily: 'Nunito_700Bold' },
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          animation: 'none',
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.muted,
          tabBarStyle: {
            backgroundColor: theme.surface,
            borderTopColor: theme.line,
            height: 78,
            paddingTop: 7,
            paddingBottom: 8,
            boxShadow: '0 -2px 12px rgba(33, 27, 56, 0.06)',
            overflow: 'visible',
          },
          tabBarLabelStyle: {
            fontSize: typeScale.caption,
            fontFamily: 'Nunito_600SemiBold',
            marginTop: 2,
          },
          tabBarItemStyle: { paddingVertical: 2 },
        }}>
        <Tabs.Screen
          name="home"
          options={{
            title: 'MamaBot',
            tabBarLabel: t('Home'),
            headerRight: () => (
              <Link href="/reminders" asChild>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('Open ANC reminders')}
                  hitSlop={12}
                  style={{ paddingLeft: 12, paddingRight: 4 }}>
                  <AppIcon name="bell" color={theme.white} size={21} />
                </Pressable>
              </Link>
            ),
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name="home" color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="pregnancy-info"
          options={{
            title: t('Pregnancy Info'),
            tabBarLabel: t('Info'),
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name="book" color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: 'MamaBot',
            headerTitle: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View
                  style={{
                    width: 38,
                    height: 38,
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    borderRadius: 19,
                    backgroundColor: theme.white,
                  }}>
                  <Image
                    source={motherBabyLogo}
                    contentFit="contain"
                    accessibilityLabel="MamaBot mother and baby logo"
                    style={{ width: 34, height: 34 }}
                  />
                </View>
                <View style={{ gap: 1 }}>
                  <Text style={{ color: theme.white, fontSize: typeScale.body, fontWeight: '800' }}>
                    MamaBot
                  </Text>
                  <Text style={{ color: theme.white, fontSize: typeScale.caption, opacity: 0.82 }}>
                    {t('Personalized offline guide')}
                  </Text>
                </View>
              </View>
            ),
            tabBarLabel: t('Chat'),
            tabBarAccessibilityLabel: t('Chat with MamaBot'),
            tabBarIcon: () => <ChatTabIcon />,
          }}
        />
        <Tabs.Screen
          name="reminders"
          options={{
            title: t('ANC reminders'),
            tabBarLabel: t('Reminders'),
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name="calendar" color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: t('Settings'),
            tabBarLabel: t('More'),
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name="settings" color={color} focused={focused} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
