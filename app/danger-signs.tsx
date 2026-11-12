import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { AppIcon } from '@/components/app-icon';
import { ActionButton } from '@/components/action-button';
import { AppText as Text } from '@/components/app-text';
import { SurfaceCard } from '@/components/surface-card';
import { useTranslation } from '@/utils/i18n';
import { radius, space, typeScale, useAppTheme } from '@/theme';

const warningSigns = [
  { label: 'Heavy bleeding', icon: 'drop' as const },
  { label: 'Severe or persistent headache, or changes in vision', icon: 'eye' as const },
  { label: 'Difficulty breathing, fainting, or a seizure', icon: 'breathing' as const },
  { label: 'Severe abdominal pain or a high fever', icon: 'medical' as const },
  {
    label: 'Fluid leaking, or a noticeable change in your baby’s movement',
    icon: 'pregnancy' as const,
  },
];

export default function DangerSignsScreen() {
  const theme = useAppTheme();
  const t = useTranslation();
  const [showHelp, setShowHelp] = useState(false);

  const requestUrgentHelp = () => {
    setShowHelp(true);
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: space.lg, paddingBottom: space.xxxl, gap: space.xxl }}
      style={{ flex: 1, backgroundColor: theme.background }}>
      <View
        style={{
          padding: space.xl,
          gap: space.md,
          borderRadius: radius.lg,
          borderCurve: 'continuous',
          backgroundColor: theme.dangerSoft,
        }}>
        <View
          style={{
            width: 48,
            height: 48,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: radius.md,
            backgroundColor: theme.surface,
          }}>
          <AppIcon name="warning" color={theme.danger} size={25} />
        </View>
        <Text style={{ color: theme.danger, fontSize: typeScale.title, fontWeight: '800' }}>
          {t('Don’t wait if something feels wrong.')}
        </Text>
        <Text selectable style={{ color: theme.text, fontSize: typeScale.body, lineHeight: 23 }}>
          {t('These warning signs need urgent medical attention. Please contact a health professional or go to a health facility right away.')}
        </Text>
      </View>

      <View style={{ gap: space.md }}>
        <Text style={{ color: theme.text, fontSize: typeScale.heading, fontWeight: '800' }}>
          {t('Seek urgent care for')}
        </Text>
        <SurfaceCard style={{ padding: 0, gap: 0, overflow: 'hidden' }}>
          {warningSigns.map((sign, index) => (
            <View
              key={sign.label}
              style={{
                minHeight: 72,
                padding: space.lg,
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: space.md,
                borderBottomWidth: index === warningSigns.length - 1 ? 0 : 1,
                borderBottomColor: theme.line,
              }}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: radius.full,
                  backgroundColor: theme.dangerSoft,
                }}>
                <AppIcon name={sign.icon} color={theme.danger} size={16} />
              </View>
              <Text
                selectable
                style={{
                  flex: 1,
                  paddingTop: 2,
                  color: theme.text,
                  fontSize: typeScale.body,
                  lineHeight: 22,
                }}>
                {t(sign.label)}
              </Text>
            </View>
          ))}
        </SurfaceCard>
      </View>

      <ActionButton
        title={t('Show urgent care guidance')}
        icon="phone"
        variant="danger"
        onPress={requestUrgentHelp}
      />
      {showHelp ? (
        <View
          accessibilityLiveRegion="polite"
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: space.md,
            padding: space.lg,
            borderRadius: radius.md,
            borderCurve: 'continuous',
            backgroundColor: theme.dangerSoft,
          }}>
          <AppIcon name="phone" color={theme.danger} size={18} />
          <Text
            selectable
            style={{
              flex: 1,
              color: theme.danger,
              fontSize: typeScale.body,
              fontWeight: '700',
              lineHeight: 22,
            }}>
            {t('Please contact your local emergency service or nearest health facility now.')}
          </Text>
        </View>
      ) : null}

      <SurfaceCard tone="soft">
        <Text style={{ color: theme.text, fontSize: typeScale.body, fontWeight: '700' }}>
          {t('If you’re unsure')}
        </Text>
        <Text selectable style={{ color: theme.muted, fontSize: typeScale.small, lineHeight: 21 }}>
          {t('This list is not complete. If you feel something is seriously wrong, contact your care team or seek urgent help. This app cannot assess emergencies.')}
        </Text>
      </SurfaceCard>
    </ScrollView>
  );
}
