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
  brandIcon,
  style,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  icon?: IconName;
  brandIcon?: 'whatsapp';
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
      {brandIcon === 'whatsapp' ? (
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{
            width: 20,
            height: 20,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 10,
            backgroundColor: '#25D366',
          }}>
          <View
            style={{
              position: 'absolute',
              bottom: 1,
              left: 1,
              width: 6,
              height: 6,
              backgroundColor: '#25D366',
              transform: [{ rotate: '35deg' }],
            }}
          />
          <AppIcon name="phone" color="#FFFFFF" size={13} />
        </View>
      ) : null}
      <View>
        <Text style={{ color: foregroundColor, fontSize: typeScale.body, fontWeight: '700' }}>
          {title}
        </Text>
      </View>
    </Pressable>
  );
}
