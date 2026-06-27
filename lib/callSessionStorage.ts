export type StoredCallSession = {
  sessionId: string;
  conversationId: string | null;
  organizationId: string;
  userId: string | null;
  savedAt: number;
  preview?: string;
};

const SESSIONS_KEY_PREFIX = "alf_call_sessions";
const ACTIVE_KEY_PREFIX = "alf_call_active_session";
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

function scopeKey(organizationId: string, userId: string | null) {
  return userId ? `${organizationId}:${userId}` : `${organizationId}:anonymous`;
}

function sessionsStorageKey(organizationId: string, userId: string | null) {
  return `${SESSIONS_KEY_PREFIX}:${scopeKey(organizationId, userId)}`;
}

function activeStorageKey(organizationId: string, userId: string | null) {
  return `${ACTIVE_KEY_PREFIX}:${scopeKey(organizationId, userId)}`;
}

function readSessions(organizationId: string, userId: string | null): StoredCallSession[] {
  try {
    const raw = window.localStorage.getItem(sessionsStorageKey(organizationId, userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredCallSession[];
    const fresh = parsed.filter((session) => Date.now() - session.savedAt <= SESSION_TTL_MS);
    if (fresh.length !== parsed.length) {
      window.localStorage.setItem(sessionsStorageKey(organizationId, userId), JSON.stringify(fresh));
    }
    return fresh;
  } catch {
    return [];
  }
}

export function loadActiveCallSession(
  organizationId: string,
  userId: string | null,
): StoredCallSession | null {
  const activeSessionId = window.localStorage.getItem(activeStorageKey(organizationId, userId));
  if (!activeSessionId) return null;
  return readSessions(organizationId, userId).find((session) => session.sessionId === activeSessionId) ?? null;
}

export function loadCallSessions(organizationId: string, userId: string | null) {
  return readSessions(organizationId, userId);
}

export function saveCallSession(session: StoredCallSession) {
  const sessions = readSessions(session.organizationId, session.userId).filter(
    (item) => item.sessionId !== session.sessionId,
  );
  sessions.unshift(session);
  window.localStorage.setItem(
    sessionsStorageKey(session.organizationId, session.userId),
    JSON.stringify(sessions),
  );
  window.localStorage.setItem(activeStorageKey(session.organizationId, session.userId), session.sessionId);
}

export function clearActiveCallSession(organizationId: string, userId: string | null) {
  window.localStorage.removeItem(activeStorageKey(organizationId, userId));
}
