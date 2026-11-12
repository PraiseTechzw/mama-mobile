import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { ActionButton } from '@/components/action-button';
import { AppIcon } from '@/components/app-icon';
import { AppText as Text } from '@/components/app-text';
import { SurfaceCard } from '@/components/surface-card';
import { radius, space, typeScale, useAppTheme } from '@/theme';
import { useTranslation } from '@/utils/i18n';

const emergencyContacts = [
  {
    number: '999',
    dial: '999',
    label: 'All emergencies',
    detail: 'Ambulance, fire and police',
  },
  {
    number: '112',
    dial: '112',
    label: 'Econet mobile',
    detail: 'Ambulance, fire and police',
  },
  {
    number: '114',
    dial: '114',
    label: 'NetOne mobile',
    detail: 'Ambulance, fire and police',
  },
  {
    number: '0800 3222 911',
    dial: '08003222911',
    label: 'Toll-free landline',
    detail: 'For landlines',
  },
];

const callSteps = [
  'Say that you are pregnant and describe what is happening.',
  'Give your exact location, a nearby landmark, and a callback number.',
  'Follow the operator’s instructions and keep your phone available.',
];

const whileWaitingSteps = [
  'Ask someone you trust to stay with you and help you get care.',
  'If you cannot reach emergency services, try another listed number or go to the nearest health facility.',
  'Do not wait for a reply in this app or travel alone if you can avoid it.',
];

export default function UrgentCareScreen() {
  const theme = useAppTheme();
  const t = useTranslation();
  const [callError, setCallError] = useState('');

  const callEmergencyNumber = async (number: string, dial: string) => {
    setCallError('');
    try {
      await Linking.openURL(`tel:${dial}`);
    } catch {
      setCallError(
        t('Could not open the phone dialer for {number}. Please dial it manually.', {
          number,
        }),
      );
    }
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: space.lg, paddingBottom: space.xxxl, gap: space.xl }}
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
          {t('Need urgent help now?')}
        </Text>
        <Text selectable style={{ color: theme.text, fontSize: typeScale.body, lineHeight: 23 }}>
          {t('Call emergency services or go to a health facility now. Do not wait for an in-app reply.')}
        </Text>
      </View>

      <View style={{ gap: space.md }}>
        <View style={{ gap: space.xs }}>
          <Text style={{ color: theme.text, fontSize: typeScale.heading, fontWeight: '800' }}>
            {t('Emergency numbers in Zimbabwe')}
          </Text>
          <Text style={{ color: theme.muted, fontSize: typeScale.small, lineHeight: 20 }}>
            {t('Choose the number for your network. These lines can connect you to ambulance, fire and police services.')}
          </Text>
        </View>

        <View style={{ gap: space.sm }}>
          {emergencyContacts.map((contact) => (
            <Pressable
              key={contact.number}
              accessibilityRole="button"
              accessibilityLabel={t('Call {number}, {service}', {
                number: contact.number,
                service: t(contact.label),
              })}
              accessibilityHint={t('Opens your phone app to place the call.')}
              onPress={() => callEmergencyNumber(contact.number, contact.dial)}
              style={({ pressed }) => ({
                minHeight: 76,
                paddingHorizontal: space.lg,
                paddingVertical: space.md,
                flexDirection: 'row',
                alignItems: 'center',
                gap: space.md,
                borderRadius: radius.md,
                borderCurve: 'continuous',
                borderWidth: 1,
                borderColor: theme.line,
                backgroundColor: theme.surface,
                opacity: pressed ? 0.78 : 1,
              })}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: radius.full,
                  backgroundColor: theme.dangerSoft,
                }}>
                <AppIcon name="phone" color={theme.danger} size={18} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ color: theme.text, fontSize: typeScale.body, fontWeight: '700' }}>
                  {t(contact.label)}
                </Text>
                <Text style={{ color: theme.muted, fontSize: typeScale.small }}>
                  {contact.number} · {t(contact.detail)}
                </Text>
              </View>
              <AppIcon name="arrow" color={theme.danger} size={18} />
            </Pressable>
          ))}
        </View>
        <Text
          selectable
          style={{ color: theme.muted, fontSize: typeScale.caption, lineHeight: 17 }}>
          {t('Emergency numbers published by the Government of Zimbabwe. Network availability may vary.')}
        </Text>
        {callError ? (
          <Text
            accessibilityLiveRegion="polite"
            selectable
            style={{ color: theme.danger, fontSize: typeScale.small, lineHeight: 20 }}>
            {callError}
          </Text>
        ) : null}
      </View>

      <SurfaceCard>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
          <AppIcon name="medical" color={theme.primary} size={20} />
          <Text style={{ color: theme.text, fontSize: typeScale.subheading, fontWeight: '800' }}>
            {t('What to tell the operator')}
          </Text>
        </View>
        {callSteps.map((step, index) => (
          <View key={step} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space.md }}>
            <Text
              style={{
                width: 24,
                color: theme.primary,
                fontSize: typeScale.body,
                fontWeight: '800',
              }}>
              {index + 1}.
            </Text>
            <Text selectable style={{ flex: 1, color: theme.muted, fontSize: typeScale.small, lineHeight: 21 }}>
              {t(step)}
            </Text>
          </View>
        ))}
      </SurfaceCard>

      <SurfaceCard tone="soft">
        <Text style={{ color: theme.text, fontSize: typeScale.subheading, fontWeight: '800' }}>
          {t('While help is on the way')}
        </Text>
        {whileWaitingSteps.map((step) => (
          <View key={step} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space.sm }}>
            <AppIcon name="check" color={theme.primary} size={17} />
            <Text selectable style={{ flex: 1, color: theme.muted, fontSize: typeScale.small, lineHeight: 21 }}>
              {t(step)}
            </Text>
          </View>
        ))}
      </SurfaceCard>

      <ActionButton
        title={t('Find a nearby health facility')}
        icon="medical"
        variant="outline"
        onPress={() => router.push('/pregnancy-info')}
      />
    </ScrollView>
  );
}
