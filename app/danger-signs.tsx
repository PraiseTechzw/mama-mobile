import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { AppIcon } from '@/components/app-icon';
import { ActionButton } from '@/components/action-button';
import { AppText as Text } from '@/components/app-text';
import { SurfaceCard } from '@/components/surface-card';
import { useTranslation } from '@/utils/i18n';
import { radius, space, typeScale, useAppTheme } from '@/theme';

const warningSigns = [
  'Heavy bleeding',
  'Severe or persistent headache, or changes in vision',
  'Difficulty breathing, fainting, or a seizure',
  'Severe abdominal pain or a high fever',
  'Fluid leaking, or a noticeable change in your baby’s movement',
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
        <AppIcon name="warning" color={theme.danger} size={30} />
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
              key={sign}
              style={{
                minHeight: 68,
                padding: space.lg,
                flexDirection: 'row',
                alignItems: 'center',
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
                <AppIcon name="warning" color={theme.danger} size={15} />
              </View>
              <Text selectable style={{ flex: 1, color: theme.text, fontSize: typeScale.body, lineHeight: 22 }}>
                {t(sign)}
              </Text>
            </View>
          ))}
        </SurfaceCard>
      </View>

      <SurfaceCard tone="soft">
        <Text style={{ color: theme.text, fontSize: typeScale.body, fontWeight: '700' }}>
          {t('If you’re unsure')}
        </Text>
        <Text selectable style={{ color: theme.muted, fontSize: typeScale.small, lineHeight: 21 }}>
          {t('This list is not complete. If you feel something is seriously wrong, contact your care team or seek urgent help. This app cannot assess emergencies.')}
        </Text>
      </SurfaceCard>

      <ActionButton
        title={t('Show urgent care guidance')}
        icon="phone"
        variant="danger"
        onPress={requestUrgentHelp}
      />
      {showHelp ? (
        <Text
          accessibilityLiveRegion="polite"
          selectable
          style={{ color: theme.danger, fontSize: typeScale.small, fontWeight: '600', textAlign: 'center' }}>
          {t('Please contact your local emergency service or nearest health facility now.')}
        </Text>
      ) : null}
    </ScrollView>
  );
}
