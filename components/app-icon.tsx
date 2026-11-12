import { SymbolView } from 'expo-symbols';
import type { ColorValue } from 'react-native';

import { icons, type IconName } from '@/theme';

export function AppIcon({
  name,
  color,
  size = 22,
}: {
  name: IconName;
  color: ColorValue;
  size?: number;
}) {
  return <SymbolView name={icons[name]} tintColor={color} size={size} />;
}
