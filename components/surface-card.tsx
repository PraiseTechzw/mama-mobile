import type { PropsWithChildren } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';

import { radius, space, useAppTheme } from '@/theme';

export function SurfaceCard({
  children,
  tone = 'default',
  style,
}: PropsWithChildren<{
  tone?: 'default' | 'soft' | 'tint';
  style?: StyleProp<ViewStyle>;
}>) {
  const theme = useAppTheme();
  const backgroundColor =
    tone === 'soft'
      ? theme.surfaceSoft
      : tone === 'tint'
        ? theme.surfaceTint
        : theme.surface;

  return (
    <View
      style={[
        {
          gap: space.md,
          padding: space.lg,
          borderRadius: radius.lg,
          borderCurve: 'continuous',
          backgroundColor,
          borderWidth: tone === 'default' ? 1 : 0,
          borderColor: theme.line,
        },
        style,
      ]}>
      {children}
    </View>
  );
}
