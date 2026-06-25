const quickMenus = ["예약하기", "예약 변경", "운영시간", "오시는 길"];

export function HomeTab() {
  return (
    <div className="space-y-3">
      <div className="rounded-[18px] bg-blue-50 p-4">
        <div className="text-[13px] font-bold text-blue-500">AI 상담원</div>
        <div className="mt-1 text-[22px] font-extrabold leading-tight text-gray-900">무엇을 도와드릴까요?</div>
        <div className="mt-2 text-[12px] font-bold leading-relaxed text-gray-500">
          예약, 변경, 위치 안내를 바로 도와드릴게요.
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {quickMenus.map((label) => (
          <button key={label} className="rounded-[16px] bg-gray-50 p-3 text-left">
            <div className="text-[13px] font-extrabold text-gray-800">{label}</div>
            <div className="mt-1 text-[11px] font-bold text-gray-400">바로 문의</div>
          </button>
        ))}
      </div>
      <div className="rounded-[18px] border border-gray-100 bg-white p-4 shadow-sm">
        <div className="text-[12px] font-bold text-gray-400">최근 안내</div>
        <div className="mt-1 text-[14px] font-extrabold text-gray-900">예약 확인 문자를 받을 수 있어요.</div>
        <div className="mt-1 text-[12px] font-bold text-gray-500">상담 중 문자 발송 여부를 먼저 확인합니다.</div>
      </div>
    </div>
  );
}
