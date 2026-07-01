import type { User } from "@supabase/supabase-js";
import {
  AlertTriangle,
  CalendarClock,
  Check,
  ChevronDown,
  Headphones,
  Inbox,
  Mail,
  Megaphone,
  MessageCircle,
  Mic,
  MoreVertical,
  PanelRight,
  Phone,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Star,
  Tag,
  Users,
  Volume2,
} from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { getOrganizationId } from "../../../lib/organization";
import { conversations } from "../data";
import type {
  AiCall,
  AiCallStatus,
  AvailableSlot,
  BookingSetting,
  CustomerSection,
  Reservation,
  Service,
  ServiceAdminItem,
  ServiceItem,
  ServiceItemOption,
  ServicePriceCalculation,
} from "../types";
import {
  ChecklistItem,
  DetailIntro,
  DetailRow,
  DetailSection,
  DetailSidebar,
  InfoCard,
  SectionHeading,
  StatusPill,
  TimelineItem,
} from "../ui/DashboardUI";
import { Avatar } from "../ui/Avatar";
import { Button, Modal, ModalActions, Toggle } from "../ui";
import { TabRow } from "../ui/TabRow";
import {
  cancelReservation,
  approveService,
  applyPendingService,
  calculateServicePrice,
  confirmReservation,
  createService,
  createServiceItem,
  createServiceItemOption,
  deactivateService,
  deleteService,
  deleteServiceItem,
  deleteServiceItemOption,
  fetchAvailableSlots,
  fetchBookingSetting,
  fetchPendingServices,
  fetchReservations,
  fetchReviewServices,
  fetchServices,
  fetchServiceItemOptions,
  fetchServiceItems,
  fetchStaleServices,
  ignorePendingService,
  rejectReservation,
  rejectService,
  updateServiceActive,
  updateService,
  updateServiceItem,
  updateServiceItemOption,
} from "./reservationsApi";
import type { ServiceInput, ServiceItemInput, ServiceItemOptionInput } from "./reservationsApi";
import { fetchConversationMessages, fetchConversations } from "./conversationsApi";
import type { Conversation } from "../types";

const CALLS_POLL_INTERVAL_MS = 5000;

function formatCallDurationLabel(seconds?: number | null) {
  if (seconds == null) return "진행중";
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}:${String(remaining).padStart(2, "0")}`;
}

function callToAiCall(call: Conversation): AiCall {
  // call_started_at이 없는 통화는 통화 종료 기록 기능을 붙이기 전에 생성된
  // 과거 데이터라 진행/종료 여부를 판단할 수 없다. agent-connected로 구분해
  // "AI 통화중"과 섞이지 않게 한다.
  const status: AiCallStatus = !call.callStartedAt
    ? "agent-connected"
    : call.callEndedAt
      ? "callback"
      : "ai-answering";

  return {
    id: call.id,
    customer: call.customer,
    phone: "",
    status,
    intent: "",
    sentiment: "normal",
    aiAgent: "Front Agent",
    owner: call.assignee,
    duration: formatCallDurationLabel(call.callDurationSeconds),
    transcript: [],
    summary: call.preview,
    nextAction: "",
    task: "",
    canTakeOver: status === "ai-answering",
  };
}

const aiCalls: AiCall[] = [
  {
    id: "call-1042",
    customer: "박지은",
    phone: "+82 10-****-1234",
    status: "handoff-ready",
    intent: "환불 지연 불만",
    sentiment: "critical",
    aiAgent: "ALF Voice",
    owner: "이지현",
    duration: "04:18",
    transcript: [
      "고객: 2주 전에 반품 접수했는데 아직 환불이 안 됐어요.",
      "AI: 확인해보니 환불 처리가 누락된 상태입니다. 바로 담당자에게 연결해드릴게요.",
      "고객: 시스템 오류라고만 하지 말고 지금 처리해주세요.",
    ],
    summary:
      "반품 접수 후 환불 누락으로 강한 불만. 보상 적립금과 즉시 환불 처리가 필요합니다.",
    nextAction: "상담사가 지금 통화를 이어받아 환불 접수 API와 보상 기준을 확인",
    task: "환불 접수 · Step D",
    canTakeOver: true,
  },
  {
    id: "call-1041",
    customer: "오예진",
    phone: "+82 10-****-4482",
    status: "ai-answering",
    intent: "예약 변경",
    sentiment: "normal",
    aiAgent: "ALF Voice",
    owner: "AI 처리중",
    duration: "01:42",
    transcript: [
      "고객: 오늘 예약 시간을 5시로 바꿀 수 있을까요?",
      "AI: 예약 정보를 확인하겠습니다. 성함이 오예진 고객님 맞으실까요?",
      "고객: 네 맞아요.",
    ],
    summary: "예약 변경 의도 명확. 고객 확인 완료 후 가능 시간 조회 단계로 진행 중입니다.",
    nextAction: "AI가 예약 가능 시간 조회 후 고객 확인",
    task: "예약 변경 · Step C",
    canTakeOver: true,
  },
  {
    id: "call-1040",
    customer: "이종혁",
    phone: "+82 10-****-9320",
    status: "callback",
    intent: "배송 조회",
    sentiment: "warning",
    aiAgent: "ALF Voice",
    owner: "김수현",
    duration: "00:36",
    transcript: [
      "고객: 배송이 계속 멈춰있는데 확인 부탁드립니다.",
      "AI: 송장 상태를 조회하고 있습니다. 확인 후 콜백으로 안내드리겠습니다.",
    ],
    summary: "배송 지연 문의. 송장 조회 도구 응답이 지연되어 콜백 큐로 전환되었습니다.",
    nextAction: "송장 조회 재시도 후 10분 내 콜백",
    task: "배송 조회 · Tool retry",
    canTakeOver: false,
  },
];

const callStatusLabel: Record<AiCallStatus, string> = {
  "ai-answering": "AI 통화중",
  "handoff-ready": "이어받기 필요",
  "agent-connected": "기록 없음",
  callback: "종료됨",
};

type OperationTone = "green" | "blue" | "amber" | "red" | "gray";

type OperationsItem = {
  id: string;
  title: string;
  owner: string;
  description: string;
  status: string;
  tone: OperationTone;
  meta: string;
  avatar: string;
  badges?: Array<{ label: string; tone: OperationTone }>;
};

type SidebarView = {
  label: string;
  count: string;
  icon: ReactNode;
  active?: boolean;
  onClick?: () => void;
};

type AppointmentView = "calendar" | "reservations";
type ReservationFilter = "all" | "requested" | "recent" | "confirmed" | "cancelled_rejected";

export function CustomerOperationsWorkspace({
  activeSection,
  user,
}: {
  activeSection: Exclude<CustomerSection, "conversations">;
  user: User;
}) {
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  return (
    <>
      {activeSection === "customers" && <CustomersMain />}
      {activeSection === "appointments" && (
        <AppointmentsMain
          user={user}
          selectedReservation={selectedReservation}
          onSelectReservation={setSelectedReservation}
        />
      )}
      {activeSection === "campaigns" && (
        <ServicesMain
          user={user}
          selectedService={selectedService}
          onSelectService={setSelectedService}
        />
      )}
      {activeSection === "outbound" && <OutboundMain />}
      {activeSection === "calls" && <CallsMain user={user} />}
      {activeSection === "appointments" ? (
        <ReservationDetailPanel reservation={selectedReservation} />
      ) : activeSection === "campaigns" ? (
        <ServiceDetailPanel service={selectedService} />
      ) : (
        <CustomerDetailPanel activeSection={activeSection} />
      )}
    </>
  );
}

function CustomersMain() {
  return (
    <OperationsInboxLayout
      title="고객"
      subtitle="세그먼트와 최근 상담 기준"
      sidebarTitle="고객"
      listTitle="고객 프로필"
      views={[
        { label: "전체 고객", count: "1.2k", icon: <Users className="h-4 w-4" />, active: true },
        { label: "위험 고객", count: "12", icon: <AlertTriangle className="h-4 w-4" /> },
        { label: "VIP 후보", count: "24", icon: <ShieldCheck className="h-4 w-4" /> },
        { label: "수신 동의", count: "842", icon: <Mail className="h-4 w-4" /> },
      ]}
      groups={[
        {
          title: "세그먼트",
          items: [
            { label: "불만 고위험", count: "12", icon: <AlertTriangle className="h-4 w-4" /> },
            { label: "리뷰 작성자", count: "48", icon: <Megaphone className="h-4 w-4" /> },
            { label: "예약 변경 잦음", count: "9", icon: <CalendarClock className="h-4 w-4" /> },
          ],
        },
        {
          title: "담당자",
          items: [
            { label: "이지현", count: "14", icon: <Avatar label="이" size="sm" /> },
            { label: "배지희", count: "5", icon: <Avatar label="배" size="sm" /> },
            { label: "김수현", count: "8", icon: <Avatar label="김" size="sm" /> },
          ],
        },
      ]}
      tabs={["활성", "VIP", "위험", "휴면"]}
      items={conversations.map((conversation, index) => ({
        id: conversation.id,
        title: conversation.customer,
        owner: conversation.assignee,
        description: conversation.preview,
        status: index < 2 ? "VIP 후보" : "일반",
        tone: index < 2 ? "blue" : "green",
        meta: `${conversation.channel} · ${conversation.tags.join(", ")}`,
        avatar: conversation.avatar,
      }))}
      detail={
        <CustomerProfileDetail
          title="박지은"
          subtitle="불만 고위험 · 리뷰 작성자"
          rows={[
            ["담당자", "이지현"],
            ["최근 채널", "채널톡"],
            ["수신 동의", "동의"],
            ["누적 상담", "14건"],
          ]}
          checks={[
            "불만 태그 고객은 담당자 연결 조건 우선 적용",
            "보상/환불 안내는 활성 규칙 기준으로만 안내",
            "리뷰 캠페인은 환불 처리 완료 후 발송",
          ]}
        />
      }
    />
  );
}

const reservationStatusMeta: Record<
  Reservation["status"],
  { label: string; tone: OperationsItem["tone"] }
> = {
  requested: { label: "확인필요", tone: "amber" },
  confirmed: { label: "확정", tone: "blue" },
  completed: { label: "완료", tone: "green" },
  cancelled: { label: "취소", tone: "gray" },
  rejected: { label: "거절", tone: "red" },
  no_show: { label: "노쇼", tone: "red" },
};

function formatReservationTime(reservation: Reservation) {
  const start = new Date(reservation.startAt);
  const end = new Date(reservation.endAt);
  const dateLabel = start.toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
  const startLabel = start.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
  const endLabel = end.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
  return `${dateLabel} ${startLabel} - ${endLabel}`;
}

function formatReservationCreatedTime(reservation: Reservation) {
  if (!reservation.createdAt) return "신청 시간 미상";
  const createdAt = new Date(reservation.createdAt);
  if (Number.isNaN(createdAt.getTime())) return "신청 시간 미상";

  const now = new Date();
  const isToday = createdAt.toDateString() === now.toDateString();
  const dateLabel = isToday
    ? "오늘"
    : createdAt.toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
  const timeLabel = createdAt.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });

  return `신청 ${dateLabel} ${timeLabel}`;
}

function formatDateForApi(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatSlotTime(slot: AvailableSlot) {
  if (!slot.startAt || !slot.endAt) return "시간 미정";
  const start = new Date(slot.startAt);
  const end = new Date(slot.endAt);
  const startLabel = start.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
  const endLabel = end.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
  return `${startLabel} - ${endLabel}`;
}

function isRecentDate(value?: string | null) {
  if (!value) return false;
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return false;
  return Date.now() - time < 1000 * 60 * 60 * 24;
}

function getReservationSortPriority(reservation: Reservation) {
  if (reservation.status === "requested") return 0;
  if (reservation.status === "confirmed") return 1;
  if (reservation.status === "completed") return 2;
  return 3;
}

function AppointmentsMain({
  user,
  selectedReservation,
  onSelectReservation,
}: {
  user: User;
  selectedReservation: Reservation | null;
  onSelectReservation: (reservation: Reservation | null) => void;
}) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [bookingSetting, setBookingSetting] = useState<BookingSetting | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [appointmentView, setAppointmentView] = useState<AppointmentView>("calendar");
  const [reservationFilter, setReservationFilter] = useState<ReservationFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const organizationId = getOrganizationId(user);
  useEffect(() => {
    let isMounted = true;
    const today = formatDateForApi(new Date());

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [reservationItems, serviceItems, setting] = await Promise.all([
          fetchReservations(organizationId, 100),
          fetchServices(organizationId),
          fetchBookingSetting(organizationId),
        ]);
        const slots = serviceItems[0]
          ? await fetchAvailableSlots(organizationId, serviceItems[0].id, today)
          : [];
        if (!isMounted) return;
        setReservations(reservationItems);
        setServices(serviceItems);
        setBookingSetting(setting);
        setAvailableSlots(slots);
        onSelectReservation(reservationItems[0] ?? null);
      } catch (caughtError) {
        if (!isMounted) return;
        setError(caughtError instanceof Error ? caughtError.message : "예약 목록을 불러오지 못했습니다.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [onSelectReservation, organizationId]);

  const serviceNameById = new Map<string, string>(services.map((service) => [service.id, service.name]));
  const pendingReservations = reservations.filter((item) => item.status === "requested");
  const cancelledRejectedReservations = reservations.filter((item) => item.status === "cancelled" || item.status === "rejected");
  const filteredReservations = reservations.filter((reservation) => {
    if (reservationFilter === "requested") return reservation.status === "requested";
    if (reservationFilter === "recent") return isRecentDate(reservation.createdAt);
    if (reservationFilter === "confirmed") return reservation.status === "confirmed";
    if (reservationFilter === "cancelled_rejected") {
      return reservation.status === "cancelled" || reservation.status === "rejected";
    }
    return true;
  });

  const reservationItems: OperationsItem[] = [...filteredReservations]
    .sort((a, b) => {
      const priorityDiff = getReservationSortPriority(a) - getReservationSortPriority(b);
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.createdAt ?? b.startAt).getTime() - new Date(a.createdAt ?? a.startAt).getTime();
    })
    .map((reservation) => {
      const statusMeta = reservationStatusMeta[reservation.status];
      const serviceName = reservation.serviceId ? serviceNameById.get(reservation.serviceId) : undefined;
      const customerName = reservation.customerName ?? "고객 미입력";
      const badges: OperationsItem["badges"] = [];

      if (reservation.status === "requested") badges.push({ label: "확인필요", tone: "amber" });
      if (isRecentDate(reservation.createdAt)) badges.push({ label: "신규", tone: "blue" });
      if (reservation.createdBy === "ai") badges.push({ label: "AI", tone: "gray" });

      return {
        id: reservation.id,
        title: serviceName ?? "예약",
        owner: customerName,
        description: formatReservationTime(reservation),
        status: statusMeta.label,
        tone: statusMeta.tone,
        meta: `${formatReservationCreatedTime(reservation)} · ${reservation.sourceChannel ?? "채널 미상"}`,
        avatar: customerName[0] ?? "예",
        badges,
      };
    });
  const calendarItems: OperationsItem[] = [
    {
      id: `calendar-${bookingSetting?.id ?? "default"}`,
      title: bookingSetting?.name ?? "대표 예약 캘린더",
      owner: bookingSetting?.timezone ?? "Asia/Seoul",
      description: `${bookingSetting?.slotIntervalMinutes ?? 30}분 단위 · ${
        bookingSetting?.requiresApproval ? "승인 필요" : "자동 승인"
      }`,
      status: bookingSetting?.isActive ? "활성" : "비활성",
      tone: bookingSetting?.isActive ? "blue" : "gray",
      meta: `가능 ${availableSlots.length}개 · 예약 ${reservations.length}건`,
      avatar: "캘",
    },
  ];
  const items = appointmentView === "calendar" ? calendarItems : reservationItems;
  const viewMeta: Record<AppointmentView, { title: string; listTitle: string; tabs: string[] }> = {
    calendar: { title: "캘린더", listTitle: "캘린더 목록", tabs: ["운영", "가능시간", "예약"] },
    reservations: { title: "예약", listTitle: "예약 수신함", tabs: ["전체", "확인필요", "신규", "확정"] },
  };
  const selectedOperationsItemId =
    appointmentView === "reservations"
      ? selectedReservation?.id
      : items[0]?.id;

  return (
    <OperationsInboxLayout
      title={viewMeta[appointmentView].title}
      subtitle={
        isLoading
          ? "예약 정보를 불러오는 중입니다"
          : error ?? `${bookingSetting?.name ?? "대표 캘린더"} · 오늘 가능 ${availableSlots.length}개 · 예약 ${reservations.length}건`
      }
      sidebarTitle="예약"
      listTitle={viewMeta[appointmentView].listTitle}
      views={[
        {
          label: "캘린더",
          count: bookingSetting ? "1" : "0",
          icon: <CalendarClock className="h-4 w-4" />,
          active: appointmentView === "calendar",
          onClick: () => {
            setAppointmentView("calendar");
          },
        },
        {
          label: "예약",
          count: String(reservations.length),
          icon: <Inbox className="h-4 w-4" />,
          active: appointmentView === "reservations",
          onClick: () => {
            setReservationFilter("all");
            setAppointmentView("reservations");
          },
        },
      ]}
      groups={[
        {
          title: "예약",
          items: [
            {
              label: "확인필요",
              count: String(pendingReservations.length),
              icon: <AlertTriangle className="h-4 w-4" />,
              active: appointmentView === "reservations" && reservationFilter === "requested",
              onClick: () => {
                setReservationFilter("requested");
                setAppointmentView("reservations");
                onSelectReservation(pendingReservations[0] ?? null);
              },
            },
            {
              label: "취소/거절",
              count: String(cancelledRejectedReservations.length),
              icon: <AlertTriangle className="h-4 w-4" />,
              active: appointmentView === "reservations" && reservationFilter === "cancelled_rejected",
              onClick: () => {
                setReservationFilter("cancelled_rejected");
                setAppointmentView("reservations");
                onSelectReservation(cancelledRejectedReservations[0] ?? null);
              },
            },
          ],
        },
      ]}
      tabs={viewMeta[appointmentView].tabs}
      activeTab={
        appointmentView === "reservations"
          ? reservationFilter === "requested"
            ? "확인필요"
            : reservationFilter === "recent"
              ? "신규"
              : reservationFilter === "confirmed"
                ? "확정"
                : "전체"
          : undefined
      }
      onTabSelect={
        appointmentView === "reservations"
          ? (tab) => {
              const nextFilter: ReservationFilter =
                tab === "확인필요" ? "requested" : tab === "신규" ? "recent" : tab === "확정" ? "confirmed" : "all";
              const nextReservations = reservations.filter((reservation) => {
                if (nextFilter === "requested") return reservation.status === "requested";
                if (nextFilter === "recent") return isRecentDate(reservation.createdAt);
                if (nextFilter === "confirmed") return reservation.status === "confirmed";
                return true;
              });
              setReservationFilter(nextFilter);
              onSelectReservation(nextReservations[0] ?? null);
            }
          : undefined
      }
      items={items}
      selectedItemId={selectedOperationsItemId}
      onSelectItem={(id) => {
        if (appointmentView === "reservations") {
          const reservation = reservations.find((item) => item.id === id) ?? null;
          onSelectReservation(reservation);
          return;
        }
      }}
      detail={
        appointmentView === "calendar" ? (
          <CalendarMainContent
            bookingSetting={bookingSetting}
            availableSlots={availableSlots}
            reservations={reservations}
            services={services}
          />
        ) : selectedReservation ? (
          <ReservationProfileDetail
            reservation={selectedReservation}
            serviceName={
              selectedReservation.serviceId ? serviceNameById.get(selectedReservation.serviceId) : undefined
            }
            organizationId={organizationId}
            bookingSetting={bookingSetting}
            availableSlots={availableSlots}
            onUpdated={(updated) => {
              setReservations((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
              onSelectReservation(updated);
            }}
          />
        ) : (
          <div className="text-[13px] font-semibold text-gray-400">
            {isLoading ? "불러오는 중..." : "표시할 예약이 없습니다."}
          </div>
        )
      }
    />
  );
}

function CalendarMainContent({
  bookingSetting,
  availableSlots,
  reservations,
  services,
}: {
  bookingSetting: BookingSetting | null;
  availableSlots: AvailableSlot[];
  reservations: Reservation[];
  services: Service[];
}) {
  const today = new Date();
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay();
  const dayCells = [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: lastDay.getDate() }, (_, index) => new Date(year, month, index + 1)),
  ];
  const serviceNameById = new Map<string, string>(services.map((service) => [service.id, service.name]));
  const slotsByDate = new Map<string, AvailableSlot[]>();
  const reservationsByDate = new Map<string, Reservation[]>();

  availableSlots.forEach((slot) => {
    if (!slot.startAt) return;
    const key = formatDateForApi(new Date(slot.startAt));
    slotsByDate.set(key, [...(slotsByDate.get(key) ?? []), slot]);
  });
  reservations.forEach((reservation) => {
    const key = formatDateForApi(new Date(reservation.startAt));
    reservationsByDate.set(key, [...(reservationsByDate.get(key) ?? []), reservation]);
  });
  const monthLabel = visibleMonth.toLocaleDateString("ko-KR", { year: "numeric", month: "long" });
  const moveMonth = (offset: number) => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  return (
    <div>
      <div className="mb-5 rounded-[20px] bg-[#f7f7f7] p-5">
        <div className="mb-3 flex items-center gap-3">
          <Avatar label="캘" size="lg" />
          <div className="min-w-0">
            <h3 className="truncate text-[22px] font-bold">
              {bookingSetting?.name ?? "대표 예약 캘린더"}
            </h3>
            <p className="truncate text-[13px] font-bold text-gray-400">
              {bookingSetting?.timezone ?? "Asia/Seoul"} · {bookingSetting?.slotIntervalMinutes ?? 30}분 단위
            </p>
          </div>
          <StatusPill tone={bookingSetting?.isActive ? "blue" : "gray"}>
            {bookingSetting?.isActive ? "운영중" : "비활성"}
          </StatusPill>
        </div>
        <p className="text-[13px] font-semibold leading-relaxed text-gray-500">
          가능 시간과 예약을 월간 캘린더에서 확인합니다. 날짜 안의 초록 칩은 가능 시간, 파란 칩은 예약입니다.
        </p>
      </div>
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <InfoCard title="가능 시간" meta="오늘" text={`${availableSlots.length}개`} />
        <InfoCard title="예약" meta="전체" text={`${reservations.length}건`} />
        <InfoCard
          title="승인 방식"
          meta="정책"
          text={bookingSetting?.requiresApproval ? "관리자 승인 필요" : "자동 승인"}
        />
      </div>

      <div className="mb-5">
        <div className="mb-4 grid grid-cols-[44px_minmax(0,1fr)_44px] items-center">
          <button
            type="button"
            onClick={() => moveMonth(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f7f7] text-[22px] font-bold text-gray-500 transition-colors hover:bg-[#eeeeee]"
            aria-label="이전 달"
          >
            ‹
          </button>
          <div className="text-center">
            <h4 className="text-[20px] font-extrabold">{monthLabel}</h4>
            <button
              type="button"
              onClick={() => setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1))}
              className="mt-1 text-[12px] font-bold text-gray-400 hover:text-gray-700"
            >
              오늘로 이동
            </button>
          </div>
          <button
            type="button"
            onClick={() => moveMonth(1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f7f7] text-[22px] font-bold text-gray-500 transition-colors hover:bg-[#eeeeee]"
            aria-label="다음 달"
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-extrabold">
          {["일", "월", "화", "수", "목", "금", "토"].map((day, dayIndex) => (
            <div
              key={day}
              className={`py-2 ${
                dayIndex === 0 ? "text-red-500" : dayIndex === 6 ? "text-blue-500" : "text-gray-400"
              }`}
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 rounded-[20px] bg-[#f7f7f7] p-2">
          {dayCells.map((date, index) => {
            if (!date) return <div key={`empty-${index}`} className="min-h-[86px] rounded-[14px]" />;

            const dateKey = formatDateForApi(date);
            const daySlots = slotsByDate.get(dateKey) ?? [];
            const dayReservations = reservationsByDate.get(dateKey) ?? [];
            const isToday = dateKey === formatDateForApi(today);
            const dayIndex = date.getDay();
            const dateTextColor = isToday
              ? "text-blue-600"
              : dayIndex === 0
                ? "text-red-500"
                : dayIndex === 6
                  ? "text-blue-500"
                  : "text-gray-700";

            return (
              <div
                key={dateKey}
                className={`min-h-[86px] rounded-[14px] p-2 ${
                  isToday ? "bg-blue-50 ring-1 ring-blue-200" : "bg-white"
                }`}
              >
                <div className={`mb-2 text-[13px] font-extrabold ${dateTextColor}`}>
                  {date.getDate()}
                </div>
                <div className="space-y-1">
                  {daySlots.slice(0, 2).map((slot) => (
                    <div
                      key={`${slot.startAt}-${slot.endAt}`}
                      className="truncate rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-extrabold text-green-600"
                    >
                      {formatSlotTime(slot)}
                    </div>
                  ))}
                  {dayReservations.slice(0, 2).map((reservation) => (
                    <div
                      key={reservation.id}
                      className="truncate rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold text-blue-600"
                    >
                      {reservation.serviceId ? serviceNameById.get(reservation.serviceId) ?? "예약" : "예약"}
                    </div>
                  ))}
                  {daySlots.length + dayReservations.length > 4 && (
                    <div className="px-2 text-[10px] font-extrabold text-gray-400">
                      +{daySlots.length + dayReservations.length - 4}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <SectionHeading icon={<ClockIcon />} title="오늘 가능 시간" />
          <div className="grid gap-2">
            {availableSlots.slice(0, 5).map((slot) => (
              <div key={`${slot.startAt}-${slot.endAt}`} className="flex items-center justify-between rounded-[14px] bg-[#f7f7f7] px-4 py-3">
                <span className="text-[13px] font-bold text-gray-700">{formatSlotTime(slot)}</span>
                <span className="rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-extrabold text-green-600">가능</span>
              </div>
            ))}
            {availableSlots.length === 0 && (
              <div className="rounded-[14px] bg-[#f7f7f7] px-4 py-3 text-[13px] font-semibold text-gray-400">
                오늘 표시할 가능 시간이 없습니다.
              </div>
            )}
          </div>
        </div>
        <div>
          <SectionHeading icon={<CalendarClock className="h-5 w-5 text-blue-500" />} title="최근 예약" />
          <div className="grid gap-2">
            {reservations.slice(0, 5).map((reservation) => (
              <div key={reservation.id} className="rounded-[14px] bg-[#f7f7f7] px-4 py-3">
                <div className="text-[13px] font-bold text-gray-800">
                  {reservation.customerName ?? "고객 미입력"} ·{" "}
                  {reservation.serviceId ? serviceNameById.get(reservation.serviceId) ?? "예약" : "예약"}
                </div>
                <div className="mt-1 text-[12px] font-semibold text-gray-400">{formatReservationTime(reservation)}</div>
              </div>
            ))}
            {reservations.length === 0 && (
              <div className="rounded-[14px] bg-[#f7f7f7] px-4 py-3 text-[13px] font-semibold text-gray-400">
                표시할 예약이 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReservationProfileDetail({
  reservation,
  serviceName,
  organizationId,
  bookingSetting,
  availableSlots,
  onUpdated,
}: {
  reservation: Reservation;
  serviceName?: string;
  organizationId: string;
  bookingSetting: BookingSetting | null;
  availableSlots: AvailableSlot[];
  onUpdated: (reservation: Reservation) => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const statusMeta = reservationStatusMeta[reservation.status];

  async function runAction(action: typeof confirmReservation | typeof rejectReservation | typeof cancelReservation, nextStatus: Reservation["status"]) {
    setIsSubmitting(true);
    setActionError(null);
    try {
      await action(organizationId, reservation.id);
      onUpdated({ ...reservation, status: nextStatus });
    } catch (caughtError) {
      setActionError(caughtError instanceof Error ? caughtError.message : "처리에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mb-5 rounded-[20px] bg-[#f7f7f7] p-5">
        <div className="mb-3 flex items-center gap-3">
          <Avatar label={(reservation.customerName ?? "예")[0]} size="lg" />
          <div className="min-w-0">
            <h3 className="truncate text-[22px] font-bold">{reservation.customerName ?? "고객 미입력"}</h3>
            <p className="truncate text-[13px] font-bold text-gray-400">
              {serviceName ?? "서비스 미지정"} · {formatReservationTime(reservation)}
            </p>
          </div>
          <StatusPill tone={statusMeta.tone}>{statusMeta.label}</StatusPill>
        </div>
        {reservation.memo && (
          <p className="text-[13px] font-semibold leading-relaxed text-gray-500">{reservation.memo}</p>
        )}
      </div>
      {actionError && (
        <div className="mb-4 rounded-[16px] bg-red-50 p-3 text-[13px] font-semibold text-red-600">
          {actionError}
        </div>
      )}
      {reservation.status === "requested" && (
        <div className="mb-3 flex gap-2">
          <button
            disabled={isSubmitting}
            onClick={() => runAction(confirmReservation, "confirmed")}
            className="flex-1 rounded-full bg-black px-4 py-3 text-[14px] font-bold text-white disabled:opacity-40"
          >
            예약 확정
          </button>
          <button
            disabled={isSubmitting}
            onClick={() => runAction(rejectReservation, "rejected")}
            className="flex-1 rounded-full bg-[#f4f4f4] px-4 py-3 text-[14px] font-bold text-gray-700 disabled:opacity-40"
          >
            거절
          </button>
        </div>
      )}
      {(reservation.status === "requested" || reservation.status === "confirmed") && (
        <div className="mb-5">
          <button
            disabled={isSubmitting}
            onClick={() => runAction(cancelReservation, "cancelled")}
            className="w-full rounded-full bg-[#f4f4f4] px-4 py-3 text-[14px] font-bold text-gray-700 disabled:opacity-40"
          >
            예약 취소
          </button>
        </div>
      )}
      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <InfoCard title="서비스" meta="예약 정보" text={serviceName ?? "미지정"} />
        <InfoCard title="연락처" meta="예약 정보" text={reservation.customerPhone ?? "미입력"} />
        <InfoCard title="신청 시간" meta="접수 정보" text={formatReservationCreatedTime(reservation)} />
        <InfoCard title="채널" meta="예약 정보" text={reservation.sourceChannel ?? "web_chat"} />
        <InfoCard title="생성자" meta="예약 정보" text={reservation.createdBy ?? "ai"} />
      </div>
      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <InfoCard
          title="캘린더"
          meta={bookingSetting?.isActive ? "활성" : "비활성"}
          text={bookingSetting?.name ?? "대표 예약 캘린더"}
        />
        <InfoCard
          title="일정 간격"
          meta={bookingSetting?.timezone ?? "Asia/Seoul"}
          text={`${bookingSetting?.slotIntervalMinutes ?? 30}분 단위`}
        />
      </div>
      <div className="mb-5">
        <SectionHeading icon={<CalendarClock className="h-5 w-5 text-blue-500" />} title="오늘 가능 일정" />
        <div className="grid gap-2">
          {availableSlots.slice(0, 5).map((slot) => (
            <div key={`${slot.startAt}-${slot.endAt}`} className="flex items-center justify-between rounded-[14px] bg-[#f7f7f7] px-4 py-3">
              <span className="text-[13px] font-bold text-gray-700">{formatSlotTime(slot)}</span>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-extrabold text-blue-600">가능</span>
            </div>
          ))}
          {availableSlots.length === 0 && (
            <div className="rounded-[14px] bg-[#f7f7f7] px-4 py-3 text-[13px] font-semibold text-gray-400">
              오늘 표시할 가능 시간이 없습니다.
            </div>
          )}
        </div>
      </div>
      <div className="mb-5">
        <SectionHeading icon={<ShieldCheck className="h-5 w-5 text-blue-500" />} title="운영 체크" />
        <div className="space-y-2">
          <ChecklistItem text="고객 목적이 실제 예약 생성인지 확인" />
          <ChecklistItem text="가능 시간 임시 점유 후 고객 확인 요청" />
          <ChecklistItem text="완료 결과는 Supabase 상담 로그에 저장" />
        </div>
      </div>
    </div>
  );
}

function ReservationDetailPanel({ reservation }: { reservation: Reservation | null }) {
  return (
    <DetailSidebar>
      <DetailIntro
        icon={<ShieldCheck className="h-5 w-5 text-blue-500" />}
        title="일정 상세"
        description="선택한 예약과 연결된 캘린더, 일정 처리 기준, 최근 변경 이력을 오른쪽에서 고정 확인합니다."
      />
      <DetailSection title="운영 정책">
        <DetailRow label="SLA" value="5분 이내" />
        <DetailRow label="승인 기준" value="고위험 자동 보류" />
        <DetailRow label="일정 기준" value="예약 캘린더" />
      </DetailSection>
      <DetailSection title="체크리스트">
        <ChecklistItem text="고객 동의와 민감 정보 마스킹 확인" />
        <ChecklistItem text="AI 추천 액션은 담당자 승인 후 실행" />
        <ChecklistItem text="완료 후 이벤트와 태그를 상담 로그에 남김" />
      </DetailSection>
      {reservation && (
        <DetailSection title="선택된 예약">
          <DetailRow label="예약 ID" value={reservation.id.slice(0, 8)} />
          <DetailRow label="상태" value={reservationStatusMeta[reservation.status].label} />
          <DetailRow
            label="생성일"
            value={reservation.createdAt ? new Date(reservation.createdAt).toLocaleString("ko-KR") : "-"}
          />
        </DetailSection>
      )}
    </DetailSidebar>
  );
}

function formatServicePrice(service: Service) {
  if (service.price === null || service.price === undefined) return "가격 미설정";
  return `${service.price.toLocaleString("ko-KR")}${service.currency === "KRW" || !service.currency ? "원" : ` ${service.currency}`}`;
}

function formatCatalogPrice(price?: number | null, currency?: string | null) {
  if (price === null || price === undefined) return "가격 미설정";
  return `${price.toLocaleString("ko-KR")}${currency === "KRW" || !currency ? "원" : ` ${currency}`}`;
}

type ServiceView = "active" | "pending" | "review" | "stale";
type ServiceModalMode =
  | "create-service"
  | "edit-service"
  | "approve"
  | "apply"
  | "create-item"
  | "edit-item"
  | "create-option"
  | "edit-option";

function ServicesMain({
  user,
  selectedService,
  onSelectService,
}: {
  user: User;
  selectedService: Service | null;
  onSelectService: (service: Service | null) => void;
}) {
  const [services, setServices] = useState<Service[]>([]);
  const [inactiveServices, setInactiveServices] = useState<Service[]>([]);
  const [pendingServices, setPendingServices] = useState<ServiceAdminItem[]>([]);
  const [reviewServices, setReviewServices] = useState<ServiceAdminItem[]>([]);
  const [staleServices, setStaleServices] = useState<ServiceAdminItem[]>([]);
  const [serviceView, setServiceView] = useState<ServiceView>("active");
  const [selectedAdminItemId, setSelectedAdminItemId] = useState<string | null>(null);
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
  const [selectedServiceItemId, setSelectedServiceItemId] = useState<string | null>(null);
  const [serviceItemOptions, setServiceItemOptions] = useState<ServiceItemOption[]>([]);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [priceCalculation, setPriceCalculation] = useState<ServicePriceCalculation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<ServiceModalMode | null>(null);
  const [editingServiceItem, setEditingServiceItem] = useState<ServiceItem | null>(null);
  const [editingOption, setEditingOption] = useState<ServiceItemOption | null>(null);
  const organizationId = getOrganizationId(user);

  const reloadServiceCatalog = useCallback(
    async (preferredServiceId?: string | null) => {
      const [activeItems, pendingItems, reviewItems, staleItems] = await Promise.all([
        fetchServices(organizationId),
        fetchPendingServices(organizationId),
        fetchReviewServices(organizationId),
        fetchStaleServices(organizationId),
      ]);
      const mergedItems = [
        ...activeItems,
        ...inactiveServices.filter((inactiveService) => !activeItems.some((item) => item.id === inactiveService.id)),
      ];
      setServices(mergedItems);
      setPendingServices(pendingItems);
      setReviewServices(reviewItems);
      setStaleServices(staleItems);

      const nextService =
        (preferredServiceId ? mergedItems.find((item) => item.id === preferredServiceId) : null) ??
        mergedItems[0] ??
        null;
      onSelectService(nextService);

      const currentAdminItems =
        serviceView === "pending" ? pendingItems : serviceView === "review" ? reviewItems : staleItems;
      setSelectedAdminItemId((current) =>
        currentAdminItems.some((item) => item.id === current) ? current : currentAdminItems[0]?.id ?? null,
      );
    },
    [inactiveServices, onSelectService, organizationId, serviceView],
  );

  useEffect(() => {
    let isMounted = true;

    async function loadInitialServices() {
      try {
        const [activeItems, pendingItems, reviewItems, staleItems] = await Promise.all([
          fetchServices(organizationId),
          fetchPendingServices(organizationId),
          fetchReviewServices(organizationId),
          fetchStaleServices(organizationId),
        ]);
        if (!isMounted) return;
        setServices(activeItems);
        setPendingServices(pendingItems);
        setReviewServices(reviewItems);
        setStaleServices(staleItems);
        onSelectService(activeItems[0] ?? null);
        setError(null);
      } catch (caughtError) {
        if (isMounted) {
          setError(caughtError instanceof Error ? caughtError.message : "서비스 목록을 불러오지 못했습니다.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadInitialServices();

    return () => {
      isMounted = false;
    };
  }, [organizationId, onSelectService]);

  useEffect(() => {
    if (!selectedService) return;
    let isMounted = true;
    const serviceId = selectedService.id;

    async function loadServiceItems() {
      try {
        const items = await fetchServiceItems(organizationId, serviceId);
        if (!isMounted) return;
        setServiceItems(items);
        const nextItem = items[0] ?? null;
        setSelectedServiceItemId(nextItem?.id ?? null);
        setSelectedOptionIds([]);
        setPriceCalculation(nextItem ? await calculateServicePrice(organizationId, nextItem.id, []) : null);
      } catch (caughtError) {
        if (isMounted) setActionError(caughtError instanceof Error ? caughtError.message : "서비스 아이템을 불러오지 못했습니다.");
      }
    }

    void loadServiceItems();

    return () => {
      isMounted = false;
    };
  }, [organizationId, selectedService]);

  useEffect(() => {
    if (!selectedServiceItemId) return;
    let isMounted = true;
    const serviceItemId = selectedServiceItemId;

    async function loadOptions() {
      try {
        const options = await fetchServiceItemOptions(organizationId, serviceItemId);
        if (isMounted) setServiceItemOptions(options);
      } catch (caughtError) {
        if (isMounted) setActionError(caughtError instanceof Error ? caughtError.message : "옵션을 불러오지 못했습니다.");
      }
    }

    void loadOptions();

    return () => {
      isMounted = false;
    };
  }, [organizationId, selectedServiceItemId]);

  const selectedServiceItem = serviceItems.find((item) => item.id === selectedServiceItemId) ?? null;
  const selectedAdminItems =
    serviceView === "pending" ? pendingServices : serviceView === "review" ? reviewServices : staleServices;
  const selectedAdminItem =
    selectedAdminItems.find((item) => item.id === selectedAdminItemId) ?? selectedAdminItems[0] ?? null;

  const handleServiceViewChange = (nextView: ServiceView) => {
    setServiceView(nextView);
    if (nextView === "active") return;
    const nextItems = nextView === "pending" ? pendingServices : nextView === "review" ? reviewServices : staleServices;
    setSelectedAdminItemId(nextItems[0]?.id ?? null);
  };

  const handleSelectServiceItem = async (itemId: string) => {
    setSelectedServiceItemId(itemId);
    setSelectedOptionIds([]);
    setPriceCalculation(await calculateServicePrice(organizationId, itemId, []));
  };

  const handleOptionToggle = async (optionId: string) => {
    if (!selectedServiceItemId) return;
    const nextOptionIds = selectedOptionIds.includes(optionId)
      ? selectedOptionIds.filter((id) => id !== optionId)
      : [...selectedOptionIds, optionId];
    setSelectedOptionIds(nextOptionIds);
    setPriceCalculation(await calculateServicePrice(organizationId, selectedServiceItemId, nextOptionIds));
  };

  const handleToggleServiceActive = async () => {
    if (!selectedService) return;
    const nextActive = selectedService.isActive === false;

    setIsMutating(true);
    setActionError(null);
    try {
      await updateServiceActive(organizationId, selectedService.id, nextActive);
      const updatedService = {
        ...selectedService,
        isActive: nextActive,
        isReservable: nextActive,
      };
      if (updatedService.isActive === false) {
        setInactiveServices((current) => [
          ...current.filter((service) => service.id !== updatedService.id),
          updatedService,
        ]);
      } else {
        setInactiveServices((current) => current.filter((service) => service.id !== updatedService.id));
      }
      setServices((current) =>
        current.some((service) => service.id === updatedService.id)
          ? current.map((service) => (service.id === updatedService.id ? updatedService : service))
          : [...current, updatedService],
      );
      onSelectService(updatedService);
    } catch (caughtError) {
      setActionError(caughtError instanceof Error ? caughtError.message : "서비스 활성 상태 변경에 실패했습니다.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleCreateService = async (input: ServiceInput) => {
    setIsMutating(true);
    setActionError(null);
    try {
      const created = await createService(organizationId, input);
      await reloadServiceCatalog(created.id);
      setServices((current) => [...current.filter((service) => service.id !== created.id), created]);
      onSelectService(created);
      setServiceView("active");
      setModalMode(null);
    } catch (caughtError) {
      setActionError(caughtError instanceof Error ? caughtError.message : "서비스 생성에 실패했습니다.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleUpdateService = async (input: ServiceInput) => {
    if (!selectedService) return;
    setIsMutating(true);
    setActionError(null);
    try {
      const updated = await updateService(organizationId, selectedService.id, input);
      setServices((current) => current.map((service) => (service.id === updated.id ? updated : service)));
      onSelectService(updated);
      setModalMode(null);
    } catch (caughtError) {
      setActionError(caughtError instanceof Error ? caughtError.message : "서비스 수정에 실패했습니다.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleDeleteService = async () => {
    if (!selectedService) return;
    if (!window.confirm(`"${selectedService.name}" 서비스를 삭제할까요? 기존 예약 보호를 위해 비활성 처리됩니다.`)) return;
    setIsMutating(true);
    setActionError(null);
    try {
      const deletedService = await deleteService(organizationId, selectedService.id);
      if (deletedService) {
        setInactiveServices((current) => [
          ...current.filter((service) => service.id !== deletedService.id),
          deletedService,
        ]);
        setServices((current) =>
          current.map((service) => (service.id === deletedService.id ? deletedService : service)),
        );
        onSelectService(deletedService);
      }
    } catch (caughtError) {
      setActionError(caughtError instanceof Error ? caughtError.message : "서비스 삭제에 실패했습니다.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleCreateServiceItem = async (input: ServiceItemInput) => {
    if (!selectedService) return;
    setIsMutating(true);
    setActionError(null);
    try {
      const created = await createServiceItem(organizationId, selectedService.id, input);
      setServiceItems((current) => [...current, created]);
      setSelectedServiceItemId(created.id);
      setServiceItemOptions([]);
      setSelectedOptionIds([]);
      setPriceCalculation(await calculateServicePrice(organizationId, created.id, []));
      setModalMode(null);
    } catch (caughtError) {
      setActionError(caughtError instanceof Error ? caughtError.message : "서비스 아이템 생성에 실패했습니다.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleUpdateServiceItem = async (input: ServiceItemInput) => {
    if (!editingServiceItem) return;
    setIsMutating(true);
    setActionError(null);
    try {
      const updated = await updateServiceItem(organizationId, editingServiceItem.id, input);
      setServiceItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setSelectedServiceItemId(updated.id);
      setModalMode(null);
      setEditingServiceItem(null);
      setPriceCalculation(await calculateServicePrice(organizationId, updated.id, selectedOptionIds));
    } catch (caughtError) {
      setActionError(caughtError instanceof Error ? caughtError.message : "서비스 아이템 수정에 실패했습니다.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleDeleteServiceItem = async (item: ServiceItem) => {
    if (!window.confirm(`"${item.name}" 아이템을 삭제할까요?`)) return;
    setIsMutating(true);
    setActionError(null);
    try {
      await deleteServiceItem(organizationId, item.id);
      const remaining = serviceItems.filter((serviceItem) => serviceItem.id !== item.id);
      setServiceItems(remaining);
      const nextItem = remaining[0] ?? null;
      setSelectedServiceItemId(nextItem?.id ?? null);
      setServiceItemOptions([]);
      setSelectedOptionIds([]);
      setPriceCalculation(nextItem ? await calculateServicePrice(organizationId, nextItem.id, []) : null);
    } catch (caughtError) {
      setActionError(caughtError instanceof Error ? caughtError.message : "서비스 아이템 삭제에 실패했습니다.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleCreateOption = async (input: ServiceItemOptionInput) => {
    if (!selectedServiceItemId) return;
    setIsMutating(true);
    setActionError(null);
    try {
      const created = await createServiceItemOption(organizationId, selectedServiceItemId, input);
      setServiceItemOptions((current) => [...current, created]);
      setModalMode(null);
    } catch (caughtError) {
      setActionError(caughtError instanceof Error ? caughtError.message : "옵션 생성에 실패했습니다.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleUpdateOption = async (input: ServiceItemOptionInput) => {
    if (!editingOption) return;
    setIsMutating(true);
    setActionError(null);
    try {
      const updated = await updateServiceItemOption(organizationId, editingOption.id, input);
      setServiceItemOptions((current) => current.map((option) => (option.id === updated.id ? updated : option)));
      setModalMode(null);
      setEditingOption(null);
      if (selectedServiceItemId) {
        setPriceCalculation(await calculateServicePrice(organizationId, selectedServiceItemId, selectedOptionIds));
      }
    } catch (caughtError) {
      setActionError(caughtError instanceof Error ? caughtError.message : "옵션 수정에 실패했습니다.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleDeleteOption = async (option: ServiceItemOption) => {
    if (!window.confirm(`"${option.optionValue}" 옵션을 삭제할까요?`)) return;
    setIsMutating(true);
    setActionError(null);
    try {
      await deleteServiceItemOption(organizationId, option.id);
      const nextOptionIds = selectedOptionIds.filter((id) => id !== option.id);
      setServiceItemOptions((current) => current.filter((item) => item.id !== option.id));
      setSelectedOptionIds(nextOptionIds);
      if (selectedServiceItemId) {
        setPriceCalculation(await calculateServicePrice(organizationId, selectedServiceItemId, nextOptionIds));
      }
    } catch (caughtError) {
      setActionError(caughtError instanceof Error ? caughtError.message : "옵션 삭제에 실패했습니다.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleApprove = async (input: ServiceInput) => {
    if (!selectedAdminItem) return;
    setIsMutating(true);
    setActionError(null);
    try {
      const result = await approveService(organizationId, selectedAdminItem.id, input);
      await reloadServiceCatalog(result.service?.id ?? selectedAdminItem.id);
      const approvedService = result.service;
      if (approvedService) {
        setServices((current) =>
          current.some((service) => service.id === approvedService.id)
            ? current.map((service) => (service.id === approvedService.id ? approvedService : service))
            : [...current, approvedService],
        );
        setPendingServices((current) => current.filter((item) => item.id !== approvedService.id));
        onSelectService(approvedService);
      }
      setModalMode(null);
      setServiceView("active");
    } catch (caughtError) {
      setActionError(caughtError instanceof Error ? caughtError.message : "서비스 승인에 실패했습니다.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleApplyPending = async (input: ServiceInput) => {
    if (!selectedAdminItem) return;
    setIsMutating(true);
    setActionError(null);
    try {
      const result = await applyPendingService(organizationId, selectedAdminItem.id, input);
      await reloadServiceCatalog(result.service?.id ?? selectedAdminItem.id);
      const appliedService = result.service;
      if (appliedService) {
        setServices((current) =>
          current.some((service) => service.id === appliedService.id)
            ? current.map((service) => (service.id === appliedService.id ? appliedService : service))
            : [...current, appliedService],
        );
        setReviewServices((current) => current.filter((item) => item.id !== appliedService.id));
        onSelectService(appliedService);
      }
      setModalMode(null);
      setServiceView("active");
    } catch (caughtError) {
      setActionError(caughtError instanceof Error ? caughtError.message : "변경 반영에 실패했습니다.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleReject = async () => {
    if (!selectedAdminItem) return;
    setIsMutating(true);
    setActionError(null);
    try {
      await rejectService(organizationId, selectedAdminItem.id, "관리자 거절");
      await reloadServiceCatalog();
    } catch (caughtError) {
      setActionError(caughtError instanceof Error ? caughtError.message : "서비스 거절에 실패했습니다.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleIgnorePending = async () => {
    if (!selectedAdminItem) return;
    setIsMutating(true);
    setActionError(null);
    try {
      await ignorePendingService(organizationId, selectedAdminItem.id, "관리자 무시");
      await reloadServiceCatalog();
    } catch (caughtError) {
      setActionError(caughtError instanceof Error ? caughtError.message : "변경 무시에 실패했습니다.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleDeactivateStale = async () => {
    if (!selectedAdminItem) return;
    setIsMutating(true);
    setActionError(null);
    try {
      await deactivateService(organizationId, selectedAdminItem.id, "원본 지식에서 제거됨");
      await reloadServiceCatalog();
    } catch (caughtError) {
      setActionError(caughtError instanceof Error ? caughtError.message : "서비스 비활성화에 실패했습니다.");
    } finally {
      setIsMutating(false);
    }
  };

  const activeCount = services.filter((service) => service.isActive !== false).length;
  const inactiveCount = services.length - activeCount;
  const activeItems: OperationsItem[] = services.map((service) => ({
    id: service.id,
    title: service.name,
    owner: service.durationMinutes ? `${service.durationMinutes}분` : "카탈로그",
    description: service.description ?? "설명 없음",
    status: service.isActive === false ? "비활성" : formatServicePrice(service),
    tone: service.isActive === false ? "gray" : "blue",
    meta: serviceItems.length && service.id === selectedService?.id ? `아이템 ${serviceItems.length}개` : service.isReservable === false ? "예약 불가" : "예약 가능",
    avatar: service.name[0] ?? "서",
    badges:
      service.syncStatus === "needs_review"
        ? [{ label: "검토필요", tone: "amber" as const }]
        : service.isReservable === false
          ? [{ label: "예약 불가", tone: "amber" as const }]
          : undefined,
  }));

  const adminItems: OperationsItem[] = selectedAdminItems.map((item) => ({
    id: item.id,
    title: item.name ?? item.current?.name ?? item.suggested?.name ?? "서비스",
    owner: item.sourceType ?? "knowledge",
    description:
      serviceView === "pending"
        ? `${item.missingFields?.length ?? 0}개 필드 확인 필요`
        : serviceView === "review"
          ? `${item.changedFields?.join(", ") || "변경 필드 없음"}`
          : item.message ?? "원본에서 더 이상 발견되지 않습니다.",
    status: serviceView === "pending" ? "승인대기" : serviceView === "review" ? "변경검토" : "미사용",
    tone: serviceView === "pending" ? "amber" : serviceView === "review" ? "blue" : "gray",
    meta: item.lastExtractedAt ? new Date(item.lastExtractedAt).toLocaleString("ko-KR") : "추출 정보 없음",
    avatar: (item.name ?? "서")[0],
  }));

  const items = serviceView === "active" ? activeItems : adminItems;

  return (
    <>
      <OperationsInboxLayout
        title="서비스"
        subtitle={
          isLoading
            ? "서비스 카탈로그를 불러오는 중입니다"
            : error ?? `활성 ${activeCount}개 · 비활성 ${inactiveCount}개 · 승인대기 ${pendingServices.length}개 · 검토 ${reviewServices.length}개`
        }
        sidebarTitle="서비스"
        listTitle={
          serviceView === "active"
            ? "전체 서비스"
            : serviceView === "pending"
              ? "승인 대기"
              : serviceView === "review"
                ? "변경 검토"
                : "미사용 후보"
        }
        primaryAction={
          serviceView === "active" ? { label: "서비스 추가", onClick: () => setModalMode("create-service") } : undefined
        }
        views={[
          {
            label: "활성 서비스",
            count: String(activeCount),
            icon: <Tag className="h-4 w-4" />,
            active: serviceView === "active",
            onClick: () => handleServiceViewChange("active"),
          },
          {
            label: "승인 대기",
            count: String(pendingServices.length),
            icon: <ShieldCheck className="h-4 w-4" />,
            active: serviceView === "pending",
            onClick: () => handleServiceViewChange("pending"),
          },
          {
            label: "변경 검토",
            count: String(reviewServices.length),
            icon: <AlertTriangle className="h-4 w-4" />,
            active: serviceView === "review",
            onClick: () => handleServiceViewChange("review"),
          },
        ]}
        groups={[
          {
            title: "동기화",
            items: [
              {
                label: "미사용 후보",
                count: String(staleServices.length),
                icon: <Inbox className="h-4 w-4" />,
                active: serviceView === "stale",
                onClick: () => handleServiceViewChange("stale"),
              },
            ],
          },
        ]}
        tabs={["전체", "승인대기", "검토", "미사용"]}
        activeTab={serviceView === "active" ? "전체" : serviceView === "pending" ? "승인대기" : serviceView === "review" ? "검토" : "미사용"}
        onTabSelect={(tab) => {
          if (tab === "승인대기") handleServiceViewChange("pending");
          else if (tab === "검토") handleServiceViewChange("review");
          else if (tab === "미사용") handleServiceViewChange("stale");
          else handleServiceViewChange("active");
        }}
        items={items}
        selectedItemId={serviceView === "active" ? selectedService?.id : selectedAdminItem?.id}
        onSelectItem={(id) => {
          if (serviceView === "active") {
            const service = services.find((item) => item.id === id) ?? null;
            onSelectService(service);
            return;
          }
          setSelectedAdminItemId(id);
        }}
        detail={
          serviceView === "active" && selectedService ? (
            <ServiceProfileDetail
              service={selectedService}
              serviceItems={serviceItems}
              selectedServiceItem={selectedServiceItem}
              serviceItemOptions={serviceItemOptions}
              selectedOptionIds={selectedOptionIds}
              priceCalculation={priceCalculation}
              actionError={actionError}
              isMutating={isMutating}
              onEditService={() => setModalMode("edit-service")}
              onDeleteService={handleDeleteService}
              onToggleServiceActive={handleToggleServiceActive}
              onCreateItem={() => {
                setEditingServiceItem(null);
                setModalMode("create-item");
              }}
              onEditItem={(item) => {
                setEditingServiceItem(item);
                setModalMode("edit-item");
              }}
              onDeleteItem={handleDeleteServiceItem}
              onCreateOption={() => {
                setEditingOption(null);
                setModalMode("create-option");
              }}
              onEditOption={(option) => {
                setEditingOption(option);
                setModalMode("edit-option");
              }}
              onDeleteOption={handleDeleteOption}
              onSelectServiceItem={handleSelectServiceItem}
              onToggleOption={handleOptionToggle}
            />
          ) : serviceView !== "active" && selectedAdminItem ? (
            <ServiceAdminDetail
              view={serviceView}
              item={selectedAdminItem}
              actionError={actionError}
              isMutating={isMutating}
              onApprove={() => setModalMode("approve")}
              onReject={handleReject}
              onApply={() => setModalMode("apply")}
              onIgnore={handleIgnorePending}
              onDeactivate={handleDeactivateStale}
            />
          ) : (
            <div className="space-y-4">
              <div className="text-[13px] font-semibold text-gray-400">
                {isLoading ? "불러오는 중..." : "표시할 서비스가 없습니다."}
              </div>
            </div>
          )
        }
      />
      {modalMode && (
        <>
          {["create-service", "edit-service", "approve", "apply"].includes(modalMode) && (
            <ServiceEditorModal
              mode={
                modalMode === "create-service" ||
                modalMode === "edit-service" ||
                modalMode === "approve" ||
                modalMode === "apply"
                  ? modalMode
                  : "create-service"
              }
              service={
                modalMode === "create-service"
                  ? null
                  : modalMode === "edit-service"
                    ? selectedService
                    : modalMode === "approve"
                      ? selectedAdminItem?.current ?? null
                      : selectedAdminItem?.suggested ?? selectedAdminItem?.current ?? null
              }
              isSubmitting={isMutating}
              error={actionError}
              onClose={() => {
                setModalMode(null);
                setActionError(null);
              }}
              onSubmit={
                modalMode === "create-service"
                  ? handleCreateService
                  : modalMode === "edit-service"
                    ? handleUpdateService
                    : modalMode === "approve"
                      ? handleApprove
                      : handleApplyPending
              }
            />
          )}
          {["create-item", "edit-item"].includes(modalMode) && (
            <ServiceItemEditorModal
              mode={modalMode === "edit-item" ? "edit-item" : "create-item"}
              item={modalMode === "edit-item" ? editingServiceItem : null}
              isSubmitting={isMutating}
              error={actionError}
              onClose={() => {
                setModalMode(null);
                setEditingServiceItem(null);
                setActionError(null);
              }}
              onSubmit={modalMode === "create-item" ? handleCreateServiceItem : handleUpdateServiceItem}
            />
          )}
          {["create-option", "edit-option"].includes(modalMode) && (
            <ServiceOptionEditorModal
              mode={modalMode === "edit-option" ? "edit-option" : "create-option"}
              option={modalMode === "edit-option" ? editingOption : null}
              isSubmitting={isMutating}
              error={actionError}
              onClose={() => {
                setModalMode(null);
                setEditingOption(null);
                setActionError(null);
              }}
              onSubmit={modalMode === "create-option" ? handleCreateOption : handleUpdateOption}
            />
          )}
        </>
      )}
    </>
  );
}

function ServiceProfileDetail({
  service,
  serviceItems,
  selectedServiceItem,
  serviceItemOptions,
  selectedOptionIds,
  priceCalculation,
  actionError,
  isMutating,
  onEditService,
  onDeleteService,
  onToggleServiceActive,
  onCreateItem,
  onEditItem,
  onDeleteItem,
  onCreateOption,
  onEditOption,
  onDeleteOption,
  onSelectServiceItem,
  onToggleOption,
}: {
  service: Service;
  serviceItems: ServiceItem[];
  selectedServiceItem: ServiceItem | null;
  serviceItemOptions: ServiceItemOption[];
  selectedOptionIds: string[];
  priceCalculation: ServicePriceCalculation | null;
  actionError: string | null;
  isMutating: boolean;
  onEditService: () => void;
  onDeleteService: () => void;
  onToggleServiceActive: () => void;
  onCreateItem: () => void;
  onEditItem: (item: ServiceItem) => void;
  onDeleteItem: (item: ServiceItem) => void;
  onCreateOption: () => void;
  onEditOption: (option: ServiceItemOption) => void;
  onDeleteOption: (option: ServiceItemOption) => void;
  onSelectServiceItem: (itemId: string) => void;
  onToggleOption: (optionId: string) => void;
}) {
  const groupedOptions = serviceItemOptions.reduce<Record<string, ServiceItemOption[]>>((groups, option) => {
    groups[option.optionGroup] = [...(groups[option.optionGroup] ?? []), option];
    return groups;
  }, {});
  const selectedOptions = serviceItemOptions.filter((option) => selectedOptionIds.includes(option.id));
  const optionSummary = selectedServiceItem ? `${serviceItemOptions.length}개` : "아이템 선택";

  return (
    <div className="space-y-4">
      <section className="rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex min-w-0 gap-3">
          <Avatar label={service.name[0] ?? "서"} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h3 className="truncate text-[24px] font-extrabold">{service.name}</h3>
              {service.isActive !== false && <StatusPill tone="green">활성</StatusPill>}
              {service.isActive === false && <StatusPill tone="gray">비활성</StatusPill>}
              {service.isReservable !== false && <StatusPill tone="blue">예약 가능</StatusPill>}
              {service.isReservable === false && <StatusPill tone="amber">예약 불가</StatusPill>}
            </div>
            <p className="text-[13px] font-semibold leading-relaxed text-gray-500">
              {service.description ?? "설명이 없습니다."}
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[18px] bg-[#f7f7f7] p-4">
            <div className="text-[11px] font-extrabold text-gray-400">기본 가격</div>
            <div className="mt-1 text-[18px] font-extrabold">{formatServicePrice(service)}</div>
          </div>
          <div className="rounded-[18px] bg-[#f7f7f7] p-4">
            <div className="text-[11px] font-extrabold text-gray-400">기본 소요</div>
            <div className="mt-1 text-[18px] font-extrabold">
              {service.durationMinutes ? `${service.durationMinutes}분` : "아이템별"}
            </div>
          </div>
          <div className="rounded-[18px] bg-[#f7f7f7] p-4">
            <div className="text-[11px] font-extrabold text-gray-400">아이템</div>
            <div className="mt-1 text-[18px] font-extrabold">{serviceItems.length}개</div>
          </div>
          <div className="rounded-[18px] bg-[#f7f7f7] p-4">
            <div className="text-[11px] font-extrabold text-gray-400">현재 아이템 옵션</div>
            <div className="mt-1 text-[18px] font-extrabold">{optionSummary}</div>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-3 rounded-[20px] bg-[#f7f7f7] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between gap-4 rounded-[16px] bg-white px-4 py-3 sm:min-w-[260px]">
            <div>
              <div className="text-[12px] font-extrabold text-gray-400">서비스 활성화</div>
              <div className="mt-1 text-[14px] font-extrabold text-gray-900">
                {service.isActive === false ? "비활성" : "활성"}
              </div>
            </div>
            <Toggle
              enabled={service.isActive !== false}
              onChange={onToggleServiceActive}
              disabled={isMutating}
            />
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Button variant="dark" size="md" className="justify-center" onClick={onEditService} disabled={isMutating}>
              서비스 수정
            </Button>
            <Button variant="danger" size="md" className="justify-center" onClick={onDeleteService} disabled={isMutating}>
              삭제
            </Button>
          </div>
        </div>
      </section>

      {actionError && (
        <div className="rounded-[16px] bg-red-50 p-3 text-[13px] font-semibold text-red-600">
          {actionError}
        </div>
      )}

      <CollapsiblePanel
        title="서비스 아이템"
        description="실제 예약에서 고객이 선택하는 세부 상품입니다."
        icon={<Tag className="h-5 w-5 text-blue-500" />}
        action={
          <Button variant="primary" size="md" className="justify-center" onClick={onCreateItem} disabled={isMutating}>
            <Plus className="h-4 w-4" />
            아이템 추가
          </Button>
        }
      >
        <div className="grid gap-3">
          {serviceItems.map((item) => (
            <div
              key={item.id}
              className={`rounded-[20px] border p-4 transition-colors ${
                item.id === selectedServiceItem?.id ? "border-blue-200 bg-blue-50" : "border-transparent bg-[#f7f7f7]"
              }`}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[15px] font-extrabold text-gray-900">{item.name}</span>
                    {item.id === selectedServiceItem?.id && <StatusPill tone="blue">선택됨</StatusPill>}
                    {item.isAvailable === false && <StatusPill tone="gray">비활성</StatusPill>}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-[12px] font-extrabold text-gray-500">
                    <span className="rounded-full bg-white px-3 py-1">
                      {formatCatalogPrice(item.basePrice)} · {item.durationMinutes}분
                    </span>
                    <span className="rounded-full bg-white px-3 py-1">
                      옵션은 선택 후 관리
                    </span>
                  </div>
                  {item.description && (
                    <p className="mt-2 line-clamp-2 text-[12px] font-semibold leading-relaxed text-gray-500">
                      {item.description}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2 md:justify-end">
                  <Button
                    variant={item.id === selectedServiceItem?.id ? "primary" : "ghost"}
                    size="sm"
                    className="justify-center"
                    onClick={() => onSelectServiceItem(item.id)}
                    disabled={isMutating}
                  >
                    {item.id === selectedServiceItem?.id ? "선택됨" : "옵션 보기"}
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => onEditItem(item)} disabled={isMutating}>
                    수정
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => onDeleteItem(item)} disabled={isMutating}>
                    삭제
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {serviceItems.length === 0 && (
            <div className="rounded-[20px] border border-dashed border-gray-200 px-4 py-8 text-center">
              <div className="text-[14px] font-extrabold text-gray-700">등록된 세부 아이템이 없습니다</div>
              <p className="mt-1 text-[12px] font-semibold text-gray-400">
                아이템을 추가하면 예약 단위별 가격과 소요 시간을 관리할 수 있습니다.
              </p>
            </div>
          )}
        </div>
      </CollapsiblePanel>

      {selectedServiceItem && (
        <CollapsiblePanel
          title="옵션 관리"
          description={`현재 선택한 아이템: ${selectedServiceItem.name}`}
          icon={<Plus className="h-5 w-5 text-blue-500" />}
          action={
            <Button variant="primary" size="md" className="justify-center" onClick={onCreateOption} disabled={isMutating}>
              <Plus className="h-4 w-4" />
              옵션 추가
            </Button>
          }
        >
          <div className="space-y-4">
            {Object.entries(groupedOptions).map(([group, options]) => (
              <div key={group}>
                <div className="mb-2 inline-flex rounded-full bg-[#f2f2f2] px-3 py-1 text-[12px] font-extrabold text-gray-500">
                  {group}
                </div>
                <div className="grid gap-2">
                  {options.map((option) => {
                    const isSelected = selectedOptionIds.includes(option.id);
                    return (
                      <div
                        key={option.id}
                        className={`rounded-[18px] border px-4 py-3 ${
                          isSelected ? "border-blue-200 bg-blue-50" : "border-transparent bg-[#f7f7f7]"
                        }`}
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-extrabold text-gray-900">{option.optionValue}</span>
                              {isSelected && <StatusPill tone="blue">가격 반영</StatusPill>}
                              {option.isAvailable === false && <StatusPill tone="gray">비활성</StatusPill>}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2 text-[12px] font-extrabold text-gray-500">
                              <span className="rounded-full bg-white px-3 py-1">
                                +{formatCatalogPrice(option.additionalPrice)} · +{option.additionalDuration}분
                              </span>
                            </div>
                            {option.description && (
                              <p className="mt-2 line-clamp-2 text-[12px] font-semibold leading-relaxed text-gray-500">
                                {option.description}
                              </p>
                            )}
                          </div>
                          <div className="flex shrink-0 flex-wrap gap-2 md:justify-end">
                            <Button
                              variant={isSelected ? "primary" : "ghost"}
                              size="sm"
                              className="justify-center"
                              onClick={() => onToggleOption(option.id)}
                              disabled={isMutating}
                            >
                              {isSelected ? "선택됨" : "가격 계산"}
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => onEditOption(option)} disabled={isMutating}>
                              수정
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => onDeleteOption(option)} disabled={isMutating}>
                              삭제
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {serviceItemOptions.length === 0 && (
              <div className="rounded-[20px] border border-dashed border-gray-200 px-4 py-8 text-center">
                <div className="text-[14px] font-extrabold text-gray-700">선택 가능한 옵션이 없습니다</div>
                <p className="mt-1 text-[12px] font-semibold text-gray-400">
                  옵션을 추가하면 선택 조합별 가격과 소요 시간을 바로 확인할 수 있습니다.
                </p>
              </div>
            )}
          </div>
        </CollapsiblePanel>
      )}
      {!selectedServiceItem && serviceItems.length > 0 && (
        <section className="rounded-[24px] border border-dashed border-gray-200 bg-white p-5 text-center">
          <div className="text-[15px] font-extrabold text-gray-800">아이템을 선택하면 옵션을 관리할 수 있습니다</div>
          <p className="mt-1 text-[12px] font-semibold text-gray-400">
            위 아이템 카드에서 `옵션 보기`를 눌러 옵션 추가, 수정, 삭제를 진행하세요.
          </p>
        </section>
      )}

      {priceCalculation && (
        <CollapsiblePanel
          title="선택 조합 결과"
          description="선택한 아이템과 옵션을 기준으로 최종 가격과 시간을 계산합니다."
          icon={<ShieldCheck className="h-5 w-5 text-blue-500" />}
          className="bg-blue-50"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[18px] bg-white p-4">
              <div className="text-[11px] font-extrabold text-gray-400">최종 가격</div>
              <div className="mt-1 text-[20px] font-extrabold">{formatCatalogPrice(priceCalculation.totalPrice)}</div>
            </div>
            <div className="rounded-[18px] bg-white p-4">
              <div className="text-[11px] font-extrabold text-gray-400">최종 소요</div>
              <div className="mt-1 text-[20px] font-extrabold">{priceCalculation.totalDurationMinutes}분</div>
            </div>
          </div>
        </CollapsiblePanel>
      )}

      <CollapsiblePanel
        title="운영 체크"
        description="서비스 변경 전 확인해야 할 운영 기준입니다."
        icon={<ShieldCheck className="h-5 w-5 text-blue-500" />}
        defaultOpen={false}
      >
        <div className="space-y-2">
          <ChecklistItem text="예약 페이지/AI 상담에서 이 서비스를 선택할 수 있습니다" />
          <ChecklistItem text="가격/소요 시간 변경 시 기존 예약에는 영향 없음" />
          <ChecklistItem text="비활성화하면 신규 예약에서만 제외됩니다" />
        </div>
      </CollapsiblePanel>
    </div>
  );
}

function CollapsiblePanel({
  title,
  description,
  icon,
  action,
  children,
  defaultOpen = true,
  className = "",
}: {
  title: string;
  description?: string;
  icon: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className={`rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
          aria-expanded={isOpen}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#f2f2f2]">
            {icon}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[16px] font-extrabold text-gray-900">{title}</span>
            {description && (
              <span className="mt-1 block truncate text-[12px] font-semibold text-gray-400">{description}</span>
            )}
          </span>
          <ChevronDown
            className={`ml-auto h-5 w-5 shrink-0 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>
        {action && <div className="shrink-0 sm:pl-3">{action}</div>}
      </div>
      {isOpen && <div className="mt-4">{children}</div>}
    </section>
  );
}

function ServiceAdminDetail({
  view,
  item,
  actionError,
  isMutating,
  onApprove,
  onReject,
  onApply,
  onIgnore,
  onDeactivate,
}: {
  view: ServiceView;
  item: ServiceAdminItem;
  actionError: string | null;
  isMutating: boolean;
  onApprove: () => void;
  onReject: () => void;
  onApply: () => void;
  onIgnore: () => void;
  onDeactivate: () => void;
}) {
  const current = item.current;
  const suggested = item.suggested;

  return (
    <div>
      <div className="mb-5 rounded-[20px] bg-[#f7f7f7] p-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h3 className="text-[22px] font-bold">{item.name ?? current?.name ?? suggested?.name ?? "서비스"}</h3>
          <StatusPill tone={view === "pending" ? "amber" : view === "review" ? "blue" : "gray"}>
            {view === "pending" ? "승인대기" : view === "review" ? "변경검토" : "미사용"}
          </StatusPill>
        </div>
        <p className="text-[13px] font-semibold leading-relaxed text-gray-500">
          {item.message ?? "지식 문서에서 추출된 서비스 정보를 API 기준으로 검토합니다."}
        </p>
      </div>
      {actionError && (
        <div className="mb-4 rounded-[16px] bg-red-50 p-3 text-[13px] font-semibold text-red-600">
          {actionError}
        </div>
      )}
      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <InfoCard title="현재 가격" meta="current" text={formatCatalogPrice(current?.price, current?.currency)} />
        <InfoCard
          title="현재 소요"
          meta="current"
          text={current?.durationMinutes ? `${current.durationMinutes}분` : "미설정"}
        />
        {suggested && (
          <>
            <InfoCard title="제안 가격" meta="suggested" text={formatCatalogPrice(suggested.price, suggested.currency)} />
            <InfoCard
              title="제안 소요"
              meta="suggested"
              text={suggested.durationMinutes ? `${suggested.durationMinutes}분` : "미설정"}
            />
          </>
        )}
      </div>
      {Boolean(item.missingFields?.length) && (
        <div className="mb-5 rounded-[16px] bg-amber-50 p-4 text-[13px] font-semibold text-amber-700">
          누락 필드: {item.missingFields?.join(", ")}
        </div>
      )}
      {Boolean(item.changedFields?.length) && (
        <div className="mb-5 rounded-[16px] bg-blue-50 p-4 text-[13px] font-semibold text-blue-700">
          변경 필드: {item.changedFields?.join(", ")}
        </div>
      )}
      <div className="mb-5 flex flex-wrap gap-2">
        {view === "pending" && (
          <>
            <Button variant="dark" onClick={onApprove} disabled={isMutating}>
              승인/수정
            </Button>
            <Button variant="danger" onClick={onReject} disabled={isMutating}>
              거절
            </Button>
          </>
        )}
        {view === "review" && (
          <>
            <Button variant="dark" onClick={onApply} disabled={isMutating}>
              변경 반영
            </Button>
            <Button variant="secondary" onClick={onIgnore} disabled={isMutating}>
              무시
            </Button>
          </>
        )}
        {view === "stale" && (
          <Button variant="danger" onClick={onDeactivate} disabled={isMutating}>
            비활성화
          </Button>
        )}
      </div>
      <DetailSection title="AI 추출 정보">
        <DetailRow label="source" value={item.sourceType ?? "-"} />
        <DetailRow label="sync" value={item.syncStatus ?? "-"} />
        <DetailRow label="updated" value={item.updatedAt ? new Date(item.updatedAt).toLocaleString("ko-KR") : "-"} />
      </DetailSection>
    </div>
  );
}

function ServiceEditorModal({
  mode,
  service,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: {
  mode: "create-service" | "edit-service" | "approve" | "apply";
  service: Partial<Service> | null;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (input: ServiceInput) => void;
}) {
  const [name, setName] = useState(service?.name ?? "");
  const [description, setDescription] = useState(service?.description ?? "");
  const [price, setPrice] = useState(service?.price?.toString() ?? "");
  const [durationMinutes, setDurationMinutes] = useState(service?.durationMinutes ? String(service.durationMinutes) : "");
  const [isActive, setIsActive] = useState(service?.isActive !== false);
  const [isReservable, setIsReservable] = useState(service?.isReservable !== false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = () => {
    const trimmedName = name.trim();
    const parsedDuration = Number(durationMinutes);
    const parsedPrice = price.trim() ? Number(price.replace(/,/g, "")) : null;

    if (!trimmedName) {
      setFormError("서비스명을 입력해 주세요.");
      return;
    }
    if (durationMinutes.trim() && (!Number.isFinite(parsedDuration) || parsedDuration <= 0)) {
      setFormError("소요 시간(분)을 올바르게 입력해 주세요.");
      return;
    }
    if (parsedPrice !== null && (!Number.isFinite(parsedPrice) || parsedPrice < 0)) {
      setFormError("가격을 올바르게 입력해 주세요.");
      return;
    }

    setFormError(null);
    onSubmit({
      name: trimmedName,
      description: description.trim() || null,
      price: parsedPrice,
      currency: "KRW",
      durationMinutes: durationMinutes.trim() ? parsedDuration : null,
      isActive,
      isReservable,
    });
  };

  const titleMap = {
    "create-service": "서비스 추가",
    "edit-service": "서비스 수정",
    approve: "서비스 승인",
    apply: "변경 반영",
  } as const;
  const submitLabelMap = {
    "create-service": "추가",
    "edit-service": "저장",
    approve: "승인",
    apply: "반영",
  } as const;

  return (
    <Modal title={titleMap[mode]} onClose={onClose}>
      <div className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-bold text-gray-500">서비스명</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-[14px] border border-gray-200 px-4 py-3 text-[14px] font-semibold outline-none focus:border-gray-400"
            placeholder="예: 기본 청소"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-bold text-gray-500">설명</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-[96px] w-full rounded-[14px] border border-gray-200 px-4 py-3 text-[14px] font-semibold outline-none focus:border-gray-400"
            placeholder="고객에게 보여줄 서비스 설명"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-bold text-gray-500">가격 (원)</span>
            <input
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              className="w-full rounded-[14px] border border-gray-200 px-4 py-3 text-[14px] font-semibold outline-none focus:border-gray-400"
              placeholder="30000"
              inputMode="numeric"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-bold text-gray-500">소요 시간 (분)</span>
            <input
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(event.target.value)}
              className="w-full rounded-[14px] border border-gray-200 px-4 py-3 text-[14px] font-semibold outline-none focus:border-gray-400"
              placeholder="60"
              inputMode="numeric"
            />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center justify-between rounded-[14px] bg-[#f7f7f7] px-4 py-3">
            <span className="text-[13px] font-bold text-gray-600">활성</span>
            <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
          </label>
          <label className="flex items-center justify-between rounded-[14px] bg-[#f7f7f7] px-4 py-3">
            <span className="text-[13px] font-bold text-gray-600">예약 가능</span>
            <input
              type="checkbox"
              checked={isReservable}
              onChange={(event) => setIsReservable(event.target.checked)}
            />
          </label>
        </div>
        {(formError || error) && (
          <div className="rounded-[14px] bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-600">
            {formError ?? error}
          </div>
        )}
        <ModalActions
          isSubmitting={isSubmitting}
          submitLabel={submitLabelMap[mode]}
          onClose={onClose}
          onSubmit={handleSubmit}
        />
      </div>
    </Modal>
  );
}

function ServiceItemEditorModal({
  mode,
  item,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: {
  mode: "create-item" | "edit-item";
  item: ServiceItem | null;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (input: ServiceItemInput) => void;
}) {
  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [basePrice, setBasePrice] = useState(item?.basePrice?.toString() ?? "");
  const [durationMinutes, setDurationMinutes] = useState(item?.durationMinutes?.toString() ?? "60");
  const [isAvailable, setIsAvailable] = useState(item?.isAvailable !== false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = () => {
    const parsedPrice = basePrice.trim() ? Number(basePrice.replace(/,/g, "")) : 0;
    const parsedDuration = Number(durationMinutes);
    if (!name.trim()) {
      setFormError("아이템명을 입력해 주세요.");
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setFormError("기본 가격을 올바르게 입력해 주세요.");
      return;
    }
    if (!Number.isFinite(parsedDuration) || parsedDuration <= 0) {
      setFormError("소요 시간을 올바르게 입력해 주세요.");
      return;
    }
    setFormError(null);
    onSubmit({
      name: name.trim(),
      description: description.trim() || null,
      basePrice: parsedPrice,
      durationMinutes: parsedDuration,
      isAvailable,
    });
  };

  return (
    <Modal title={mode === "create-item" ? "아이템 추가" : "아이템 수정"} onClose={onClose}>
      <div className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-bold text-gray-500">아이템명</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-[14px] border border-gray-200 px-4 py-3 text-[14px] font-semibold outline-none focus:border-gray-400"
            placeholder="예: 이사 청소"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-bold text-gray-500">설명</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-[88px] w-full rounded-[14px] border border-gray-200 px-4 py-3 text-[14px] font-semibold outline-none focus:border-gray-400"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-bold text-gray-500">기본 가격</span>
            <input
              value={basePrice}
              onChange={(event) => setBasePrice(event.target.value)}
              className="w-full rounded-[14px] border border-gray-200 px-4 py-3 text-[14px] font-semibold outline-none focus:border-gray-400"
              inputMode="numeric"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-bold text-gray-500">소요 시간(분)</span>
            <input
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(event.target.value)}
              className="w-full rounded-[14px] border border-gray-200 px-4 py-3 text-[14px] font-semibold outline-none focus:border-gray-400"
              inputMode="numeric"
            />
          </label>
        </div>
        <label className="flex items-center justify-between rounded-[14px] bg-[#f7f7f7] px-4 py-3">
          <span className="text-[13px] font-bold text-gray-600">예약 가능</span>
          <input type="checkbox" checked={isAvailable} onChange={(event) => setIsAvailable(event.target.checked)} />
        </label>
        {(formError || error) && (
          <div className="rounded-[14px] bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-600">
            {formError ?? error}
          </div>
        )}
        <ModalActions
          isSubmitting={isSubmitting}
          submitLabel={mode === "create-item" ? "추가" : "저장"}
          onClose={onClose}
          onSubmit={handleSubmit}
        />
      </div>
    </Modal>
  );
}

function ServiceOptionEditorModal({
  mode,
  option,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: {
  mode: "create-option" | "edit-option";
  option: ServiceItemOption | null;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (input: ServiceItemOptionInput) => void;
}) {
  const [optionGroup, setOptionGroup] = useState(option?.optionGroup ?? "옵션");
  const [optionValue, setOptionValue] = useState(option?.optionValue ?? "");
  const [description, setDescription] = useState(option?.description ?? "");
  const [additionalPrice, setAdditionalPrice] = useState(option?.additionalPrice?.toString() ?? "0");
  const [additionalDuration, setAdditionalDuration] = useState(option?.additionalDuration?.toString() ?? "0");
  const [isAvailable, setIsAvailable] = useState(option?.isAvailable !== false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = () => {
    const parsedPrice = Number(additionalPrice.replace(/,/g, ""));
    const parsedDuration = Number(additionalDuration);
    if (!optionValue.trim()) {
      setFormError("옵션 값을 입력해 주세요.");
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setFormError("추가 가격을 올바르게 입력해 주세요.");
      return;
    }
    if (!Number.isFinite(parsedDuration) || parsedDuration < 0) {
      setFormError("추가 시간을 올바르게 입력해 주세요.");
      return;
    }
    setFormError(null);
    onSubmit({
      optionGroup: optionGroup.trim() || "옵션",
      optionValue: optionValue.trim(),
      description: description.trim() || null,
      additionalPrice: parsedPrice,
      additionalDuration: parsedDuration,
      isAvailable,
    });
  };

  return (
    <Modal title={mode === "create-option" ? "옵션 추가" : "옵션 수정"} onClose={onClose}>
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-bold text-gray-500">옵션 그룹</span>
            <input
              value={optionGroup}
              onChange={(event) => setOptionGroup(event.target.value)}
              className="w-full rounded-[14px] border border-gray-200 px-4 py-3 text-[14px] font-semibold outline-none focus:border-gray-400"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-bold text-gray-500">옵션 값</span>
            <input
              value={optionValue}
              onChange={(event) => setOptionValue(event.target.value)}
              className="w-full rounded-[14px] border border-gray-200 px-4 py-3 text-[14px] font-semibold outline-none focus:border-gray-400"
              placeholder="예: 34평형"
            />
          </label>
        </div>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-bold text-gray-500">설명</span>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="min-h-[80px] w-full rounded-[14px] border border-gray-200 px-4 py-3 text-[14px] font-semibold outline-none focus:border-gray-400"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-bold text-gray-500">추가 가격</span>
            <input
              value={additionalPrice}
              onChange={(event) => setAdditionalPrice(event.target.value)}
              className="w-full rounded-[14px] border border-gray-200 px-4 py-3 text-[14px] font-semibold outline-none focus:border-gray-400"
              inputMode="numeric"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-bold text-gray-500">추가 시간(분)</span>
            <input
              value={additionalDuration}
              onChange={(event) => setAdditionalDuration(event.target.value)}
              className="w-full rounded-[14px] border border-gray-200 px-4 py-3 text-[14px] font-semibold outline-none focus:border-gray-400"
              inputMode="numeric"
            />
          </label>
        </div>
        <label className="flex items-center justify-between rounded-[14px] bg-[#f7f7f7] px-4 py-3">
          <span className="text-[13px] font-bold text-gray-600">선택 가능</span>
          <input type="checkbox" checked={isAvailable} onChange={(event) => setIsAvailable(event.target.checked)} />
        </label>
        {(formError || error) && (
          <div className="rounded-[14px] bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-600">
            {formError ?? error}
          </div>
        )}
        <ModalActions
          isSubmitting={isSubmitting}
          submitLabel={mode === "create-option" ? "추가" : "저장"}
          onClose={onClose}
          onSubmit={handleSubmit}
        />
      </div>
    </Modal>
  );
}

function ServiceDetailPanel({ service }: { service: Service | null }) {
  return (
    <DetailSidebar>
      <DetailIntro
        icon={<ShieldCheck className="h-5 w-5 text-blue-500" />}
        title="서비스 상세"
        description="예약받을 서비스 정보와 운영 기준을 오른쪽에서 고정 확인합니다."
      />
      <DetailSection title="운영 정책">
        <DetailRow label="예약 승인" value="관리자 확인 필요" />
        <DetailRow label="취소 정책" value="고객 취소 허용" />
        <DetailRow label="로그 저장" value="Supabase" />
      </DetailSection>
      <DetailSection title="체크리스트">
        <ChecklistItem text="서비스명/가격/소요 시간이 최신인지 확인" />
        <ChecklistItem text="AI 상담이 안내하는 서비스 설명과 일치하는지 확인" />
        <ChecklistItem text="비활성 서비스는 예약 생성에서 제외" />
      </DetailSection>
      {service && (
        <DetailSection title="선택된 서비스">
          <DetailRow label="서비스 ID" value={service.id.slice(0, 8)} />
          <DetailRow label="소요 시간" value={service.durationMinutes ? `${service.durationMinutes}분` : "아이템별"} />
          <DetailRow label="가격" value={formatServicePrice(service)} />
        </DetailSection>
      )}
    </DetailSidebar>
  );
}

function OutboundMain() {
  return (
    <OperationsInboxLayout
      title="알림 발송"
      subtitle="채널별 발송 큐와 템플릿 상태"
      sidebarTitle="발송"
      listTitle="발송 큐"
      views={[
        { label: "전체 발송", count: "149", icon: <Send className="h-4 w-4" />, active: true },
        { label: "예약됨", count: "32", icon: <CalendarClock className="h-4 w-4" /> },
        { label: "승인 필요", count: "6", icon: <ShieldCheck className="h-4 w-4" /> },
        { label: "실패", count: "2", icon: <AlertTriangle className="h-4 w-4" /> },
      ]}
      groups={[
        {
          title: "채널",
          items: [
            { label: "채널톡", count: "82", icon: <MessageCircle className="h-4 w-4" /> },
            { label: "SMS", count: "41", icon: <Phone className="h-4 w-4" /> },
            { label: "이메일", count: "26", icon: <Mail className="h-4 w-4" /> },
          ],
        },
      ]}
      tabs={["대기", "예약", "발송됨", "실패"]}
      items={[
        {
          id: "outbound-refund",
          title: "환불 처리 완료 안내",
          owner: "박지은",
          description: "보상 적립금 포함, 민감 문구 확인 완료",
          status: "예약됨",
          tone: "blue",
          meta: "채널톡 · 17:00",
          avatar: "박",
        },
        {
          id: "outbound-shipping",
          title: "배송 지연 안내",
          owner: "이종혁",
          description: "송장 확인 후 자동 발송",
          status: "대기",
          tone: "amber",
          meta: "SMS · 도구 재시도",
          avatar: "이",
        },
        {
          id: "outbound-reservation",
          title: "예약 확인 알림",
          owner: "오예진",
          description: "방문 전날 18:00 자동 발송",
          status: "자동",
          tone: "green",
          meta: "알림톡 · 템플릿 A",
          avatar: "오",
        },
      ]}
      detail={
        <CustomerProfileDetail
          title="환불 처리 완료 안내"
          subtitle="박지은 · 채널톡 예약 발송"
          rows={[
            ["수신자", "박지은"],
            ["채널", "채널톡"],
            ["발송 시각", "오늘 17:00"],
            ["템플릿", "환불 완료 v3"],
          ]}
          checks={[
            "환불 완료 이벤트와 상담 로그 매칭",
            "보상 금액은 승인된 정책 기준으로 삽입",
            "민감 고객은 발송 후 담당자 팔로업 생성",
          ]}
        />
      }
    />
  );
}

function CallsMain({ user }: { user: User }) {
  const organizationId = getOrganizationId(user);
  const [calls, setCalls] = useState<AiCall[]>([]);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<"전체" | "진행중" | "종료">("전체");

  useEffect(() => {
    let isMounted = true;

    function load() {
      return fetchConversations(organizationId, "web_call")
        .then((items) => {
          if (!isMounted) return;
          const mapped = items.map(callToAiCall);
          setCalls(mapped);
          setSelectedCallId((current) => current ?? mapped[0]?.id ?? null);
        })
        .catch(() => {
          if (isMounted) setCalls([]);
        });
    }

    load();
    const intervalId = window.setInterval(load, CALLS_POLL_INTERVAL_MS);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [organizationId]);

  const activeCall = calls.find((call) => call.id === selectedCallId) ?? calls[0] ?? null;
  const activeCallId = activeCall?.id ?? null;

  useEffect(() => {
    if (!activeCallId) return;

    let isMounted = true;

    fetchConversationMessages(organizationId, activeCallId)
      .then((messages) => {
        if (!isMounted) return;
        setTranscript(
          messages.map(
            (message) => `${message.senderType === "customer" ? "고객" : "AI"}: ${message.message}`,
          ),
        );
      })
      .catch(() => {
        if (isMounted) setTranscript([]);
      });

    return () => {
      isMounted = false;
    };
  }, [organizationId, activeCallId]);

  const activeCallCount = calls.filter((call) => call.status === "ai-answering").length;
  const endedCallCount = calls.filter((call) => call.status === "callback").length;
  const visibleCalls = calls.filter((call) => {
    if (statusFilter === "진행중") return call.status === "ai-answering";
    if (statusFilter === "종료") return call.status === "callback";
    return true;
  });
  const activeTranscript = activeCall ? transcript : [];

  return (
    <>
      <section className="grid min-h-0 min-w-0 overflow-hidden rounded-[20px] bg-[#fafafa] grid-cols-[230px_minmax(0,1fr)]">
        <CallInboxSidebar
          totalCount={calls.length}
          activeCount={activeCallCount}
          endedCount={endedCallCount}
          activeFilter={statusFilter}
          onFilterSelect={setStatusFilter}
        />
        <div className="flex min-h-0 min-w-0 flex-col px-4 py-7">
          <OperationsListHeader
            title="AI 통화중"
            subtitle={`${visibleCalls.length}개`}
            listTitle="통화방"
            tabs={["전체", "진행중", "종료"]}
            activeTab={statusFilter}
            onTabSelect={(tab) => setStatusFilter(tab as "전체" | "진행중" | "종료")}
          />
          <div className="mb-4 grid grid-cols-2 gap-2">
            <CallMetric label="AI 통화중" value={String(activeCallCount)} tone="blue" />
            <CallMetric label="종료된 통화" value={String(endedCallCount)} tone="green" />
          </div>
          {visibleCalls.length === 0 ? (
            <div className="rounded-[16px] bg-white p-4 text-[14px] font-semibold text-gray-400">
              아직 통화 기록이 없습니다.
            </div>
          ) : (
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              {visibleCalls.map((call) => (
                <button
                  key={call.id}
                  onClick={() => setSelectedCallId(call.id)}
                  className={`w-full rounded-[16px] p-3 text-left transition-colors ${
                    call.id === activeCall?.id ? "bg-[#e9e9e9]" : "hover:bg-white"
                  }`}
                >
                  <AiCallListItem call={call} />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
      <section className="h-full min-h-0 min-w-0 overflow-hidden rounded-[20px] bg-white">
        {activeCall ? (
          <ActiveCallPanel call={activeCall} transcript={activeTranscript} />
        ) : (
          <div className="flex h-full items-center justify-center text-[14px] font-semibold text-gray-400">
            통화를 선택하면 상세 내용이 표시됩니다.
          </div>
        )}
      </section>
    </>
  );
}

function OperationsInboxLayout({
  title,
  subtitle,
  sidebarTitle,
  views,
  groups,
  listTitle,
  tabs,
  items,
  detail,
  selectedItemId,
  onSelectItem,
  activeTab,
  onTabSelect,
  primaryAction,
}: {
  title: string;
  subtitle: string;
  sidebarTitle: string;
  views: SidebarView[];
  groups: { title: string; items: SidebarView[] }[];
  listTitle: string;
  tabs: string[];
  items: OperationsItem[];
  detail: ReactNode;
  selectedItemId?: string;
  onSelectItem?: (id: string) => void;
  activeTab?: string;
  onTabSelect?: (tab: string) => void;
  primaryAction?: { label: string; onClick: () => void };
}) {
  return (
    <>
      <section className="grid h-full min-h-0 min-w-0 overflow-hidden rounded-[20px] bg-[#fafafa] grid-cols-[230px_minmax(0,1fr)]">
        <OperationsSidebar sidebarTitle={sidebarTitle} views={views} groups={groups} />
        <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden px-4 py-7">
          <OperationsListHeader
            title={title}
            subtitle={subtitle}
            listTitle={listTitle}
            tabs={tabs}
            activeTab={activeTab}
            onTabSelect={onTabSelect}
            primaryAction={primaryAction}
          />
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1">
            {items.length === 0 && (
              <div className="rounded-[16px] bg-white px-4 py-5 text-center text-[13px] font-semibold text-gray-400">
                표시할 항목이 없습니다.
              </div>
            )}
            {items.map((item, index) => {
              const isSelected = selectedItemId ? item.id === selectedItemId : index === 0;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectItem?.(item.id)}
                  className={`w-full rounded-[16px] p-3 text-left transition-colors ${
                    isSelected ? "bg-[#e9e9e9]" : "hover:bg-white"
                  }`}
                >
                  <OperationListItem item={item} />
                </button>
              );
            })}
          </div>
        </div>
      </section>
      <section className="h-full min-h-0 min-w-0 overflow-y-auto overscroll-contain rounded-[20px] bg-white px-6 py-7">
        {detail}
      </section>
    </>
  );
}

function OperationsSidebar({
  sidebarTitle,
  views,
  groups,
}: {
  sidebarTitle: string;
  views: SidebarView[];
  groups: { title: string; items: SidebarView[] }[];
}) {
  return (
    <aside className="h-full min-h-0 min-w-0 overflow-y-auto overscroll-contain border-r border-gray-200/80 px-5 py-7">
      <div className="mb-7 flex items-center justify-between">
        <h2 className="text-[28px] font-bold">{sidebarTitle}</h2>
        <ChevronDown className="h-5 w-5 text-gray-400" />
      </div>
      <div className="-mx-5 grid gap-1">
        {views.map((view) => (
          <div key={view.label}>
            <OperationsSidebarButton view={view} flush />
          </div>
        ))}
      </div>
      {groups.map((group) => (
        <div key={group.title} className="mt-5 border-t border-gray-200/80 pt-5">
          <button className="mb-2 flex items-center gap-1 text-[15px] font-bold">
            {group.title}
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>
          <div className="grid gap-1">
            {group.items.map((view) => (
              <div key={view.label}>
                <OperationsSidebarButton view={view} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </aside>
  );
}

function OperationsSidebarButton({
  view,
  flush = false,
}: {
  view: SidebarView;
  flush?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={view.onClick}
      className={`flex w-full items-center justify-between py-2.5 text-left text-[15px] font-bold ${
        flush ? "rounded-none px-5" : "rounded-[12px] px-3"
      } ${view.active ? "bg-[#e8e8e8] text-gray-950" : "text-gray-600 hover:bg-white"}`}
    >
      <span className="flex min-w-0 items-center gap-2">
        {view.icon}
        <span className="truncate">{view.label}</span>
      </span>
      <span className="text-[13px] text-gray-400">{view.count}</span>
    </button>
  );
}

function OperationsListHeader({
  title,
  subtitle,
  listTitle,
  tabs,
  activeTab,
  onTabSelect,
  primaryAction,
}: {
  title: string;
  subtitle: string;
  listTitle: string;
  tabs: string[];
  activeTab?: string;
  onTabSelect?: (tab: string) => void;
  primaryAction?: { label: string; onClick: () => void };
}) {
  return (
    <>
      <div className="mb-7 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-[26px] font-bold">{title}</h3>
          <p className="mt-1 truncate text-[13px] font-bold text-gray-400">{subtitle}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3 text-gray-500">
          {primaryAction && (
            <Button variant="dark" size="sm" onClick={primaryAction.onClick}>
              <Plus className="mr-1.5 h-4 w-4" />
              {primaryAction.label}
            </Button>
          )}
          <Search className="h-5 w-5" />
          <Check className="h-5 w-5" />
          <ChevronDown className="h-5 w-5" />
        </div>
      </div>
      <div className="mb-4">
        <div className="mb-3">
          <TabRow tabs={tabs} active={activeTab} onChange={onTabSelect} />
        </div>
        <div className="flex items-center justify-between px-1">
          <h4 className="text-sm font-bold text-gray-500">{listTitle}</h4>
          <span className="text-xs font-bold text-gray-400">최근순</span>
        </div>
      </div>
    </>
  );
}

function OperationListItem({ item }: { item: OperationsItem }) {
  return (
    <div className="flex gap-3">
      <Avatar label={item.avatar} size="lg" />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between gap-2">
          <div className="truncate text-[16px] font-bold">
            {item.title}
            <span className="ml-2 text-[12px] text-gray-400">· {item.owner}</span>
          </div>
        </div>
        {item.badges && item.badges.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {item.badges.map((badge) => (
              <StatusPill key={`${item.id}-${badge.label}`} tone={badge.tone}>
                {badge.label}
              </StatusPill>
            ))}
          </div>
        )}
        <p className="truncate text-[13px] font-semibold text-gray-500">{item.description}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <StatusPill tone={item.tone}>{item.status}</StatusPill>
          <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-gray-500">
            {item.meta}
          </span>
        </div>
      </div>
    </div>
  );
}

function CustomerProfileDetail({
  title,
  subtitle,
  rows,
  checks,
}: {
  title: string;
  subtitle: string;
  rows: [string, string][];
  checks: string[];
}) {
  return (
    <div>
      <div className="mb-5 rounded-[20px] bg-[#f7f7f7] p-5">
        <div className="mb-3 flex items-center gap-3">
          <Avatar label={title[0]} size="lg" />
          <div className="min-w-0">
            <h3 className="truncate text-[22px] font-bold">{title}</h3>
            <p className="truncate text-[13px] font-bold text-gray-400">{subtitle}</p>
          </div>
        </div>
        <p className="text-[13px] font-semibold leading-relaxed text-gray-500">
          현재 선택된 항목의 이력, 운영 조건, 다음 액션을 상담창처럼 한 화면에서 확인합니다.
        </p>
      </div>
      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label}>
            <InfoCard title={label} meta="상태" text={value} />
          </div>
        ))}
      </div>
      <div className="mb-5">
        <SectionHeading
          icon={<ShieldCheck className="h-5 w-5 text-blue-500" />}
          title="운영 체크"
        />
        <div className="space-y-2">
          {checks.map((check) => (
            <div key={check}>
              <ChecklistItem text={check} />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-[20px] border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-3 text-[14px] font-bold text-gray-500">내부 메모</div>
        <div className="rounded-[16px] bg-[#f7f7f7] px-4 py-3 text-[14px] font-semibold leading-relaxed text-gray-500">
          상담사에게 보일 메모와 AI 추천 액션이 이 영역에 누적됩니다.
        </div>
      </div>
    </div>
  );
}

function CallInboxSidebar({
  totalCount,
  activeCount,
  endedCount,
  activeFilter,
  onFilterSelect,
}: {
  totalCount: number;
  activeCount: number;
  endedCount: number;
  activeFilter: "전체" | "진행중" | "종료";
  onFilterSelect: (filter: "전체" | "진행중" | "종료") => void;
}) {
  return (
    <aside className="min-w-0 overflow-y-auto border-r border-gray-200/80 px-5 py-7">
      <div className="mb-7 flex items-center justify-between">
        <h2 className="text-[28px] font-bold">전화</h2>
        <Phone className="h-5 w-5 text-gray-400" />
      </div>
      <div className="-mx-5 grid gap-1">
        <CallSidebarButton
          active={activeFilter === "전체"}
          label="전체 통화"
          count={String(totalCount)}
          icon={<Phone className="h-4 w-4" />}
          onClick={() => onFilterSelect("전체")}
        />
        <CallSidebarButton
          active={activeFilter === "진행중"}
          label="AI 통화중"
          count={String(activeCount)}
          icon={<Volume2 className="h-4 w-4" />}
          onClick={() => onFilterSelect("진행중")}
        />
        <CallSidebarButton
          active={activeFilter === "종료"}
          label="종료된 통화"
          count={String(endedCount)}
          icon={<Headphones className="h-4 w-4" />}
          onClick={() => onFilterSelect("종료")}
        />
      </div>
      <div className="mt-5 border-t border-gray-200/80 pt-5">
        <button className="mb-2 flex items-center gap-1 text-[15px] font-bold">
          담당자
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>
        <div className="grid gap-1">
          {["이지현 3", "김수현 2", "배지희 4", "한지윤 1"].map((item) => {
            const [name, count] = item.split(" ");
            return (
              <div key={item}>
                <CallSidebarButton
                  label={name}
                  count={count}
                  icon={<Avatar label={name[0]} size="sm" />}
                />
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

function CallSidebarButton({
  label,
  count,
  icon,
  active,
  onClick,
}: {
  label: string;
  count: string;
  icon: ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center justify-between py-2.5 text-left text-[15px] font-bold ${
        active ? "bg-[#e8e8e8] text-gray-950" : "text-gray-600 hover:bg-white"
      } rounded-none px-5`}
    >
      <span className="flex min-w-0 items-center gap-2">
        {icon}
        <span className="truncate">{label}</span>
      </span>
      <span className="text-[13px] text-gray-400">{count}</span>
    </button>
  );
}

function ClockIcon() {
  return <CalendarClock className="h-4 w-4" />;
}

function CallMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "blue" | "red" | "amber" | "green";
}) {
  const toneClass = {
    blue: "text-blue-600",
    red: "text-red-600",
    amber: "text-amber-600",
    green: "text-green-600",
  }[tone];

  return (
    <div className="rounded-[16px] bg-white p-3">
      <div className="text-[11px] font-bold text-gray-400">{label}</div>
      <div className={`mt-1 text-[20px] font-extrabold ${toneClass}`}>{value}</div>
    </div>
  );
}

function AiCallListItem({ call }: { call: AiCall }) {
  const statusTone =
    call.status === "handoff-ready"
      ? "red"
      : call.status === "callback"
        ? "amber"
        : call.status === "agent-connected"
          ? "blue"
          : "green";

  return (
    <div className="flex gap-3">
      <Avatar label={call.customer[0]} size="lg" />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between gap-2">
          <div className="truncate text-[16px] font-bold">
            {call.customer}
            {call.intent && <span className="ml-2 text-[12px] text-gray-400">· {call.intent}</span>}
          </div>
          <span className="text-[12px] font-bold text-gray-400">{call.duration}</span>
        </div>
        <p className="truncate text-[13px] font-semibold text-gray-500">{call.summary}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <StatusPill tone={statusTone}>{callStatusLabel[call.status]}</StatusPill>
          {call.task && (
            <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-gray-500">
              {call.task}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function ActiveCallPanel({ call, transcript }: { call: AiCall; transcript: string[] }) {
  const [activeTab, setActiveTab] = useState<"conversation" | "logs">(
    "conversation",
  );

  return (
    <main className="relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white">
      <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-gray-100 px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Star className="h-5 w-5 shrink-0 text-gray-400" />
          <div className="min-w-0">
            <h2 className="truncate text-[22px] font-bold">{call.customer}</h2>
            {(call.phone || call.intent) && (
              <p className="truncate text-[12px] font-bold text-gray-400">
                {[call.phone, call.intent].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-4 text-gray-500">
          <Volume2 className="h-5 w-5" />
          <MoreVertical className="h-5 w-5" />
          <StatusPill tone={call.canTakeOver ? "blue" : "green"}>{callStatusLabel[call.status]}</StatusPill>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-6 py-5">
        <div className="mb-5 grid w-full max-w-[360px] grid-cols-2 rounded-full bg-[#f4f4f4] p-1 text-[13px] font-bold">
          <button
            onClick={() => setActiveTab("conversation")}
            className={`rounded-full px-3 py-2 ${
              activeTab === "conversation"
                ? "bg-white text-gray-950 shadow-sm"
                : "text-gray-400"
            }`}
          >
            실시간 대화
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`rounded-full px-3 py-2 ${
              activeTab === "logs"
                ? "bg-white text-gray-950 shadow-sm"
                : "text-gray-400"
            }`}
          >
            로그
          </button>
        </div>

        {activeTab === "conversation" ? (
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-[13px] font-bold text-blue-700">
              <Mic className="h-4 w-4" />
              실시간 대화 수신중
            </div>
            <div className="space-y-4">
              {transcript.map((line) => {
                const isCustomer = line.startsWith("고객:");
                return (
                  <div
                    key={line}
                    className={`max-w-[72%] rounded-[18px] px-5 py-3 text-[15px] font-semibold leading-relaxed ${
                      isCustomer
                        ? "ml-auto rounded-tr-[8px] bg-[#eeeeee] text-gray-800"
                        : "rounded-tl-[8px] bg-blue-50 text-blue-800"
                    }`}
                  >
                    {line}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <div className="rounded-[16px] bg-[#f7f7f7] px-4 py-3 text-[13px] font-semibold text-gray-400">
              아직 단계별 실행 로그를 기록하는 기능이 없습니다.
            </div>
          </div>
        )}
      </div>

      {call.canTakeOver && (
        <div className="shrink-0 border-t border-gray-100 bg-white px-6 py-4">
          <div className="rounded-[18px] bg-red-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-[14px] font-bold text-red-600">
              <AlertTriangle className="h-4 w-4" />
              진행 중인 통화
            </div>
            <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-black px-4 py-3 text-[14px] font-bold text-white">
              <Headphones className="h-4 w-4" />
              지금 통화 이어받기
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function CustomerDetailPanel({
  activeSection,
}: {
  activeSection: Exclude<CustomerSection, "conversations">;
}) {
  if (activeSection === "calls") {
    return <CallOperationsDetailPanel call={aiCalls[0]} />;
  }

  const titleMap: Record<Exclude<CustomerSection, "conversations">, string> = {
    customers: "고객 상세",
    appointments: "예약 상세",
    campaigns: "서비스 상세",
    outbound: "발송 상세",
    calls: "전화 상세",
  };

  return (
    <DetailSidebar>
      <DetailIntro
        icon={<ShieldCheck className="h-5 w-5 text-blue-500" />}
        title={titleMap[activeSection]}
        description="선택한 업무의 정책, 처리 기준, 최근 변경 이력을 오른쪽에서 고정 확인합니다."
      />
      <DetailSection title="운영 정책">
        <DetailRow label="SLA" value="5분 이내" />
        <DetailRow label="승인 기준" value="고위험 자동 보류" />
        <DetailRow label="로그 저장" value="Supabase" />
      </DetailSection>
      <DetailSection title="체크리스트">
        <ChecklistItem text="고객 동의와 민감 정보 마스킹 확인" />
        <ChecklistItem text="AI 추천 액션은 담당자 승인 후 실행" />
        <ChecklistItem text="완료 후 이벤트와 태그를 상담 로그에 남김" />
      </DetailSection>
      <DetailSection title="최근 변경">
        <TimelineItem title="오늘 01:28 PM" text="고위험 고객 자동 보류 규칙이 업데이트되었습니다." />
        <TimelineItem title="어제 12:00 PM" text="예약 변경 태스크에 임시 점유 만료 알림이 추가되었습니다." />
      </DetailSection>
    </DetailSidebar>
  );
}

function CallOperationsDetailPanel({ call }: { call: AiCall }) {
  const sentimentLabel =
    call.sentiment === "critical"
      ? "불만 높음"
      : call.sentiment === "warning"
        ? "주의"
        : "정상";

  return (
    <DetailSidebar>
      <div className="mb-7 flex items-center justify-between">
        <h2 className="text-[24px] font-bold">상세 정보</h2>
        <PanelRight className="h-5 w-5 text-gray-400" />
      </div>

      <DetailSection title="통화 상태">
        <DetailRow label="상태" value={callStatusLabel[call.status]} />
        <DetailRow label="의도" value={call.intent} />
        <DetailRow label="감정" value={sentimentLabel} />
        <DetailRow label="통화 시간" value={call.duration} />
        <DetailRow label="태스크" value={call.task} />
        <DetailRow label="이어받기" value={call.canTakeOver ? "가능" : "콜백 처리"} />
      </DetailSection>

      <DetailSection title="고객 정보">
        <div className="mb-4 flex items-center gap-3">
          <Avatar label={call.customer[0]} size="lg" />
          <div>
            <div className="font-bold">{call.customer}</div>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[12px] font-bold">전화 고객</span>
          </div>
        </div>
        <DetailRow label="대표 번호" value={call.phone} />
        <DetailRow label="담당자" value={call.owner} />
        <DetailRow label="우선순위" value={call.sentiment === "critical" ? "높음" : "보통"} />
      </DetailSection>

      <DetailSection title="AI 처리 정보">
        <DetailRow label="AI 상담원" value={call.aiAgent} />
        <DetailRow label="라우팅" value="불만/환불 큐" />
        <div className="rounded-[16px] bg-[#f7f7f7] p-4">
          <div className="mb-1 text-[13px] font-bold text-gray-500">AI 요약</div>
          <p className="text-[13px] font-semibold leading-relaxed text-gray-500">{call.summary}</p>
        </div>
        <div className="rounded-[16px] bg-red-50 p-4">
          <div className="mb-1 text-[13px] font-bold text-red-600">다음 액션</div>
          <p className="text-[13px] font-semibold leading-relaxed text-red-700">{call.nextAction}</p>
        </div>
      </DetailSection>

      <DetailSection title="이벤트">
        <TimelineItem title="실시간" text={`${call.customer} 통화가 ${callStatusLabel[call.status]} 상태입니다.`} />
        <TimelineItem title="1분 전" text="환불 접수 조회 도구가 실행되었습니다." />
        <TimelineItem title="2분 전" text="의도 분류와 감정 분석이 완료되었습니다." />
      </DetailSection>
    </DetailSidebar>
  );
}

