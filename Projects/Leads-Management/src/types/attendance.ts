export type AttendanceRecord = {
  id: string;
  employee_id: string;
  attendance_date: string;
  checked_in_at: string;
  lat: number;
  lng: number;
};

export type AttendanceStatus = {
  employee_id: string;
  name: string;
  phone: string;
  present: boolean;
  checked_in_at: string | null;
};
