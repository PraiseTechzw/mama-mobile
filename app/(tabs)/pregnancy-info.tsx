import { router } from 'expo-router';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { AppIcon } from '@/components/app-icon';
import { ActionButton } from '@/components/action-button';
import { AppText as Text } from '@/components/app-text';
import { SurfaceCard } from '@/components/surface-card';
import { useAppState } from '@/contexts/app-state';
import { useTranslation } from '@/utils/i18n';
import prenatalCareImage from '@/assets/illustrations/prenatal-care-consultation.png';
import { pregnancyWeekFromDueDate } from '@/utils/pregnancy';
import { radius, space, typeScale, useAppTheme } from '@/theme';

const stages = [
  { title: 'First trimester', weeks: 'Weeks 1–13', start: 1, end: 13 },
  { title: 'Second trimester', weeks: 'Weeks 14–27', start: 14, end: 27 },
  { title: 'Third trimester', weeks: 'Weeks 28–40', start: 28, end: 40 },
] as const;

const stageGuidance = [
  'Early pregnancy can bring many changes. Your ANC provider can help you understand what to expect and which care is right for you.',
  'Keep attending the visits recommended by your clinic. Ask your provider about changes in your body and any medicines or supplements.',
  'Talk with your care team about birth planning, when to seek help, and how to contact your clinic if you have concerns.',
] as const;

const topics = [
  {
    title: 'Antenatal care visits',
    text: 'At ANC, a health worker can check on you and your baby, answer questions, and help plan any care you may need. Ask your clinic when to return and what to bring.',
    icon: 'calendar' as const,
  },
  {
    title: 'Food, water and rest',
    text: 'Choose a variety of nourishing foods, drink safe water, and rest when you can. Your provider can advise you about nutrition, supplements, or food needs that are specific to you.',
    icon: 'heart' as const,
  },
  {
    title: 'Medicines and supplements',
    text: 'Check with a qualified health worker before starting, stopping, or changing medicines or supplements. Bring a list of what you take to your next visit.',
    icon: 'medical' as const,
  },
  {
    title: 'Questions for your provider',
    text: 'Write down symptoms, medicines, and questions before a visit. If you have a concern between visits, contact your clinic rather than waiting for the next appointment.',
    icon: 'chat' as const,
  },
];

export default function PregnancyInfoScreen() {
  const theme = useAppTheme();
  const t = useTranslation();
  const { data } = useAppState();
  const week = pregnancyWeekFromDueDate(data.profile.dueDate) ?? data.profile.pregnancyWeek;
  const defaultStage = week
    ? week <= 13
      ? stages[0]
      : week <= 27
        ? stages[1]
        : stages[2]
    : stages[0];
  const [selectedStage, setSelectedStage] = useState<(typeof stages)[number]['title']>(
    defaultStage.title,
  );
  const [openTopic, setOpenTopic] = useState<string | null>(topics[0].title);
  const stageIndex = stages.findIndex((stage) => stage.title === selectedStage);
  const selectedStageData = stages[stageIndex];
  const selectedStageIsCurrent =
    week !== null && week >= selectedStageData.start && week <= selectedStageData.end;

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: space.lg, paddingBottom: space.xxxl, gap: space.xxl }}
      style={{ flex: 1, backgroundColor: theme.background }}>
      <View
        style={{
          minHeight: 182,
          overflow: 'hidden',
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: radius.lg,
          borderCurve: 'continuous',
          backgroundColor: theme.surfaceSoft,
          borderWidth: 1,
          borderColor: 'rgba(81, 37, 184, 0.08)',
        }}>
        <View style={{ flex: 1, padding: space.lg, gap: space.sm }}>
          <Text
            style={{
              color: theme.primary,
              fontSize: typeScale.caption,
              fontWeight: '800',
              letterSpacing: 1,
            }}>
            {t('PREGNANCY CARE')}
          </Text>
          <Text style={{ color: theme.text, fontSize: typeScale.heading, fontWeight: '800', lineHeight: 26 }}>
            {t('Your pregnancy, one step at a time')}
          </Text>
          <Text style={{ color: theme.muted, fontSize: typeScale.small, lineHeight: 20 }}>
            {t('Gentle, general information to help you prepare for conversations with your ANC provider.')}
          </Text>
        </View>
        <Image
          source={prenatalCareImage}
          contentFit="contain"
          accessibilityLabel={t('A midwife supporting an expectant mother')}
          style={{ width: '38%', height: 166, alignSelf: 'flex-end' }}
        />
      </View>

      <View style={{ gap: space.md }}>
        <View style={{ gap: space.xs }}>
          <Text style={{ color: theme.text, fontSize: typeScale.heading, fontWeight: '800' }}>
            {t('Browse by trimester')}
          </Text>
          <Text style={{ color: theme.muted, fontSize: typeScale.small, lineHeight: 19 }}>
            {t('Choose a stage to explore guidance for that part of pregnancy.')}
          </Text>
        </View>
        <View style={{ gap: space.sm }}>
          {stages.map((stage, index) => {
            const selected = stage.title === selectedStage;
            const isCurrent = week !== null && week >= stage.start && week <= stage.end;

            return (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected }}
                key={stage.title}
                onPress={() => setSelectedStage(stage.title)}
                style={({ pressed }) => ({
                  minHeight: 64,
                  paddingHorizontal: space.lg,
                  paddingVertical: space.md,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: space.md,
                  borderRadius: radius.md,
                  borderCurve: 'continuous',
                  backgroundColor: selected ? theme.primarySoft : theme.surface,
                  borderWidth: 1,
                  borderColor: selected ? theme.primary : theme.line,
                  opacity: pressed ? 0.84 : 1,
                })}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: radius.full,
                    backgroundColor: selected ? theme.primary : theme.surfaceSoft,
                  }}>
                  <Text
                    style={{
                      color: selected ? theme.white : theme.primary,
                      fontSize: typeScale.small,
                      fontWeight: '800',
                    }}>
                    {index + 1}
                  </Text>
                </View>
                <View style={{ flex: 1, gap: space.xs }}>
                  <Text style={{ color: theme.text, fontSize: typeScale.body, fontWeight: '800', lineHeight: 20 }}>
                    {t(stage.title)}
                  </Text>
                  <Text style={{ color: theme.muted, fontSize: typeScale.small }}>{t(stage.weeks)}</Text>
                </View>
                {isCurrent ? (
                  <View
                    style={{
                      paddingHorizontal: space.sm,
                      paddingVertical: space.xs,
                      borderRadius: radius.full,
                      backgroundColor: theme.surface,
                    }}>
                    <Text style={{ color: theme.primary, fontSize: typeScale.caption, fontWeight: '800' }}>
                      {t('YOUR STAGE')}
                    </Text>
                  </View>
                ) : null}
                {selected && !isCurrent ? <AppIcon name="check" color={theme.primary} size={20} /> : null}
              </Pressable>
            );
          })}
        </View>
        <SurfaceCard
          tone="soft"
          style={{
            borderWidth: 1,
            borderColor: 'rgba(81, 37, 184, 0.08)',
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
            <View
              style={{
                width: 36,
                height: 36,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: radius.full,
                backgroundColor: theme.surface,
              }}>
              <AppIcon name="pregnancy" color={theme.primary} size={19} />
            </View>
            <View style={{ flex: 1, gap: space.xs }}>
              <Text style={{ color: theme.primary, fontSize: typeScale.caption, fontWeight: '800' }}>
                {t('Stage guidance')}
              </Text>
              <Text style={{ color: theme.text, fontSize: typeScale.body, fontWeight: '800' }}>
                {t(selectedStage)}
              </Text>
            </View>
            {selectedStageIsCurrent ? (
              <Text style={{ color: theme.primary, fontSize: typeScale.caption, fontWeight: '800' }}>
                {t('YOUR STAGE')}
              </Text>
            ) : null}
          </View>
          <Text selectable style={{ color: theme.text, fontSize: typeScale.body, lineHeight: 23 }}>
            {t(stageGuidance[stageIndex])}
          </Text>
        </SurfaceCard>
      </View>

      <View style={{ gap: space.md }}>
        <Text style={{ color: theme.text, fontSize: typeScale.heading, fontWeight: '800' }}>
          {t('Helpful topics')}
        </Text>
        {topics.map((topic) => {
          const expanded = openTopic === topic.title;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              key={topic.title}
              onPress={() => setOpenTopic(expanded ? null : topic.title)}
              style={({ pressed }) => ({
                padding: space.lg,
                gap: space.md,
                borderRadius: radius.md,
                borderCurve: 'continuous',
                backgroundColor: theme.surface,
                borderWidth: 1,
                borderColor: expanded ? theme.primarySoft : theme.line,
                opacity: pressed ? 0.88 : 1,
              })}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: radius.full,
                    backgroundColor: theme.primarySoft,
                  }}>
                  <AppIcon name={topic.icon} color={theme.primary} size={20} />
                </View>
                <Text style={{ flex: 1, color: theme.text, fontSize: typeScale.body, fontWeight: '700' }}>
                  {t(topic.title)}
                </Text>
                <AppIcon name={expanded ? 'close' : 'plus'} color={theme.muted} size={18} />
              </View>
              {expanded ? (
                <Text selectable style={{ color: theme.muted, fontSize: typeScale.small, lineHeight: 21 }}>
                  {t(topic.text)}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <SurfaceCard tone="tint">
        <Text style={{ color: theme.text, fontSize: typeScale.body, fontWeight: '800' }}>
          {t('Need help with a question?')}
        </Text>
        <Text selectable style={{ color: theme.muted, fontSize: typeScale.small, lineHeight: 20 }}>
          {t('MamaBot is an offline information guide, not a medical professional. For personal advice, speak with your ANC provider.')}
        </Text>
        <ActionButton
          title={t('Ask MamaBot')}
          icon="chat"
          variant="secondary"
          onPress={() => router.push('/chat')}
        />
      </SurfaceCard>
    </ScrollView>
  );
}
