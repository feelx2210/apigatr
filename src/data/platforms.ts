
import { Platform } from "@/types/platform";

export const platforms: Platform[] = [
  {
    id: "wordpress",
    name: "WordPress",
    description: "Create powerful plugins for WordPress websites and WooCommerce stores",
    logo: "📝",
    features: ["Custom post types", "Admin dashboard", "Shortcodes", "Widgets"],
    requirements: ["PHP knowledge helpful", "WordPress hooks", "Database integration"]
  },
  {
    id: "shopify",
    name: "Shopify",
    description: "Build apps for Shopify stores and merchants with seamless integration",
    logo: "🛍️",
    features: ["Store integration", "Product management", "Order processing", "Customer data"],
    requirements: ["Shopify API", "Webhook handling", "App store approval"]
  },
  {
    id: "figma",
    name: "Figma",
    description: "Build plugins that connect your API to Figma design workflows",
    logo: "🐊",
    features: ["UI panels", "Network requests (UI)", "Client storage", "Commands"],
    requirements: ["Figma Plugin API", "Manifest v2", "HTML/CSS/JS"]
  }
];
