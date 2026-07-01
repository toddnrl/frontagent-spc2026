import type { User } from "@supabase/supabase-js";
import { useEffect, useMemo, useState, type ReactNode, type UIEvent } from "react";
import {
  Bell,
  Box,
  Check,
  ChevronDown,
  Clock,
  Eye,
  FlaskConical,
  Heart,
  Inbox,
  Mail,
  MessageCircle,
  Phone,
  Search,
  Sparkles,
  Star,
} from "lucide-react";
import { getOrganizationId } from "../../../lib/organization";
import { conversations as mockConversations, teamMembers } from "../data";
import { Avatar } from "../ui/Avatar";
import { TabRow } from "../ui/TabRow";
import type { Conversation } from "../types";
import { fetchConversations } from "./conversationsApi";

const PAGE_SIZE = 100;
const LIST_POLL_INTERVAL_MS = 5000;

const inboxViews = [
  { id: "all", label: "전체", count: "1k", icon: Inbox },
  { id: "unread", label: "안 읽은 메시지", count: "12", icon: Bell },
  { id: "favorite", label: "즐겨찾기", count: "8", icon: Star },
  { id: "session", label: "내 세션", count: "4", icon: Eye },
  { id: "scheduled", label: "예약 메시지", count: "6", icon: Clock },
  { id: "preview", label: "미리보기", count: "", icon: FlaskConical },
  { id: "alf", label: "고객 ALF", count: "18", icon: Sparkles },
  { id: "queue-total", label: "누적", count: "3", icon: Star },
  { id: "queue-expert", label: "엑스퍼트", count: "5", icon: Heart },
  { id: "queue-product", label: "제품", count: "2", icon: Box },
  { id: "service-chat", label: "채널톡 메시지", count: "102", icon: MessageCircle },
  { id: "service-phone", label: "전화", count: "22", icon: Phone },
  { id: "service-email", label: "이메일", count: "35", icon: Mail },
] as const;

type InboxViewId = (typeof inboxViews)[number]["id"];

const mainViewIds: InboxViewId[] = [
  "all",
  "unread",
  "favorite",
  "session",
  "scheduled",
  "preview",
];

const queueViewIds: InboxViewId[] = [
  "queue-total",
  "queue-expert",
  "queue-product",
];

const serviceViewIds: InboxViewId[] = [
  "service-chat",
  "service-phone",
  "service-email",
];

function getVisibleConversations(
  viewId: InboxViewId,
  conversations: Conversation[],
): Conversation[] {
  if (viewId === "preview") return conversations.filter((conversation) => conversation.isInternalTest);

  const withoutPreview = conversations.filter((conversation) => !conversation.isInternalTest);

  if (viewId === "unread") return withoutPreview.slice(0, 2);
  if (viewId === "favorite") return withoutPreview.filter((conversation) => conversation.id === "park-jieun");
  if (viewId === "scheduled") return withoutPreview.filter((conversation) => conversation.id === "oh-yejin");
  if (viewId === "service-phone") return withoutPreview.filter((conversation) => conversation.channel === "전화");
  if (viewId === "service-email") return withoutPreview.filter((conversation) => conversation.channel === "이메일");
  if (viewId === "service-chat") return withoutPreview.filter((conversation) => conversation.channel !== "전화" && conversation.channel !== "이메일");

  return withoutPreview;
}

function getInboxView(id: InboxViewId) {
  return inboxViews.find((view) => view.id === id) ?? inboxViews[0];
}

function SidebarGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-5 border-t border-gray-200/80 pt-5">
      <button className="mb-2 flex items-center gap-1 text-[13px] font-bold text-gray-500">
        {title}
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>
      <div className="grid gap-1">{children}</div>
    </div>
  );
}

export function ConversationList({
  selectedId,
  onSelect,
  user,
}: {
  selectedId: string;
  onSelect: (id: string, conversation: Conversation) => void;
  user: User;
}) {
  const [selectedInboxView, setSelectedInboxView] =
    useState<InboxViewId>("all");
  const [liveConversations, setLiveConversations] = useState<Conversation[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const organizationId = getOrganizationId(user);

  useEffect(() => {
    let isMounted = true;

    function load() {
      return fetchConversations(organizationId)
        .then((items) => {
          if (isMounted) setLiveConversations(items);
        })
        .catch(() => {
          if (isMounted) setLiveConversations([]);
        });
    }

    load();
    const intervalId = window.setInterval(load, LIST_POLL_INTERVAL_MS);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [organizationId]);

  const conversations = useMemo(
    () => [...liveConversations, ...mockConversations],
    [liveConversations],
  );
  const activeInboxView =
    inboxViews.find((view) => view.id === selectedInboxView) ?? inboxViews[0];
  const filteredConversations = useMemo(
    () => getVisibleConversations(selectedInboxView, conversations),
    [selectedInboxView, conversations],
  );
  const visibleConversations = filteredConversations.slice(0, visibleCount);
  const displayName = user.user_metadata?.name ?? user.email ?? "관리자";

  function handleListScroll(event: UIEvent<HTMLDivElement>) {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 120) {
      setVisibleCount((count) => Math.min(count + PAGE_SIZE, filteredConversations.length));
    }
  }
  const renderSidebarButton = (id: InboxViewId) => {
    const view = getInboxView(id);
    const Icon = view.icon;

    return (
      <button
        key={id}
        onClick={() => {
          setSelectedInboxView(id);
          setVisibleCount(PAGE_SIZE);
        }}
        className={`flex w-full items-center justify-between rounded-[12px] px-3 py-2.5 text-left text-[14px] font-bold ${
          selectedInboxView === id
            ? "bg-[#e8e8e8] text-gray-950"
            : "text-gray-600 hover:bg-white"
        }`}
      >
        <span className="flex min-w-0 items-center gap-2">
          <Icon className="h-4 w-4 shrink-0" />
          <span className="truncate">{view.label}</span>
        </span>
        <span className="text-[12px] text-gray-400">{view.count}</span>
      </button>
    );
  };

  return (
    <section className="grid min-h-0 min-w-0 overflow-hidden rounded-[20px] bg-[#fafafa] grid-cols-[230px_minmax(0,1fr)]">
      <aside className="min-w-0 overflow-y-auto border-r border-gray-200/80 px-5 py-7">
        <div className="mb-7 flex items-center justify-between">
          <h2 className="text-[20px] font-bold">수신함</h2>
          <ChevronDown className="h-5 w-5 text-gray-400" />
        </div>

        <div className="mb-5 flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar label={displayName[0]?.toUpperCase() ?? "U"} />
            <span className="truncate text-[15px] font-bold">{displayName}</span>
          </div>
        </div>

        <div className="grid gap-1">
          {mainViewIds.map((id) => renderSidebarButton(id))}
        </div>

        <SidebarGroup title="대기열">
          {queueViewIds.map((id) => renderSidebarButton(id))}
        </SidebarGroup>

        <SidebarGroup title="담당자">
          {teamMembers.map(([name, count, avatar]) => (
            <button
              key={name}
              onClick={() => setSelectedInboxView("all")}
              className="flex w-full items-center justify-between rounded-[12px] px-3 py-2.5 text-left text-[14px] font-bold text-gray-600 hover:bg-white"
            >
              <span className="flex min-w-0 items-center gap-2">
                <Avatar label={avatar} size="sm" />
                <span className="truncate">{name}</span>
              </span>
              <span className="text-[12px] text-gray-400">{count}</span>
            </button>
          ))}
          <button className="mt-1 flex w-full items-center gap-2 rounded-[12px] px-3 py-2.5 text-left text-[14px] font-bold text-gray-700 hover:bg-white">
            <span className="text-xl leading-none">＋</span>
            팀 멤버 초대
          </button>
        </SidebarGroup>

        <SidebarGroup title="서비스">
          {serviceViewIds.map((id) => renderSidebarButton(id))}
        </SidebarGroup>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-col px-4 py-7">
        <div className="mb-7 flex items-center justify-between">
          <h3 className="text-[18px] font-bold">{activeInboxView.label}</h3>
          <div className="flex gap-3 text-gray-500">
            <Search className="h-5 w-5" />
            <Check className="h-5 w-5" />
            <ChevronDown className="h-5 w-5" />
          </div>
        </div>

        <div className="mb-4">
          <div className="mb-3">
            <TabRow tabs={["진행중", "보류중", "부재중", "종료됨"]} />
          </div>
          <div className="flex items-center justify-between px-1">
            <h4 className="text-sm font-bold text-gray-500">채팅방</h4>
            <span className="text-xs font-bold text-gray-400">
              {visibleConversations.length}/{filteredConversations.length}개 · 최근순
            </span>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1" onScroll={handleListScroll}>
          {visibleConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => onSelect(conversation.id, conversation)}
              className={`w-full rounded-[16px] p-3 text-left transition-colors ${
                selectedId === conversation.id ? "bg-[#e9e9e9]" : "hover:bg-white"
              }`}
            >
              <div className="flex gap-3">
                <Avatar label={conversation.avatar} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <div className="truncate text-[15px] font-bold">
                      {conversation.customer}
                      <span className="ml-2 text-[12px] text-gray-400">
                        · {conversation.assignee}
                      </span>
                    </div>
                    <span className="text-[12px] text-gray-400">{conversation.time}</span>
                  </div>
                  <p className="truncate text-[13px] font-medium text-gray-500">
                    {conversation.preview}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {conversation.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[#eadfd8] px-2 py-0.5 text-[11px] font-bold text-[#7a5b4a]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
