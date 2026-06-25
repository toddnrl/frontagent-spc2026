import { useState } from "react";

const initialSettings = [
  { id: "reservation", label: "예약 알림 받기", enabled: true },
  { id: "history", label: "상담 내역 저장", enabled: true },
  { id: "event", label: "이벤트 정보 수신", enabled: false },
];

export function SettingsTab() {
  const [settings, setSettings] = useState(initialSettings);

  const toggleSetting = (settingId: string) => {
    setSettings((items) => items.map((item) => (item.id === settingId ? { ...item, enabled: !item.enabled } : item)));
  };

  return (
    <div className="space-y-2">
      {settings.map(({ id, label, enabled }) => (
        <div key={id} className="flex items-center justify-between rounded-[16px] bg-gray-50 p-3">
          <span className="text-[13px] font-bold text-gray-700">{label}</span>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => toggleSetting(id)}
            className={`flex h-7 w-12 items-center rounded-full p-0.5 transition-colors ${enabled ? "bg-blue-500" : "bg-gray-200"}`}
          >
            <span
              className={`h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
                enabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      ))}
      <button className="w-full rounded-[16px] bg-white p-3 text-left text-[13px] font-bold text-gray-700 shadow-sm">
        개인정보 처리방침 보기
      </button>
    </div>
  );
}
