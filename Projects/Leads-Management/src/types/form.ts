export type FieldType = "text" | "select" | "date" | "time";

export type FormField = {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  required: boolean;
};

