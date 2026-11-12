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
  const logoHeight = Math.min(124, Math.max(72, height * 0.18));
  const introPaddingTop = Math.max(insets.top + space.md, height * 0.045);
  const loadingInset = insets.bottom + space.xxxl + space.lg + space.sm;

  useEffect(() => {
    const timeout = setTimeout(
      () => router.replace(data.onboardingComplete ? '/home' : '/welcome'),
      5000
    );
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
          flex: 1,
          width: '100%',
          paddingTop: introPaddingTop,
          paddingBottom: loadingInset,
          alignItems: 'center',
        }}>
        <Image
          source={motherBabyLogo}
          contentFit="contain"
          accessibilityLabel="Mother and baby surrounded by a heart"
          style={{ width: logoHeight * (1512 / 1040), height: logoHeight }}
        />
        <Text
          style={{
            color: splashColors.text,
            fontSize: Math.min(typeScale.display + 8, height * 0.08),
            fontWeight: '800',
            lineHeight: Math.min(50, height * 0.085),
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
            marginTop: Math.min(space.xxl + space.sm, height * 0.05),
            color: splashColors.tagline,
            fontSize: typeScale.subheading,
            fontStyle: 'italic',
            fontWeight: '800',
            lineHeight: 23,
            textAlign: 'center',
          }}>
          {t('Your smart maternal\nhealth companion')}
        </Text>

        <View
          pointerEvents="none"
          style={{
            flex: 1,
            minHeight: Math.min(100, height * 0.18),
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <NativeImage
            source={radiantMotherhood}
            resizeMode="contain"
            accessibilityLabel="Expectant mother holding her belly"
            style={{ width: Math.min(width * 0.92, 440), height: '100%' }}
          />
        </View>
      </View>

      <View
        pointerEvents="none"
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
        pointerEvents="none"
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
        pointerEvents="none"
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
        accessibilityRole="progressbar"
        accessibilityLabel={t('Loading MamaBot')}
        style={{
          position: 'absolute',
          right: 0,
          bottom: loadingInset,
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
