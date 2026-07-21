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

export const projects: Project[] = [
  {
    id: "ahmed-elakad",
    name: "Ahmed El Akad",
    description:
      "Luxury couture brand website for Cairo's premier fashion designer. Custom gallery, collection management, and appointment booking system.",
    category: "fashion",
    categoryLabel: "Fashion Brand",
    categoryColor: "from-rose-500 to-pink-600",
    tags: ["Next.js", "Cloudinary", "VPS", "Full-Stack"],
    url: "https://ahmedelakad.com",
    screenshot: "/projects/ahmed-elakad.png",
    featured: true,
  },
  {
    id: "furniture-studio",
    name: "Furniture Studio",
    description:
      "Premium architectural furniture marketplace with full e-commerce: product management, cart, orders, and a powerful admin dashboard.",
    category: "ecommerce",
    categoryLabel: "E-Commerce",
    categoryColor: "from-amber-500 to-orange-600",
    tags: ["Next.js", "Neon DB", "Admin Panel", "Full-Stack"],
    url: "https://furniture-studio-fs.vercel.app/",
    screenshot: "/projects/furniture-studio.png",
    featured: true,
  },
  {
    id: "zahrtelkhlig",
    name: "Zahrtelkhlig",
    description:
      "Full-featured hijab fashion e-commerce — product catalog, size picker, wishlist, cart, checkout, order tracking, POS system, and a complete admin panel. Built mobile-first so it feels like a native app.",
    category: "ecommerce",
    categoryLabel: "E-Commerce",
    categoryColor: "from-amber-500 to-orange-600",
    tags: ["Next.js", "PostgreSQL", "Mobile-First", "POS System"],
    url: "https://zahrtelkhlig.vercel.app/",
    screenshot: "/projects/zahrtelkhlig.png",
    featured: true,
  },
  {
    id: "batrawy-clinic",
    name: "Al-Batrawy Clinic",
    description:
      "Full clinic management system — patient records, appointment scheduling, billing, and doctor dashboard. Accessible from any mobile device like a native app.",
    category: "clinic",
    categoryLabel: "Web App",
    categoryColor: "from-teal-500 to-emerald-600",
    tags: ["Next.js", "Drizzle ORM", "Web App", "Healthcare"],
    url: "https://batrawy-clinic.vercel.app",
    screenshot: "/projects/batrawy-clinic.png",
    featured: false,
  },
  {
    id: "ameer-dental",
    name: "Ameer Dental",
    description:
      "Dental clinic platform with smart appointment booking, patient management, and treatment tracking — runs seamlessly on any phone browser.",
    category: "clinic",
    categoryLabel: "Web App",
    categoryColor: "from-teal-500 to-emerald-600",
    tags: ["Next.js", "Tailwind", "Mobile-First", "Clinic"],
    url: "https://ameer-dental-clinic.vercel.app",
    screenshot: "/projects/ameer-dental.png",
    featured: false,
  },
  {
    id: "elghaly-vr",
    name: "Elghaly VR",
    description:
      "Innovative AR room visualizer — captures real-world colors from your mobile camera and paints virtual rooms in real-time.",
    category: "web-app",
    categoryLabel: "Web App",
    categoryColor: "from-violet-500 to-purple-600",
    tags: ["Next.js", "Camera API", "WebRTC", "AR/VR"],
    url: "https://elghaly-vr.vercel.app/",
    screenshot: "/projects/elghaly-vr.png",
    featured: false,
  },
  {
    id: "qoya-furniture",
    name: "QOYA Furniture",
    description:
      "Ultra-luxury furniture brand website for one of Cairo's premium showrooms. Fullscreen editorial design, auto-cycling hero slider, 90+ product images, contact inquiry system, and two-branch store locator.",
    category: "corporate",
    categoryLabel: "Luxury Brand",
    categoryColor: "from-amber-700 to-yellow-800",
    tags: ["Next.js", "Tailwind CSS", "Neon DB", "Editorial Design"],
    url: "https://qoya-furniture.vercel.app",
    screenshot: "/projects/qoya-furniture.png",
    featured: true,
  },
  {
    id: "montelle-couture",
    name: "Montelle Couture",
    description:
      "Luxury bridal fashion e-commerce store — veils, robes, corsets, and bridal sets with full product management, cart, checkout, appointment booking, and an admin dashboard.",
    category: "ecommerce",
    categoryLabel: "E-Commerce",
    categoryColor: "from-amber-500 to-orange-600",
    tags: ["Next.js", "Prisma", "Neon DB", "Luxury Bridal"],
    url: "https://montelle-couture.vercel.app",
    screenshot: "/projects/montelle-couture.png",
    featured: true,
  },
  {
    id: "mr-mohammed",
    name: "Mr. Mohammed",
    description:
      "Full-stack teacher website — educational materials by grade, weekly schedule, student results search, and a hidden admin panel (logo ×3 → password). Full CRUD admin for materials, grades, and schedule.",
    category: "web-app",
    categoryLabel: "Web App",
    categoryColor: "from-indigo-500 to-blue-700",
    tags: ["Next.js", "PostgreSQL", "Arabic RTL", "Admin Panel"],
    url: "https://mr-mohammed-gamma.vercel.app",
    screenshot: "/projects/mr-mohammed.png",
    featured: false,
  },
  {
    id: "olympia-beach-club",
    name: "Olympia Beach Club",
    description:
      "Mobile-first beach club app — facility booking, event registration, membership plans, and a smooth native-app feel. Built as a pitch demo for a New Damietta beach club.",
    category: "web-app",
    categoryLabel: "Web App",
    categoryColor: "from-sky-500 to-cyan-600",
    tags: ["Next.js", "Framer Motion", "Mobile-First", "Arabic/English"],
    url: "https://olympia-club-sherifs-projects-75c57a99.vercel.app",
    screenshot: "/projects/olympia-beach-club.png",
    featured: false,
  },
];

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
