import { Text as NativeText, StyleSheet, type TextProps, type TextStyle } from 'react-native';

const families: Record<string, string> = {
  '400': 'Nunito_400Regular',
  '600': 'Nunito_600SemiBold',
  '700': 'Nunito_700Bold',
  '800': 'Nunito_800ExtraBold',
  normal: 'Nunito_400Regular',
  bold: 'Nunito_700Bold',
};

export function AppText({ style, ...props }: TextProps) {
  const flattenedStyle = StyleSheet.flatten(style) ?? {};
  const { fontFamily, fontWeight, ...textStyle } = flattenedStyle as TextStyle;

  return (
    <NativeText
      {...props}
      style={[
        textStyle,
        { fontFamily: fontFamily ?? families[String(fontWeight ?? '400')] ?? families['400'] },
      ]}
    />
  );
}
