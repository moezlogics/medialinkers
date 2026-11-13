import type { ComponentType, SVGProps } from "react";
import brand from "./brand-icons.json";
import {
  BarChart3, LineChart, Search, Megaphone, PenTool, Code2, MousePointerClick, Sparkles, Rocket, Target, Users, Globe,
  ShoppingCart, HeartPulse, Plane, Car, Scale, Landmark, Gem, Clapperboard, GraduationCap, HardHat, Mic, MapPin,
  Link2, FileText, Wrench, Smartphone, Palette, Layers, Mail, Phone, Zap, ShieldCheck, Award, TrendingUp, PieChart,
  Lightbulb, Settings, MessageCircle, Bot, Store, Building2, Camera, Video, Star, CheckCircle2, Clock, Gauge,
  Repeat, LayoutTemplate, MonitorSmartphone, Newspaper, Briefcase, Handshake, Eye, Brain, Coffee, Home, Utensils,
} from "lucide-react";

type IconComp = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;

const BRAND = brand as Record<string, { viewBox: string; paths: string[] }>;
const BRAND_LABELS: Record<string, string> = {
  "google-analytics": "Google Analytics", facebook: "Facebook", "google-ads": "Google Ads", javascript: "JavaScript", writedotas: "Write (W.)",
  instagram: "Instagram", linkedin: "LinkedIn", x: "X / Twitter", youtube: "YouTube", tiktok: "TikTok", whatsapp: "WhatsApp", shopify: "Shopify",
  wordpress: "WordPress", woocommerce: "WooCommerce", meta: "Meta", google: "Google", "search-console": "Search Console", "google-maps": "Google Maps",
  nextjs: "Next.js", react: "React", figma: "Figma", mailchimp: "Mailchimp",
};

function brandIcon(key: string): IconComp {
  const def = BRAND[key];
  const C = ({ size, ...props }: SVGProps<SVGSVGElement> & { size?: number | string }) => (
    <svg viewBox={def.viewBox} fill="currentColor" width={size ?? "1em"} height={size ?? "1em"} {...props}>
      {def.paths.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
  C.displayName = `Brand(${key})`;
  return C;
}

export const ICONS: Record<string, { label: string; icon: IconComp; group: "brand" | "ui" | "industry" }> = {
  ...Object.fromEntries(Object.keys(BRAND).map((k) => [k, { label: BRAND_LABELS[k] || k, icon: brandIcon(k), group: "brand" as const }])),
  // Brand-style icons (used in the hero service circles) come from brand-icons.json
  // General
  "bar-chart": { label: "Bar chart", icon: BarChart3, group: "ui" },
  "line-chart": { label: "Line chart", icon: LineChart, group: "ui" },
  "pie-chart": { label: "Pie chart", icon: PieChart, group: "ui" },
  "trending-up": { label: "Trending up", icon: TrendingUp, group: "ui" },
  search: { label: "Search", icon: Search, group: "ui" },
  megaphone: { label: "Megaphone", icon: Megaphone, group: "ui" },
  pen: { label: "Pen", icon: PenTool, group: "ui" },
  code: { label: "Code", icon: Code2, group: "ui" },
  click: { label: "Click", icon: MousePointerClick, group: "ui" },
  sparkles: { label: "Sparkles", icon: Sparkles, group: "ui" },
  rocket: { label: "Rocket", icon: Rocket, group: "ui" },
  target: { label: "Target", icon: Target, group: "ui" },
  users: { label: "Users", icon: Users, group: "ui" },
  globe: { label: "Globe", icon: Globe, group: "ui" },
  link: { label: "Link", icon: Link2, group: "ui" },
  file: { label: "Document", icon: FileText, group: "ui" },
  wrench: { label: "Wrench", icon: Wrench, group: "ui" },
  smartphone: { label: "Smartphone", icon: Smartphone, group: "ui" },
  responsive: { label: "Responsive", icon: MonitorSmartphone, group: "ui" },
  palette: { label: "Palette", icon: Palette, group: "ui" },
  layers: { label: "Layers", icon: Layers, group: "ui" },
  layout: { label: "Layout", icon: LayoutTemplate, group: "ui" },
  mail: { label: "Mail", icon: Mail, group: "ui" },
  phone: { label: "Phone", icon: Phone, group: "ui" },
  zap: { label: "Zap", icon: Zap, group: "ui" },
  shield: { label: "Shield", icon: ShieldCheck, group: "ui" },
  award: { label: "Award", icon: Award, group: "ui" },
  lightbulb: { label: "Idea", icon: Lightbulb, group: "ui" },
  settings: { label: "Settings", icon: Settings, group: "ui" },
  chat: { label: "Chat", icon: MessageCircle, group: "ui" },
  bot: { label: "AI / Bot", icon: Bot, group: "ui" },
  brain: { label: "Brain", icon: Brain, group: "ui" },
  mic: { label: "Voice", icon: Mic, group: "ui" },
  "map-pin": { label: "Map pin", icon: MapPin, group: "ui" },
  camera: { label: "Camera", icon: Camera, group: "ui" },
  video: { label: "Video", icon: Video, group: "ui" },
  star: { label: "Star", icon: Star, group: "ui" },
  check: { label: "Check", icon: CheckCircle2, group: "ui" },
  clock: { label: "Clock", icon: Clock, group: "ui" },
  gauge: { label: "Speed", icon: Gauge, group: "ui" },
  repeat: { label: "Repeat", icon: Repeat, group: "ui" },
  newspaper: { label: "News", icon: Newspaper, group: "ui" },
  briefcase: { label: "Briefcase", icon: Briefcase, group: "ui" },
  handshake: { label: "Handshake", icon: Handshake, group: "ui" },
  eye: { label: "Eye", icon: Eye, group: "ui" },
  coffee: { label: "Coffee", icon: Coffee, group: "ui" },
  // Industries
  ecommerce: { label: "E-commerce", icon: ShoppingCart, group: "industry" },
  healthcare: { label: "Healthcare", icon: HeartPulse, group: "industry" },
  travel: { label: "Travel", icon: Plane, group: "industry" },
  automotive: { label: "Automotive", icon: Car, group: "industry" },
  legal: { label: "Legal", icon: Scale, group: "industry" },
  financial: { label: "Financial", icon: Landmark, group: "industry" },
  beauty: { label: "Beauty", icon: Gem, group: "industry" },
  entertainment: { label: "Entertainment", icon: Clapperboard, group: "industry" },
  education: { label: "Education", icon: GraduationCap, group: "industry" },
  construction: { label: "Construction", icon: HardHat, group: "industry" },
  store: { label: "Retail", icon: Store, group: "industry" },
  "real-estate": { label: "Real estate", icon: Building2, group: "industry" },
  home: { label: "Home", icon: Home, group: "industry" },
  food: { label: "Food", icon: Utensils, group: "industry" },
};

export function Icon({ name, className, size }: { name?: string; className?: string; size?: number }) {
  const entry = (name && ICONS[name]) || ICONS.sparkles;
  const C = entry.icon;
  return <C className={className} size={size} aria-hidden="true" />;
}
