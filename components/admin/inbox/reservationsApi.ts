import type {
  AvailableSlot,
  BookingSetting,
  Reservation,
  ReservationStatus,
  Service,
  ServiceAdminItem,
  ServiceItem,
  ServiceItemOption,
  ServicePriceCalculation,
} from "../types";
import { getAgentApiBaseUrl, readAgentApiError } from "../../../lib/agentApiBase";

type ReservationRecord = {
  id: string;
  organization_id: string;
  conversation_id?: string | null;
  customer_id?: string | null;
  service_id?: string | null;
  calendar_id?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_email?: string | null;
  start_at: string;
  end_at: string;
  timezone?: string | null;
  status: string;
  source_channel?: string | null;
  memo?: string | null;
  created_by?: string | null;
  confirmed_at?: string | null;
  cancelled_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type ServiceRecord = {
  id: string;
  organization_id: string;
  name: string;
  description?: string | null;
  price?: number | null;
  currency?: string | null;
  duration_minutes?: number | null;
  is_active?: boolean | null;
  is_reservable?: boolean | null;
  approval_status?: string | null;
  sync_status?: string | null;
  source_type?: string | null;
  source_id?: string | null;
  confidence?: number | null;
  raw_payload?: Record<string, unknown> | null;
  pending_payload?: Record<string, unknown> | null;
  last_extracted_at?: string | null;
  approved_at?: string | null;
  approved_by?: string | null;
  rejected_reason?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type ServiceItemRecord = {
  id: string;
  organization_id: string;
  service_id: string;
  name: string;
  description?: string | null;
  base_price?: number | null;
  duration_minutes?: number | null;
  is_available?: boolean | null;
  raw_payload?: Record<string, unknown> | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type ServiceItemOptionRecord = {
  id: string;
  organization_id: string;
  service_item_id: string;
  option_group?: string | null;
  option_value?: string | null;
  description?: string | null;
  additional_price?: number | null;
  additional_duration?: number | null;
  is_available?: boolean | null;
  raw_payload?: Record<string, unknown> | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type ServiceAdminRecord = {
  id: string;
  organization_id: string;
  status?: string | null;
  sync_status?: string | null;
  source_type?: string | null;
  source_id?: string | null;
  name?: string | null;
  current?: Record<string, unknown>;
  suggested?: Record<string, unknown>;
  can_approve?: boolean;
  missing_fields?: string[];
  changed_fields?: string[];
  has_changes?: boolean;
  can_deactivate?: boolean;
  message?: string;
  ai?: Record<string, unknown>;
  created_at?: string | null;
  updated_at?: string | null;
  last_extracted_at?: string | null;
};

export type ServiceInput = {
  name: string;
  description?: string | null;
  price?: number | null;
  currency?: string | null;
  durationMinutes?: number | null;
  isActive?: boolean;
  isReservable?: boolean;
};

export type ServiceItemInput = {
  name: string;
  description?: string | null;
  basePrice?: number | null;
  durationMinutes?: number | null;
  isAvailable?: boolean;
};

export type ServiceItemOptionInput = {
  optionGroup?: string | null;
  optionValue: string;
  description?: string | null;
  additionalPrice?: number | null;
  additionalDuration?: number | null;
  isAvailable?: boolean;
};

type BookingSettingRecord = {
  id: string;
  organization_id: string;
  name?: string | null;
  timezone?: string | null;
  slot_interval_minutes?: number | null;
  min_notice_minutes?: number | null;
  max_days_ahead?: number | null;
  requires_approval?: boolean | null;
  allow_customer_cancel?: boolean | null;
  weekly_hours?: Array<Record<string, unknown>> | null;
  exceptions?: Array<Record<string, unknown>> | null;
  service_policy_overrides?: Record<string, unknown> | null;
  legacy_calendar_ids?: unknown[] | null;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type AvailableSlotRecord = {
  start_at?: string;
  end_at?: string;
  timezone?: string | null;
  service_id?: string | null;
  calendar_id?: string | null;
  available?: boolean;
};

function mapReservationRecord(record: ReservationRecord): Reservation {
  return {
    id: record.id,
    organizationId: record.organization_id,
    conversationId: record.conversation_id,
    customerId: record.customer_id,
    serviceId: record.service_id,
    calendarId: record.calendar_id,
    customerName: record.customer_name,
    customerPhone: record.customer_phone,
    customerEmail: record.customer_email,
    startAt: record.start_at,
    endAt: record.end_at,
    timezone: record.timezone,
    status: record.status as ReservationStatus,
    sourceChannel: record.source_channel,
    memo: record.memo,
    createdBy: record.created_by,
    confirmedAt: record.confirmed_at,
    cancelledAt: record.cancelled_at,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

function mapServiceRecord(record: ServiceRecord): Service {
  return {
    id: record.id,
    organizationId: record.organization_id,
    name: record.name,
    description: record.description,
    price: record.price,
    currency: record.currency,
    durationMinutes: record.duration_minutes,
    isActive: record.is_active ?? true,
    isReservable: record.is_reservable ?? true,
    approvalStatus: record.approval_status,
    syncStatus: record.sync_status,
    sourceType: record.source_type,
    sourceId: record.source_id,
    confidence: record.confidence,
    rawPayload: record.raw_payload,
    pendingPayload: record.pending_payload,
    lastExtractedAt: record.last_extracted_at,
    approvedAt: record.approved_at,
    approvedBy: record.approved_by,
    rejectedReason: record.rejected_reason,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

function mapServiceItemRecord(record: ServiceItemRecord): ServiceItem {
  return {
    id: record.id,
    organizationId: record.organization_id,
    serviceId: record.service_id,
    name: record.name,
    description: record.description,
    basePrice: record.base_price ?? 0,
    durationMinutes: record.duration_minutes ?? 0,
    isAvailable: record.is_available ?? true,
    rawPayload: record.raw_payload,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

function mapServiceItemOptionRecord(record: ServiceItemOptionRecord): ServiceItemOption {
  return {
    id: record.id,
    organizationId: record.organization_id,
    serviceItemId: record.service_item_id,
    optionGroup: record.option_group ?? "옵션",
    optionValue: record.option_value ?? "옵션",
    description: record.description,
    additionalPrice: record.additional_price ?? 0,
    additionalDuration: record.additional_duration ?? 0,
    isAvailable: record.is_available ?? true,
    rawPayload: record.raw_payload,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

function mapPartialServicePayload(payload?: Record<string, unknown>): Partial<Service> | undefined {
  if (!payload) return undefined;
  return {
    name: typeof payload.name === "string" ? payload.name : undefined,
    description: typeof payload.description === "string" ? payload.description : null,
    price: typeof payload.price === "number" ? payload.price : null,
    currency: typeof payload.currency === "string" ? payload.currency : undefined,
    durationMinutes: typeof payload.duration_minutes === "number" ? payload.duration_minutes : null,
    isActive: typeof payload.is_active === "boolean" ? payload.is_active : undefined,
    isReservable: typeof payload.is_reservable === "boolean" ? payload.is_reservable : undefined,
  };
}

function mapServiceAdminRecord(record: ServiceAdminRecord): ServiceAdminItem {
  return {
    id: record.id,
    organizationId: record.organization_id,
    status: record.status,
    syncStatus: record.sync_status,
    sourceType: record.source_type,
    sourceId: record.source_id,
    name: record.name,
    current: mapPartialServicePayload(record.current),
    suggested: mapPartialServicePayload(record.suggested),
    canApprove: record.can_approve,
    missingFields: record.missing_fields,
    changedFields: record.changed_fields,
    hasChanges: record.has_changes,
    canDeactivate: record.can_deactivate,
    message: record.message,
    ai: record.ai,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    lastExtractedAt: record.last_extracted_at,
  };
}

function toServicePayload(organizationId: string, data: ServiceInput) {
  const payload: Record<string, unknown> = {
    organization_id: organizationId,
    name: data.name.trim(),
    description: data.description?.trim() || null,
    price: data.price ?? null,
    currency: data.currency ?? "KRW",
    duration_minutes: data.durationMinutes,
    is_active: data.isActive ?? true,
    is_reservable: data.isReservable ?? true,
  };
  if (data.durationMinutes === undefined) delete payload.duration_minutes;
  return payload;
}

function mapBookingSettingRecord(record: BookingSettingRecord): BookingSetting {
  return {
    id: record.id,
    organizationId: record.organization_id,
    name: record.name ?? "대표 예약 캘린더",
    timezone: record.timezone ?? "Asia/Seoul",
    slotIntervalMinutes: record.slot_interval_minutes ?? 30,
    minNoticeMinutes: record.min_notice_minutes ?? 60,
    maxDaysAhead: record.max_days_ahead ?? 30,
    requiresApproval: record.requires_approval ?? true,
    allowCustomerCancel: record.allow_customer_cancel ?? true,
    weeklyHours: record.weekly_hours ?? [],
    exceptions: record.exceptions ?? [],
    servicePolicyOverrides: record.service_policy_overrides ?? {},
    legacyCalendarIds: record.legacy_calendar_ids ?? [],
    isActive: record.is_active ?? true,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

function mapAvailableSlotRecord(record: AvailableSlotRecord): AvailableSlot {
  return {
    startAt: record.start_at ?? "",
    endAt: record.end_at ?? "",
    timezone: record.timezone,
    serviceId: record.service_id,
    calendarId: record.calendar_id,
    available: record.available,
  };
}

export async function fetchReservations(organizationId: string, limit = 100) {
  const response = await fetch(
    `${getAgentApiBaseUrl()}/reservations?organization_id=${encodeURIComponent(organizationId)}&limit=${encodeURIComponent(String(limit))}`,
  );

  if (!response.ok) {
    throw new Error(await readAgentApiError(response));
  }

  const payload = (await response.json()) as { items?: ReservationRecord[] };
  return (payload.items ?? []).map(mapReservationRecord);
}

export async function fetchServices(organizationId: string) {
  const response = await fetch(
    `${getAgentApiBaseUrl()}/services?organization_id=${encodeURIComponent(organizationId)}`,
  );

  if (!response.ok) {
    throw new Error(await readAgentApiError(response));
  }

  const payload = (await response.json()) as { items?: ServiceRecord[] };
  return (payload.items ?? []).map(mapServiceRecord);
}

export async function updateServiceActive(
  organizationId: string,
  serviceId: string,
  isActive: boolean,
) {
  return updateService(organizationId, serviceId, {
    isActive,
    isReservable: isActive,
  });
}

async function fetchServiceAdminItems(endpoint: "pending" | "review" | "stale", organizationId: string) {
  const response = await fetch(
    `${getAgentApiBaseUrl()}/services/${endpoint}?organization_id=${encodeURIComponent(organizationId)}`,
  );

  if (!response.ok) {
    throw new Error(await readAgentApiError(response));
  }

  const payload = (await response.json()) as { items?: ServiceAdminRecord[] };
  return (payload.items ?? []).map(mapServiceAdminRecord);
}

export function fetchPendingServices(organizationId: string) {
  return fetchServiceAdminItems("pending", organizationId);
}

export function fetchReviewServices(organizationId: string) {
  return fetchServiceAdminItems("review", organizationId);
}

export function fetchStaleServices(organizationId: string) {
  return fetchServiceAdminItems("stale", organizationId);
}

export async function fetchServiceItems(organizationId: string, serviceId: string) {
  const response = await fetch(
    `${getAgentApiBaseUrl()}/services/${encodeURIComponent(serviceId)}/items?organization_id=${encodeURIComponent(organizationId)}`,
  );

  if (!response.ok) {
    throw new Error(await readAgentApiError(response));
  }

  const payload = (await response.json()) as { items?: ServiceItemRecord[] };
  return (payload.items ?? []).map(mapServiceItemRecord);
}

export async function fetchServiceItemOptions(organizationId: string, serviceItemId: string) {
  const response = await fetch(
    `${getAgentApiBaseUrl()}/services/items/${encodeURIComponent(serviceItemId)}/options?organization_id=${encodeURIComponent(organizationId)}`,
  );

  if (!response.ok) {
    throw new Error(await readAgentApiError(response));
  }

  const payload = (await response.json()) as { items?: ServiceItemOptionRecord[] };
  return (payload.items ?? []).map(mapServiceItemOptionRecord);
}

export async function calculateServicePrice(
  organizationId: string,
  serviceItemId: string,
  optionIds: string[],
) {
  const response = await fetch(`${getAgentApiBaseUrl()}/services/items/calculate-price`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      organization_id: organizationId,
      service_item_id: serviceItemId,
      option_ids: optionIds,
    }),
  });

  if (!response.ok) {
    throw new Error(await readAgentApiError(response));
  }

  const payload = (await response.json()) as {
    organization_id: string;
    service_item_id: string;
    option_ids: string[];
    base_price: number;
    options_price: number;
    total_price: number;
    base_duration_minutes: number;
    options_duration_minutes: number;
    total_duration_minutes: number;
    ordered_summary?: Record<string, unknown>;
  };

  return {
    organizationId: payload.organization_id,
    serviceItemId: payload.service_item_id,
    optionIds: payload.option_ids,
    basePrice: payload.base_price,
    optionsPrice: payload.options_price,
    totalPrice: payload.total_price,
    baseDurationMinutes: payload.base_duration_minutes,
    optionsDurationMinutes: payload.options_duration_minutes,
    totalDurationMinutes: payload.total_duration_minutes,
    orderedSummary: payload.ordered_summary,
  } satisfies ServicePriceCalculation;
}

async function postServiceAction(
  organizationId: string,
  serviceId: string,
  action: "approve" | "reject" | "apply-pending" | "ignore-pending" | "deactivate",
  body: Record<string, unknown> = {},
) {
  const response = await fetch(`${getAgentApiBaseUrl()}/services/${encodeURIComponent(serviceId)}/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ organization_id: organizationId, ...body }),
  });

  if (!response.ok) {
    throw new Error(await readAgentApiError(response));
  }

  const payload = (await response.json()) as { ok?: boolean; service?: ServiceRecord; message?: string };
  return {
    ...payload,
    service: payload.service ? mapServiceRecord(payload.service) : undefined,
  };
}

export async function approveService(organizationId: string, serviceId: string, data: Partial<ServiceInput>) {
  return postServiceAction(organizationId, serviceId, "approve", {
    name: data.name,
    description: data.description,
    price: data.price,
    duration_minutes: data.durationMinutes,
    is_active: data.isActive ?? true,
  });
}

export async function rejectService(organizationId: string, serviceId: string, reason?: string) {
  return postServiceAction(organizationId, serviceId, "reject", { reason: reason || null });
}

export async function applyPendingService(organizationId: string, serviceId: string, data: Partial<ServiceInput>) {
  return postServiceAction(organizationId, serviceId, "apply-pending", {
    name: data.name,
    description: data.description,
    price: data.price,
    duration_minutes: data.durationMinutes,
  });
}

export async function ignorePendingService(organizationId: string, serviceId: string, reason?: string) {
  return postServiceAction(organizationId, serviceId, "ignore-pending", { reason: reason || null });
}

export async function deactivateService(organizationId: string, serviceId: string, reason?: string) {
  return postServiceAction(organizationId, serviceId, "deactivate", { reason: reason || null });
}

export async function createService(organizationId: string, data: ServiceInput) {
  const response = await fetch(`${getAgentApiBaseUrl()}/reservations/services`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toServicePayload(organizationId, data)),
  });

  if (!response.ok) {
    throw new Error(await readAgentApiError(response));
  }

  const payload = (await response.json()) as { service?: ServiceRecord };
  if (!payload.service) throw new Error("서비스 생성 응답이 올바르지 않습니다.");
  return mapServiceRecord(payload.service);
}

export async function updateService(
  organizationId: string,
  serviceId: string,
  data: Partial<ServiceInput>,
) {
  const body: Record<string, unknown> = {};
  if (data.name !== undefined) body.name = data.name.trim();
  if (data.description !== undefined) body.description = data.description?.trim() || null;
  if (data.price !== undefined) body.price = data.price;
  if (data.currency !== undefined) body.currency = data.currency;
  if (data.durationMinutes !== undefined) body.duration_minutes = data.durationMinutes;
  if (data.isActive !== undefined) body.is_active = data.isActive;
  if (data.isReservable !== undefined) body.is_reservable = data.isReservable;

  const response = await fetch(
    `${getAgentApiBaseUrl()}/services/${encodeURIComponent(serviceId)}?organization_id=${encodeURIComponent(organizationId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    throw new Error(await readAgentApiError(response));
  }

  const payload = (await response.json()) as { service?: ServiceRecord };
  if (!payload.service) throw new Error("서비스 수정 응답이 올바르지 않습니다.");
  return mapServiceRecord(payload.service);
}

export async function deleteService(organizationId: string, serviceId: string) {
  const response = await fetch(
    `${getAgentApiBaseUrl()}/services/${encodeURIComponent(serviceId)}?organization_id=${encodeURIComponent(organizationId)}`,
    { method: "DELETE" },
  );

  if (!response.ok) {
    throw new Error(await readAgentApiError(response));
  }

  const payload = (await response.json()) as { service?: ServiceRecord };
  return payload.service ? mapServiceRecord(payload.service) : undefined;
}

function toServiceItemPayload(organizationId: string, data: ServiceItemInput) {
  return {
    organization_id: organizationId,
    name: data.name.trim(),
    description: data.description?.trim() || null,
    base_price: data.basePrice ?? 0,
    duration_minutes: data.durationMinutes ?? 60,
    is_available: data.isAvailable ?? true,
  };
}

function toServiceItemOptionPayload(organizationId: string, data: ServiceItemOptionInput) {
  return {
    organization_id: organizationId,
    option_group: data.optionGroup?.trim() || "옵션",
    option_value: data.optionValue.trim(),
    description: data.description?.trim() || null,
    additional_price: data.additionalPrice ?? 0,
    additional_duration: data.additionalDuration ?? 0,
    is_available: data.isAvailable ?? true,
  };
}

export async function createServiceItem(organizationId: string, serviceId: string, data: ServiceItemInput) {
  const response = await fetch(`${getAgentApiBaseUrl()}/services/${encodeURIComponent(serviceId)}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toServiceItemPayload(organizationId, data)),
  });

  if (!response.ok) throw new Error(await readAgentApiError(response));
  const payload = (await response.json()) as { item?: ServiceItemRecord };
  if (!payload.item) throw new Error("서비스 아이템 생성 응답이 올바르지 않습니다.");
  return mapServiceItemRecord(payload.item);
}

export async function updateServiceItem(organizationId: string, serviceItemId: string, data: ServiceItemInput) {
  const response = await fetch(`${getAgentApiBaseUrl()}/services/items/${encodeURIComponent(serviceItemId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toServiceItemPayload(organizationId, data)),
  });

  if (!response.ok) throw new Error(await readAgentApiError(response));
  const payload = (await response.json()) as { item?: ServiceItemRecord };
  if (!payload.item) throw new Error("서비스 아이템 수정 응답이 올바르지 않습니다.");
  return mapServiceItemRecord(payload.item);
}

export async function deleteServiceItem(organizationId: string, serviceItemId: string) {
  const response = await fetch(
    `${getAgentApiBaseUrl()}/services/items/${encodeURIComponent(serviceItemId)}?organization_id=${encodeURIComponent(organizationId)}`,
    { method: "DELETE" },
  );

  if (!response.ok) throw new Error(await readAgentApiError(response));
}

export async function createServiceItemOption(
  organizationId: string,
  serviceItemId: string,
  data: ServiceItemOptionInput,
) {
  const response = await fetch(`${getAgentApiBaseUrl()}/services/items/${encodeURIComponent(serviceItemId)}/options`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toServiceItemOptionPayload(organizationId, data)),
  });

  if (!response.ok) throw new Error(await readAgentApiError(response));
  const payload = (await response.json()) as { option?: ServiceItemOptionRecord };
  if (!payload.option) throw new Error("서비스 옵션 생성 응답이 올바르지 않습니다.");
  return mapServiceItemOptionRecord(payload.option);
}

export async function updateServiceItemOption(
  organizationId: string,
  optionId: string,
  data: ServiceItemOptionInput,
) {
  const response = await fetch(`${getAgentApiBaseUrl()}/services/options/${encodeURIComponent(optionId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toServiceItemOptionPayload(organizationId, data)),
  });

  if (!response.ok) throw new Error(await readAgentApiError(response));
  const payload = (await response.json()) as { option?: ServiceItemOptionRecord };
  if (!payload.option) throw new Error("서비스 옵션 수정 응답이 올바르지 않습니다.");
  return mapServiceItemOptionRecord(payload.option);
}

export async function deleteServiceItemOption(organizationId: string, optionId: string) {
  const response = await fetch(
    `${getAgentApiBaseUrl()}/services/options/${encodeURIComponent(optionId)}?organization_id=${encodeURIComponent(organizationId)}`,
    { method: "DELETE" },
  );

  if (!response.ok) throw new Error(await readAgentApiError(response));
}

export async function fetchBookingSetting(organizationId: string) {
  const response = await fetch(
    `${getAgentApiBaseUrl()}/booking-settings/${encodeURIComponent(organizationId)}`,
  );

  if (!response.ok) {
    throw new Error(await readAgentApiError(response));
  }

  return mapBookingSettingRecord((await response.json()) as BookingSettingRecord);
}

export async function fetchAvailableSlots(organizationId: string, serviceId: string, date: string) {
  const response = await fetch(
    `${getAgentApiBaseUrl()}/booking/available-slots?organization_id=${encodeURIComponent(organizationId)}&service_id=${encodeURIComponent(serviceId)}&date=${encodeURIComponent(date)}`,
  );

  if (!response.ok) {
    throw new Error(await readAgentApiError(response));
  }

  const payload = (await response.json()) as { slots?: AvailableSlotRecord[] };
  return (payload.slots ?? []).map(mapAvailableSlotRecord);
}

export async function confirmReservation(organizationId: string, reservationId: string) {
  const response = await fetch(
    `${getAgentApiBaseUrl()}/reservations/${encodeURIComponent(reservationId)}/confirm?organization_id=${encodeURIComponent(organizationId)}`,
    { method: "PATCH" },
  );

  if (!response.ok) {
    throw new Error(await readAgentApiError(response));
  }

  return response.json();
}

export async function rejectReservation(organizationId: string, reservationId: string) {
  const response = await fetch(
    `${getAgentApiBaseUrl()}/reservations/${encodeURIComponent(reservationId)}/reject?organization_id=${encodeURIComponent(organizationId)}`,
    { method: "PATCH" },
  );

  if (!response.ok) {
    throw new Error(await readAgentApiError(response));
  }

  return response.json();
}

export async function cancelReservation(organizationId: string, reservationId: string) {
  const response = await fetch(
    `${getAgentApiBaseUrl()}/reservations/${encodeURIComponent(reservationId)}/cancel?organization_id=${encodeURIComponent(organizationId)}`,
    { method: "PATCH" },
  );

  if (!response.ok) {
    throw new Error(await readAgentApiError(response));
  }

  return response.json();
}
