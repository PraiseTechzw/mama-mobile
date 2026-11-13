import facilityRecords from '@/data/zimbabwe-facilities.json';

export type HealthcareFacility = {
  id: string;
  sourceId: string | null;
  province: string;
  district: string;
  longitude: number | null;
  latitude: number | null;
  elevation: number | null;
  updated: string | null;
  name: string;
  ownership: string | null;
  yearBuilt: string | null;
  type: string | null;
};

export const healthcareFacilities: readonly HealthcareFacility[] = facilityRecords;
const facilityRecordYears = healthcareFacilities
  .map((facility) => facility.updated)
  .filter((year): year is string => year !== null && /^\d{4}$/.test(year))
  .map(Number);

export const facilityRecordYearRange = {
  startYear: Math.min(...facilityRecordYears),
  endYear: Math.max(...facilityRecordYears),
};

export function getHealthcareFacility(id: string | null | undefined) {
  return id ? healthcareFacilities.find((facility) => facility.id === id) : undefined;
}

export function distanceToFacility(
  latitude: number,
  longitude: number,
  facility: HealthcareFacility,
) {
  if (facility.latitude === null || facility.longitude === null) return null;

  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = radians(facility.latitude - latitude);
  const longitudeDelta = radians(facility.longitude - longitude);
  const arc =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(latitude)) *
      Math.cos(radians(facility.latitude)) *
      Math.sin(longitudeDelta / 2) ** 2;

  return 6371 * 2 * Math.atan2(Math.sqrt(arc), Math.sqrt(1 - arc));
}

export function getNearestHealthcareFacilities(
  latitude: number,
  longitude: number,
  limit = 5,
) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || limit < 1) {
    return [];
  }

  return healthcareFacilities
    .map((facility) => ({
      facility,
      distanceKm: distanceToFacility(latitude, longitude, facility),
    }))
    .filter(
      (item): item is { facility: HealthcareFacility; distanceKm: number } =>
        item.distanceKm !== null,
    )
    .sort((left, right) => left.distanceKm - right.distanceKm)
    .slice(0, Math.floor(limit));
}
