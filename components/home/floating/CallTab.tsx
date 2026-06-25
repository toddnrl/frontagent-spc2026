import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { PhoneIcon, UserCircleIcon } from "@heroicons/react/24/solid";

const formatCallDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
};

export function CallTab() {
  const [callStatus, setCallStatus] = useState<"idle" | "connecting" | "active" | "ended">("idle");
  const [callSeconds, setCallSeconds] = useState(0);
  const connectionTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (callStatus !== "active") return;

    const interval = window.setInterval(() => {
      setCallSeconds((seconds) => Math.min(seconds + 1, 59 * 60 + 59));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [callStatus]);

  useEffect(() => {
    return () => {
      if (connectionTimeoutRef.current) window.clearTimeout(connectionTimeoutRef.current);
    };
  }, []);

  const startCall = () => {
    if (connectionTimeoutRef.current) window.clearTimeout(connectionTimeoutRef.current);

    setCallStatus("connecting");
    setCallSeconds(0);

    connectionTimeoutRef.current = window.setTimeout(() => {
      setCallStatus("active");
      connectionTimeoutRef.current = null;
    }, 900);
  };

  const endCall = () => {
    if (connectionTimeoutRef.current) {
      window.clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }

    setCallStatus("ended");
  };

  const isCallRunning = callStatus === "connecting" || callStatus === "active";

  return (
    <div className="relative flex h-full flex-col pb-24">
      <div className="rounded-[16px] bg-gray-50 p-3 text-center">
        <div className="text-[12px] font-bold text-gray-400">전화 내역이 없어요</div>
      </div>
      <div className="flex flex-1 items-center justify-center">
        {isCallRunning ? (
          <div className="flex flex-col items-center text-center">
            <div className="relative flex h-18 w-18 items-center justify-center rounded-full bg-blue-50 text-blue-500">
              {callStatus === "connecting" && <span className="absolute h-full w-full rounded-full bg-blue-200 opacity-40 animate-ping" />}
              <UserCircleIcon className="relative h-11 w-11" />
            </div>
            <div className="mt-5 text-[20px] font-extrabold text-gray-900">AI 상담원</div>
            <div className="mt-1 text-[13px] font-bold text-gray-500">
              {callStatus === "connecting" ? "연결 중..." : "통화 중"}
            </div>
            <div className="mt-3 font-mono text-[28px] font-extrabold text-gray-900">{formatCallDuration(callSeconds)}</div>
            <div className="mt-5 flex h-7 items-center gap-1">
              {[14, 22, 12, 26, 18, 30, 16, 24, 13].map((height, index) => (
                <motion.span
                  key={index}
                  animate={callStatus === "active" ? { height: [height * 0.45, height, height * 0.65] } : { height: 8 }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: index * 0.07 }}
                  className="w-1 rounded-full bg-blue-400"
                />
              ))}
            </div>
            <div className="mt-4 text-[12px] font-bold leading-relaxed text-gray-400">
              {callStatus === "connecting" ? "AI 상담원을 연결하고 있어요." : "말씀하시면 AI가 내용을 듣고 답변합니다."}
            </div>
          </div>
        ) : (
          <div className="w-full space-y-3">
            <div className="rounded-[18px] bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-500 text-white">
                  <PhoneIcon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[14px] font-extrabold text-gray-900">전화 상담 연결</div>
                  <div className="text-[12px] font-bold text-gray-500">AI 상담원이 먼저 도와드려요</div>
                </div>
              </div>
            </div>
            {callStatus === "ended" && (
              <div className="rounded-[18px] bg-gray-50 p-4 text-center">
                <div className="text-[14px] font-extrabold text-gray-900">통화가 종료되었습니다</div>
                <div className="mt-1 text-[12px] font-bold text-gray-500">필요하면 다시 전화할 수 있어요.</div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-1">
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={isCallRunning ? endCall : startCall}
            className={`flex h-16 w-16 items-center justify-center rounded-full text-white ${
              isCallRunning ? "bg-red-500" : "bg-green-500"
            }`}
          >
            <PhoneIcon className={`h-7 w-7 ${isCallRunning ? "rotate-[135deg]" : ""}`} />
          </button>
          <div className="text-[12px] font-extrabold text-gray-500">{isCallRunning ? "전화 끊기" : "전화 걸기"}</div>
        </div>
      </div>
    </div>
  );
}
