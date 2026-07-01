export type Conversation = {
  id: string;
  customer: string;
  assignee: string;
  channel: string;
  time: string;
  preview: string;
  tags: string[];
  avatar: string;
  selected?: boolean;
  isLive?: boolean;
  isInternalTest?: boolean;
  callStartedAt?: string | null;
  callEndedAt?: string | null;
  callDurationSeconds?: number | null;
};

export type ConversationMessage = {
  id: string;
  conversationId: string;
  senderType: "customer" | "ai" | "admin" | "system";
  senderName?: string | null;
  message: string;
  createdAt?: string | null;
};

export type DashboardPage =
  | "inbox"
  | "customers"
  | "team"
  | "ai"
  | "calls"
  | "settings";

export type CustomerSection =
  | "conversations"
  | "customers"
  | "appointments"
  | "campaigns"
  | "outbound"
  | "calls";

export type TeamSection =
  | "overview"
  | "assignment"
  | "schedule"
  | "quality"
  | "permissions"
  | "alerts";

export type AiCallStatus =
  | "ai-answering"
  | "handoff-ready"
  | "agent-connected"
  | "callback";

export type AiCall = {
  id: string;
  customer: string;
  phone: string;
  status: AiCallStatus;
  intent: string;
  sentiment: "normal" | "warning" | "critical";
  aiAgent: string;
  owner: string;
  duration: string;
  transcript: string[];
  summary: string;
  nextAction: string;
  task: string;
  canTakeOver: boolean;
};

export type ReservationStatus =
  | "requested"
  | "confirmed"
  | "cancelled"
  | "rejected"
  | "completed"
  | "no_show";

export type Reservation = {
  id: string;
  organizationId: string;
  conversationId?: string | null;
  customerId?: string | null;
  serviceId?: string | null;
  calendarId?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  startAt: string;
  endAt: string;
  timezone?: string | null;
  status: ReservationStatus;
  sourceChannel?: string | null;
  memo?: string | null;
  createdBy?: string | null;
  confirmedAt?: string | null;
  cancelledAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type Service = {
  id: string;
  organizationId: string;
  name: string;
  description?: string | null;
  price?: number | null;
  currency?: string | null;
  durationMinutes?: number | null;
  isActive?: boolean;
  isReservable?: boolean;
  approvalStatus?: string | null;
  syncStatus?: string | null;
  sourceType?: string | null;
  sourceId?: string | null;
  confidence?: number | null;
  rawPayload?: Record<string, unknown> | null;
  pendingPayload?: Record<string, unknown> | null;
  lastExtractedAt?: string | null;
  approvedAt?: string | null;
  approvedBy?: string | null;
  rejectedReason?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type ServiceItem = {
  id: string;
  organizationId: string;
  serviceId: string;
  name: string;
  description?: string | null;
  basePrice: number;
  durationMinutes: number;
  isAvailable?: boolean;
  rawPayload?: Record<string, unknown> | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type ServiceItemOption = {
  id: string;
  organizationId: string;
  serviceItemId: string;
  optionGroup: string;
  optionValue: string;
  description?: string | null;
  additionalPrice: number;
  additionalDuration: number;
  isAvailable?: boolean;
  rawPayload?: Record<string, unknown> | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type ServicePriceCalculation = {
  organizationId: string;
  serviceItemId: string;
  optionIds: string[];
  basePrice: number;
  optionsPrice: number;
  totalPrice: number;
  baseDurationMinutes: number;
  optionsDurationMinutes: number;
  totalDurationMinutes: number;
  orderedSummary?: Record<string, unknown>;
};

export type ServiceAdminItem = {
  id: string;
  organizationId: string;
  status?: string | null;
  syncStatus?: string | null;
  sourceType?: string | null;
  sourceId?: string | null;
  name?: string | null;
  current?: Partial<Service>;
  suggested?: Partial<Service>;
  canApprove?: boolean;
  missingFields?: string[];
  changedFields?: string[];
  hasChanges?: boolean;
  canDeactivate?: boolean;
  message?: string;
  ai?: Record<string, unknown>;
  createdAt?: string | null;
  updatedAt?: string | null;
  lastExtractedAt?: string | null;
};

export type BookingSetting = {
  id: string;
  organizationId: string;
  name: string;
  timezone: string;
  slotIntervalMinutes: number;
  minNoticeMinutes: number;
  maxDaysAhead: number;
  requiresApproval: boolean;
  allowCustomerCancel: boolean;
  weeklyHours: Array<Record<string, unknown>>;
  exceptions: Array<Record<string, unknown>>;
  servicePolicyOverrides: Record<string, unknown>;
  legacyCalendarIds: unknown[];
  isActive: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type AvailableSlot = {
  startAt: string;
  endAt: string;
  timezone?: string | null;
  serviceId?: string | null;
  calendarId?: string | null;
  available?: boolean;
};
