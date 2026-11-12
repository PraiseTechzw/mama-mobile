import * as Location from 'expo-location';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/action-button';
import { AppIcon } from '@/components/app-icon';
import { AppText as Text } from '@/components/app-text';
import { SurfaceCard } from '@/components/surface-card';
import { useTranslation } from '@/utils/i18n';
import {
  distanceToFacility,
  getHealthcareFacility,
  healthcareFacilities,
  type HealthcareFacility,
} from '@/utils/facilities';
import { radius, space, typeScale, useAppTheme } from '@/theme';

type FacilityPickerProps = {
  facilityId: string | null;
  label: string;
  description?: string;
  onSelect: (facility: HealthcareFacility | null) => void;
};

type Coordinates = {
  latitude: number;
  longitude: number;
};

export function FacilityPicker({
  facilityId,
  label,
  description,
  onSelect,
}: FacilityPickerProps) {
  const theme = useAppTheme();
  const t = useTranslation();
  const insets = useSafeAreaInsets();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');
  const selectedFacility = getHealthcareFacility(facilityId);
  const searchStyle = {
    minHeight: 50,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    borderCurve: 'continuous' as const,
    borderWidth: 1,
    borderColor: theme.line,
    backgroundColor: theme.surface,
    color: theme.text,
    fontFamily: 'Nunito_400Regular',
    fontSize: typeScale.body,
  };

  const facilities = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return healthcareFacilities
      .filter((facility) => {
        if (!query) return true;
        const searchableText = [
          facility.id,
          facility.sourceId,
          facility.name,
          facility.type,
          facility.district,
          facility.province,
          facility.ownership,
          facility.yearBuilt,
          facility.updated,
          facility.elevation,
        ]
          .filter((part) => part !== null)
          .join(' ')
          .toLocaleLowerCase();
        return searchableText.includes(query);
      })
      .map((facility) => ({
        facility,
        distanceKm: coordinates
          ? distanceToFacility(coordinates.latitude, coordinates.longitude, facility)
          : null,
      }))
      .sort((left, right) => {
        if (coordinates) {
          const leftDistance = left.distanceKm ?? Number.POSITIVE_INFINITY;
          const rightDistance = right.distanceKm ?? Number.POSITIVE_INFINITY;
          if (leftDistance !== rightDistance) return leftDistance - rightDistance;
        }
        return left.facility.name.localeCompare(right.facility.name);
      });
  }, [coordinates, search]);

  const findNearbyFacilities = async () => {
    setIsLocating(true);
    setLocationMessage('');
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setCoordinates(null);
        setLocationMessage(
          t('Location access was not granted. You can still search all facilities by name, district or province.'),
        );
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setCoordinates({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    } catch (locationError) {
      setCoordinates(null);
      setLocationMessage(
        locationError instanceof Error
          ? `${t('Your location could not be determined')}: ${locationError.message}`
          : t('Your location could not be determined. Search by name, district or province instead.'),
      );
    } finally {
      setIsLocating(false);
    }
  };

  const close = () => setIsOpen(false);

  return (
    <View style={{ gap: space.sm }}>
      <View style={{ gap: space.xs }}>
        <Text style={{ color: theme.text, fontSize: typeScale.small, fontWeight: '700' }}>
          {label}
        </Text>
        {description ? (
          <Text style={{ color: theme.muted, fontSize: typeScale.caption, lineHeight: 18 }}>
            {description}
          </Text>
        ) : null}
      </View>
      <ActionButton
        title={selectedFacility ? selectedFacility.name : t('Find a clinic or health facility')}
        variant="outline"
        icon="medical"
        onPress={() => setIsOpen(true)}
      />
      {selectedFacility ? (
        <SurfaceCard tone="soft" style={{ gap: space.xs }}>
          <Text style={{ color: theme.text, fontSize: typeScale.body, fontWeight: '800' }}>
            {selectedFacility.name}
          </Text>
          <Text style={{ color: theme.muted, fontSize: typeScale.small, lineHeight: 19 }}>
            {[
              selectedFacility.type,
              selectedFacility.district,
              selectedFacility.province,
            ]
              .filter(Boolean)
              .join(' · ')}
          </Text>
          {selectedFacility.updated ? (
            <Text style={{ color: theme.muted, fontSize: typeScale.caption }}>
              {t('Facility record updated {year}', { year: selectedFacility.updated })}
            </Text>
          ) : null}
        </SurfaceCard>
      ) : null}

      <Modal
        animationType="slide"
        onRequestClose={close}
        transparent={false}
        visible={isOpen}>
        <View
          style={{
            flex: 1,
            paddingTop: insets.top + space.md,
            paddingBottom: insets.bottom,
            backgroundColor: theme.background,
          }}>
          <View
            style={{
              paddingHorizontal: space.lg,
              paddingBottom: space.md,
              flexDirection: 'row',
              alignItems: 'center',
              gap: space.md,
            }}>
            <View style={{ flex: 1, gap: space.xs }}>
              <Text style={{ color: theme.text, fontSize: typeScale.heading, fontWeight: '800' }}>
                {t('Choose a clinic or health facility')}
              </Text>
              <Text style={{ color: theme.muted, fontSize: typeScale.small }}>
                {t('{count} facilities in Zimbabwe', { count: healthcareFacilities.length })}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Close facility list')}
              hitSlop={10}
              onPress={close}
              style={({ pressed }) => ({
                width: 44,
                height: 44,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: radius.full,
                backgroundColor: theme.surface,
                opacity: pressed ? 0.65 : 1,
              })}>
              <AppIcon name="close" color={theme.text} size={20} />
            </Pressable>
          </View>

          <View style={{ paddingHorizontal: space.lg, gap: space.sm }}>
            <TextInput
              accessibilityLabel={t('Search facilities by name, type, district or province')}
              autoCorrect={false}
              onChangeText={setSearch}
              placeholder={t('Search facility, district or province')}
              placeholderTextColor={theme.muted}
              returnKeyType="search"
              style={searchStyle}
              value={search}
            />
            <ActionButton
              title={
                isLocating
                  ? t('Finding nearby facilities…')
                  : t('Use my location to find nearby facilities')
              }
              icon="medical"
              variant="secondary"
              disabled={isLocating}
              onPress={() => void findNearbyFacilities()}
            />
            <Text style={{ color: theme.muted, fontSize: typeScale.caption, lineHeight: 18 }}>
              {t('Your location is used only to sort this list. It is not saved or sent anywhere.')}
            </Text>
            {locationMessage ? (
              <Text
                accessibilityLiveRegion="polite"
                style={{ color: theme.danger, fontSize: typeScale.caption, lineHeight: 18 }}>
                {locationMessage}
              </Text>
            ) : null}
            <Text style={{ color: theme.muted, fontSize: typeScale.caption, lineHeight: 18 }}>
              {t('Source: supplied Zimbabwe health facilities master dataset. Record years range from {startYear} to {endYear}; source and current operating status are not verified. Confirm details before traveling.', {
                startYear: '1998',
                endYear: '2013',
              })}
            </Text>
          </View>

          {facilityId ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                onSelect(null);
                close();
              }}
              style={{ paddingHorizontal: space.lg, paddingVertical: space.md }}>
              <Text style={{ color: theme.primary, fontSize: typeScale.small, fontWeight: '700' }}>
                {t('Remove selected facility')}
              </Text>
            </Pressable>
          ) : null}

          <FlatList
            data={facilities}
            keyboardShouldPersistTaps="handled"
            keyExtractor={({ facility }) => facility.id}
            contentContainerStyle={{
              paddingHorizontal: space.lg,
              paddingTop: space.sm,
              paddingBottom: space.xl,
              gap: space.sm,
              flexGrow: facilities.length === 0 ? 1 : undefined,
            }}
            ListEmptyComponent={
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.sm }}>
                <AppIcon name="medical" color={theme.muted} size={26} />
                <Text style={{ color: theme.text, fontSize: typeScale.body, fontWeight: '700' }}>
                  {t('No matching facilities')}
                </Text>
                <Text style={{ color: theme.muted, fontSize: typeScale.small, textAlign: 'center' }}>
                  {t('Try a different facility name, district or province.')}
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              const { facility, distanceKm } = item;
              const locationDetails = [
                facility.type,
                facility.district,
                facility.province,
              ]
                .filter(Boolean)
                .join(' · ');
              const distanceLabel =
                distanceKm === null
                  ? t('Location unavailable')
                  : t('{distance} km away', { distance: distanceKm.toFixed(1) });

              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('Select {name}, {details}', {
                    name: facility.name,
                    details: locationDetails || t('Facility details not listed'),
                  })}
                  onPress={() => {
                    onSelect(facility);
                    close();
                  }}
                  style={({ pressed }) => ({
                    padding: space.md,
                    gap: space.xs,
                    borderRadius: radius.md,
                    borderCurve: 'continuous',
                    borderWidth: 1,
                    borderColor:
                      facility.id === facilityId ? theme.primary : theme.line,
                    backgroundColor:
                      facility.id === facilityId ? theme.primarySoft : theme.surface,
                    opacity: pressed ? 0.82 : 1,
                  })}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                    <Text
                      numberOfLines={2}
                      style={{
                        flex: 1,
                        color: theme.text,
                        fontSize: typeScale.body,
                        fontWeight: '800',
                      }}>
                      {facility.name}
                    </Text>
                    <Text
                      style={{
                        color: coordinates ? theme.primary : theme.muted,
                        fontSize: typeScale.caption,
                        fontWeight: '700',
                      }}>
                      {distanceLabel}
                    </Text>
                  </View>
                  <Text style={{ color: theme.muted, fontSize: typeScale.small }}>
                    {locationDetails || t('Facility details not listed')}
                  </Text>
                  <Text style={{ color: theme.muted, fontSize: typeScale.caption }}>
                    {facility.updated
                      ? t('Facility record updated {year}', { year: facility.updated })
                      : t('Facility record year not provided')}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>
      </Modal>
    </View>
  );
}
