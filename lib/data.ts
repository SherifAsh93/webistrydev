import projectsData from "./projects-data.json";

export type Project = {
  id: string;
  name: string;
  description: string;
  category: "fashion" | "ecommerce" | "clinic" | "web-app" | "corporate" | "landing";
  categoryLabel: string;
  categoryColor: string;
  tags: string[];
  url: string;
  screenshot: string;
  featured: boolean;
};

export type ServiceItem = {
  icon: string;
  title: string;
  description: string;
  category: string;
};

export type PricingTier = {
  name: string;
  egp: string;
  usd: string;
  description: string;
  features: string[];
  timeline: string;
  popular: boolean;
  color: string;
};

export const projects: Project[] = projectsData as Project[];

export const services: ServiceItem[] = [
  {
    icon: "🛍",
    title: "E-Commerce Stores",
    description:
      "Full online stores with product management, cart, secure checkout, orders tracking, and admin dashboard.",
    category: "ecommerce",
  },
  {
    icon: "👗",
    title: "Brand & Fashion Sites",
    description:
      "Luxury brand websites that showcase collections, manage media, and convert visitors into clients.",
    category: "fashion",
  },
  {
    icon: "🏥",
    title: "Medical & Clinic Apps",
    description:
      "End-to-end clinic management systems: appointments, patient records, billing, and doctor portals.",
    category: "clinic",
  },
  {
    icon: "⚙️",
    title: "Custom Web Applications",
    description:
      "Powerful web apps with authentication, dashboards, real-time data, and complex business logic.",
    category: "web-app",
  },
  {
    icon: "💼",
    title: "Corporate Websites",
    description:
      "Professional multi-page corporate sites that establish credibility and generate business leads.",
    category: "corporate",
  },
  {
    icon: "🚀",
    title: "Promotional Pages",
    description:
      "Fast, focused single-page websites built to attract customers, capture leads, and grow your business.",
    category: "landing",
  },
];

export const pricing: PricingTier[] = [
  {
    name: "Starter",
    egp: "5,000 – 10,000",
    usd: "$110 – $220",
    description: "Perfect for individuals and small businesses needing a fast, clean web presence.",
    features: [
      "1–3 page website",
      "Mobile-responsive design",
      "Contact form",
      "Basic SEO setup",
      "Fast, secure hosting",
      "2 revision rounds",
    ],
    timeline: "1 – 2 weeks",
    popular: false,
    color: "from-slate-600 to-slate-700",
  },
  {
    name: "Business",
    egp: "15,000 – 30,000",
    usd: "$330 – $660",
    description: "For growing businesses that need a full professional website with content management.",
    features: [
      "5–10 page website",
      "Custom design system",
      "CMS / Admin panel",
      "SEO optimized",
      "Performance & analytics",
      "3 revision rounds",
      "30 days post-launch support",
    ],
    timeline: "3 – 4 weeks",
    popular: true,
    color: "from-violet-600 to-purple-700",
  },
  {
    name: "Online Store",
    egp: "28,000 – 55,000",
    usd: "$620 – $1,220",
    description: "A complete online store — sell your products globally with a professional storefront.",
    features: [
      "Full product catalog",
      "Cart & secure checkout",
      "Order management",
      "Admin dashboard",
      "Inventory tracking",
      "Mobile-first design",
      "Unlimited revisions during build",
      "60 days post-launch support",
    ],
    timeline: "5 – 6 weeks",
    popular: false,
    color: "from-amber-600 to-orange-700",
  },
  {
    name: "Custom App",
    egp: "38,000+",
    usd: "$840+",
    description: "Complex web applications with advanced features, databases, and business logic.",
    features: [
      "Custom architecture",
      "Authentication & roles",
      "Real-time features",
      "Complex database design",
      "API integrations",
      "Full test coverage",
      "Unlimited revisions",
      "90 days post-launch support",
    ],
    timeline: "6+ weeks",
    popular: false,
    color: "from-teal-600 to-emerald-700",
  },
];
