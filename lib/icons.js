"use client";

import {
  Compass,
  ListChecks,
  Globe,
  BarChart3,
  TrendingUp,
  Megaphone,
  Users,
  Wallet,
  FileText,
  Leaf,
  Lightbulb,
  Presentation,
  Sparkles,
  MoreHorizontal,
} from "lucide-react";

export const ICONS = {
  Compass,
  ListChecks,
  Globe,
  BarChart3,
  TrendingUp,
  Megaphone,
  Users,
  Wallet,
  FileText,
  Leaf,
  Lightbulb,
  Presentation,
  Sparkles,
  MoreHorizontal,
};

export function CatIcon({ name, size = 18 }) {
  const Icon = ICONS[name] || FileText;
  return <Icon size={size} />;
}
