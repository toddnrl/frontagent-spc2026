import {
  Activity,
  BarChart3,
  BookOpen,
  Bot,
  Code2,
  FileText,
  GitBranch,
  Server,
  Settings,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { AiCosSection } from "./types";

export type AiSectionItem = {
  section: AiCosSection;
  label: string;
  icon: LucideIcon;
  isReady: boolean;
};

export const aiSectionItems: AiSectionItem[] = [
  { section: "overview", label: "Dashboard", icon: BarChart3, isReady: false },
  { section: "rules", label: "규칙", icon: ShieldCheck, isReady: true },
  { section: "knowledge", label: "지식", icon: BookOpen, isReady: true },
  { section: "tasks", label: "태스크", icon: GitBranch, isReady: true },
  { section: "test", label: "AI Test Chat", icon: Bot, isReady: false },
  { section: "logs", label: "Agent Runs", icon: FileText, isReady: true },
  { section: "monitoring", label: "API Monitoring", icon: Activity, isReady: false },
  { section: "status", label: "Status Page", icon: Server, isReady: false },
  { section: "docs", label: "Developer Docs", icon: Code2, isReady: false },
  { section: "settings", label: "Agent 설정", icon: Settings, isReady: false },
];
