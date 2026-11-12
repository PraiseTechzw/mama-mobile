import { router } from 'expo-router';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, Image as NativeImage, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText as Text } from '@/components/app-text';
import { useAppState } from '@/contexts/app-state';
import { useTranslation } from '@/utils/i18n';
import motherBabyLogo from '@/assets/brand/mother-baby-heart-logo.png';
import radiantMotherhood from '@/assets/illustrations/radiant-motherhood.png';
import { space, typeScale } from '@/theme';

const splashColors = {
  background: '#FFF8FE',
  pinkGlow: '#F6D3F2',
  lavender: '#B9A0F5',
  purple: '#5424C8',
  deepPurple: '#35118B',
  text: '#261263',
  tagline: '#21144E',
  white: '#FFFFFF',
} as const;

export default function SplashScreen() {
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const { data } = useAppState();
  const t = useTranslation();

  useEffect(() => {
    if (data.onboardingComplete) {
      router.replace('/home');
      return;
    }

    const timeout = setTimeout(() => router.replace('/welcome'), 2600);
    return () => clearTimeout(timeout);
  }, [data.onboardingComplete]);

  return (
    <View
      style={{
        flex: 1,
        overflow: 'hidden',
        alignItems: 'center',
        backgroundColor: splashColors.background,
      }}>
      <StatusBar style="dark" />

      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: -height * 0.2,
          left: -width * 0.25,
          width: width * 1.45,
          height: height * 0.56,
          borderRadius: 999,
          backgroundColor: splashColors.pinkGlow,
          opacity: 0.72,
        }}
      />

      <View
        style={{
          position: 'absolute',
          bottom: insets.bottom + height * 0.05,
          alignSelf: 'center',
          width: width * 0.92,
          height: height * 0.44,
        }}>
        <NativeImage
          source={radiantMotherhood}
          resizeMode="contain"
          accessibilityLabel="Expectant mother holding her belly"
          style={{ width: '100%', height: '100%' }}
        />
      </View>

      <View
        style={{
          position: 'absolute',
          bottom: -height * 0.05,
          left: -width * 0.25,
          width: width * 1.5,
          height: height * 0.18,
          borderRadius: 999,
          backgroundColor: splashColors.lavender,
          transform: [{ rotate: '-7deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: -height * 0.1,
          left: -width * 0.22,
          width: width * 1.45,
          height: height * 0.22,
          borderRadius: 999,
          backgroundColor: splashColors.deepPurple,
          transform: [{ rotate: '-5deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: -height * 0.17,
          left: -width * 0.22,
          width: width * 1.45,
          height: height * 0.28,
          borderRadius: 999,
          backgroundColor: splashColors.purple,
          transform: [{ rotate: '4deg' }],
        }}
      />

      <View
        style={{
          alignItems: 'center',
          paddingTop: Math.max(insets.top + space.md, space.huge * 2),
        }}>
        <Image
          source={motherBabyLogo}
          contentFit="contain"
          accessibilityLabel="Mother and baby surrounded by a heart"
          style={{ width: 180, height: 170 }}
        />
        <Text
          style={{
            color: splashColors.text,
            fontSize: typeScale.display + 8,
            fontWeight: '800',
            lineHeight: 50,
          }}>
          MamaBot
        </Text>
        <Text
          style={{
            marginTop: space.sm,
            color: splashColors.text,
            fontSize: typeScale.body,
            fontWeight: '800',
          }}>
          {t('Healthy Mother. Healthy Baby.')}
        </Text>
        <Text
          style={{
            maxWidth: 240,
            marginTop: space.xxl + space.sm,
            color: splashColors.tagline,
            fontSize: typeScale.subheading,
            fontStyle: 'italic',
            fontWeight: '800',
            lineHeight: 23,
            textAlign: 'center',
          }}>
          {t('Your smart maternal\nhealth companion')}
        </Text>
      </View>

      <View
        accessibilityRole="progressbar"
        accessibilityLabel={t('Loading MamaBot')}
        style={{
          position: 'absolute',
          right: 0,
          bottom: insets.bottom + space.xxxl + space.lg + space.sm,
          left: 0,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: space.sm,
        }}>
        <ActivityIndicator size="small" color={splashColors.white} />
        <Text
          style={{
            color: splashColors.white,
            fontSize: typeScale.body,
            fontWeight: '700',
          }}>
          {t('Loading...')}
        </Text>
      </View>
    </View>
  );
}
