export type Lead = {
  id: string;
  project_id: string;
  employee_id: string | null;
  name: string;
  phone: string;
  answers: Record<string, string>;
  employee_name: string;
  employee_phone: string;
  created_at: string;
};

export type LeadInput = Omit<Lead, "id" | "created_at">;
