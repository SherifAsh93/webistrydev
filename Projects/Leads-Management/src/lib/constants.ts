export const UNIT_TYPES = ["إداري", "تجاري", "سكني"] as const;

// Office location for automatic GPS attendance.
export const ATTENDANCE_LOCATION = {
  lat: 31.434101,
  lng: 31.68293,
  radiusMeters: 20,
} as const;

// The admin panel currently has one shared login for the company manager.
export const MANAGER_NAME = "رنا";

export const DAYS = [
  "سبت",
  "أحد",
  "اثنين",
  "ثلاثاء",
  "أربعاء",
  "خميس",
  "جمعة",
] as const;
