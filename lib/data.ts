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
    title: "E-Commerce App",
    description:
      "Full online stores with product management, cart, secure checkout, orders tracking, and admin dashboard.",
    category: "ecommerce",
  },
  {
    icon: "👗",
    title: "Brand App",
    description:
      "Luxury brand apps that showcase collections, manage media, and convert visitors into clients.",
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
    title: "Corporate App",
    description:
      "Professional multi-platform corporate apps that establish credibility and generate business leads.",
    category: "corporate",
  },
  {
    icon: "🚀",
    title: "Promo App",
    description:
      "Fast, focused single-platform apps built to attract customers, capture leads, and grow your business.",
    category: "landing",
  },
];

export const pricing: PricingTier[] = [
  {
    name: "Basic App",
    egp: "20,000 – 35,000",
    usd: "$440 – $770",
    description: "Perfect for individuals and small businesses needing a fast, clean web presence.",
    features: [
      "1–3 platform app",
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
    name: "Business App",
    egp: "45,000 – 75,000",
    usd: "$990 – $1,650",
    description: "For growing businesses that need a full professional app with content management.",
    features: [
      "5–10 platform app",
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
    name: "E-Commerce App",
    egp: "75,000 – 110,000",
    usd: "$1,650 – $2,420",
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
    name: "Enterprise App",
    egp: "120,000+",
    usd: "$2,640+",
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
