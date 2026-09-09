import Image from "next/image";
import leadsLogo from "@/app/logo.jpg";

export default function BrandMark({
  height = 40,
  className = "",
}: {
  height?: number;
  className?: string;
}) {
  return (
    <Image
      src={leadsLogo}
      alt="Leads"
      style={{ height, width: "auto" }}
      className={`shrink-0 rounded-lg shadow-sm ${className}`}
    />
  );
}
