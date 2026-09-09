import { FormField } from "@/types/form";

export type Project = {
  id: string;
  name: string;
  title: string;
  description: string;
  image_url: string | null;
  fields: FormField[];
  created_at: string;
};

export type ProjectSummary = Pick<Project, "id" | "name" | "title" | "created_at">;
