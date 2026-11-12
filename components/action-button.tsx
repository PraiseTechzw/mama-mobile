import type { StyleProp, ViewStyle } from 'react-native';
import { Pressable, View } from 'react-native';

import { AppIcon } from '@/components/app-icon';
import { AppText as Text } from '@/components/app-text';
import { radius, space, typeScale, useAppTheme, type IconName } from '@/theme';

export function ActionButton({
  title,
  onPress,
  variant = 'primary',
  icon,
  style,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  icon?: IconName;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useAppTheme();
  const backgroundColor =
    variant === 'primary'
      ? theme.primary
      : variant === 'danger'
        ? theme.danger
        : variant === 'secondary'
          ? theme.primarySoft
          : 'transparent';
  const foregroundColor =
    variant === 'primary' || variant === 'danger'
      ? theme.white
      : theme.primary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          minHeight: 50,
          paddingHorizontal: space.xl,
          paddingVertical: space.md,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: space.sm,
          borderRadius: radius.md,
          borderCurve: 'continuous',
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: theme.line,
          backgroundColor,
          opacity: disabled ? 0.55 : pressed ? 0.82 : 1,
        },
        style,
      ]}>
      {icon ? <AppIcon name={icon} color={foregroundColor} size={18} /> : null}
      <View>
        <Text style={{ color: foregroundColor, fontSize: typeScale.body, fontWeight: '700' }}>
          {title}
        </Text>
      </View>
    </Pressable>
  );
}
