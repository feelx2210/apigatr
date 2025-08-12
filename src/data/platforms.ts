
import { Platform } from "@/types/platform";

export const platforms: Platform[] = [
  {
    id: "wordpress",
    name: "WordPress",
    description: "Create plugins for WordPress websites and WooCommerce stores",
    logo: "🔷",
    features: ["Custom post types", "Admin dashboard", "Shortcodes", "Widgets"],
    requirements: ["PHP knowledge helpful", "WordPress hooks", "Database integration"]
  },
  {
    id: "shopify",
    name: "Shopify",
    description: "Build apps for Shopify stores and merchants",
    logo: "🛍️",
    features: ["Store integration", "Product management", "Order processing", "Customer data"],
    requirements: ["Shopify API", "Webhook handling", "App store approval"]
  },
  {
    id: "bubble",
    name: "Bubble.io",
    description: "Create plugins for no-code Bubble applications",
    logo: "🫧",
    features: ["Visual elements", "Actions", "Data sources", "API connections"],
    requirements: ["Bubble plugin editor", "JavaScript knowledge", "Element definitions"]
  },
  {
    id: "webflow",
    name: "Webflow",
    description: "Develop custom components and integrations for Webflow",
    logo: "🌊",
    features: ["Custom code", "CMS integration", "E-commerce", "Form handling"],
    requirements: ["HTML/CSS/JS", "Webflow CMS", "Custom code blocks"]
  },
  {
    id: "figma",
    name: "Figma",
    description: "Build plugins that connect your API to Figma",
    logo: "🎨",
    features: ["UI panels", "Network requests (UI)", "Client storage", "Commands"],
    requirements: ["Figma Plugin API", "Manifest v2", "HTML/CSS/JS"]
  },
  {
    id: "make",
    name: "Make.com",
    description: "Create modules for visual automation scenarios",
    logo: "🔧",
    features: ["Modules", "Connections", "Webhooks", "Data mapping"],
    requirements: ["API documentation", "Make CLI", "Module definitions"]
  }
];
