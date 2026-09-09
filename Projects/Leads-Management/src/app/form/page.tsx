import { Suspense } from "react";
import LeadForm from "@/components/LeadForm";

export default function FormPage() {
  return (
    <Suspense fallback={null}>
      <LeadForm />
    </Suspense>
  );
}
