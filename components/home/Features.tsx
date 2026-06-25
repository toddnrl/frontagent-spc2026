import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  PhoneCall,
  MessageCircle,
  Database,
  Headphones,
  Zap,
  ShieldCheck,
  ArrowRight,
  Lock,
} from "lucide-react";
import { SectionCard } from "./SectionCard";

const callScenarios = [
  {
    customerName: "김민지 고객",
    topic: "예약 변경",
    messages: [
      {
        speaker: "ai",
        label: "AI",
        text: "안녕하세요, 프론트 치과입니다. 무엇을 도와드릴까요?",
        delayBeforeMs: 0,
      },
      {
        speaker: "customer",
        label: "고객",
        text: "예약을 변경하고 싶은데요.",
        delayBeforeMs: 1800,
      },
      {
        speaker: "ai",
        label: "AI",
        text: "네, 기존 예약 확인 후 변경 가능한 시간을 안내드리겠습니다.",
        delayBeforeMs: 1300,
      },
      {
        speaker: "customer",
        label: "고객",
        text: "내일 오후에 원장님 진료 가능한 시간이 있을까요?",
        delayBeforeMs: 2600,
      },
      {
        speaker: "ai",
        label: "AI",
        text: "내일 원장님 진료는 오후 3시와 4시 30분이 가능합니다. 어느 시간으로 변경해드릴까요?",
        delayBeforeMs: 1700,
      },
      {
        speaker: "customer",
        label: "고객",
        text: "오후 3시로 부탁드릴게요.",
        delayBeforeMs: 3000,
      },
      {
        speaker: "ai",
        label: "AI",
        text: "내일 오후 3시 원장님 진료로 변경 진행해도 괜찮으실까요?",
        delayBeforeMs: 1500,
      },
      {
        speaker: "customer",
        label: "고객",
        text: "네, 그렇게 변경해주세요.",
        delayBeforeMs: 2200,
      },
      {
        speaker: "ai",
        label: "AI",
        text: "변경 완료했습니다. 변경 내용을 문자로 보내드릴까요?",
        delayBeforeMs: 1500,
      },
      {
        speaker: "customer",
        label: "고객",
        text: "네, 문자로도 보내주세요.",
        delayBeforeMs: 2200,
      },
      {
        speaker: "ai",
        label: "AI",
        text: "확인했습니다. 예약 변경 안내 문자를 발송했습니다. 좋은 하루 보내세요.",
        delayBeforeMs: 1600,
      },
      {
        speaker: "system",
        label: "시스템",
        text: "통화 종료",
        delayBeforeMs: 1800,
      },
    ],
  },
  {
    customerName: "박준호 고객",
    topic: "영업시간 문의",
    messages: [
      {
        speaker: "ai",
        label: "AI",
        text: "안녕하세요, 프론트 치과입니다. 무엇을 도와드릴까요?",
        delayBeforeMs: 0,
      },
      {
        speaker: "customer",
        label: "고객",
        text: "오늘 야간 진료도 하나요?",
        delayBeforeMs: 1700,
      },
      {
        speaker: "ai",
        label: "AI",
        text: "네, 오늘은 오후 8시까지 야간 진료가 있습니다.",
        delayBeforeMs: 1200,
      },
      {
        speaker: "customer",
        label: "고객",
        text: "그럼 7시쯤 방문해도 접수 가능할까요?",
        delayBeforeMs: 2400,
      },
      {
        speaker: "ai",
        label: "AI",
        text: "오후 7시 접수 가능합니다. 다만 대기 시간이 있을 수 있는데 괜찮으실까요?",
        delayBeforeMs: 1500,
      },
      {
        speaker: "customer",
        label: "고객",
        text: "네, 괜찮습니다. 문자로 위치도 받을 수 있나요?",
        delayBeforeMs: 2600,
      },
      {
        speaker: "ai",
        label: "AI",
        text: "네, 병원 위치와 야간 진료 시간을 문자로 보내드릴까요?",
        delayBeforeMs: 1400,
      },
      {
        speaker: "customer",
        label: "고객",
        text: "네, 보내주세요.",
        delayBeforeMs: 1800,
      },
      {
        speaker: "ai",
        label: "AI",
        text: "확인했습니다. 위치 안내 문자를 발송했습니다. 방문 시 접수 데스크로 말씀해주세요.",
        delayBeforeMs: 1500,
      },
      {
        speaker: "system",
        label: "시스템",
        text: "통화 종료",
        delayBeforeMs: 1800,
      },
    ],
  },
  {
    customerName: "이서연 고객",
    topic: "예약 취소",
    messages: [
      {
        speaker: "ai",
        label: "AI",
        text: "안녕하세요, 프론트 치과입니다. 무엇을 도와드릴까요?",
        delayBeforeMs: 0,
      },
      {
        speaker: "customer",
        label: "고객",
        text: "오늘 예약을 취소해야 할 것 같아요.",
        delayBeforeMs: 1800,
      },
      {
        speaker: "ai",
        label: "AI",
        text: "네, 예약 정보를 확인하겠습니다. 성함이 이서연 고객님 맞으실까요?",
        delayBeforeMs: 1300,
      },
      {
        speaker: "customer",
        label: "고객",
        text: "네, 맞아요.",
        delayBeforeMs: 1800,
      },
      {
        speaker: "ai",
        label: "AI",
        text: "오늘 오후 5시 스케일링 예약이 확인됩니다. 취소 진행해도 괜찮으실까요?",
        delayBeforeMs: 1500,
      },
      {
        speaker: "customer",
        label: "고객",
        text: "네, 취소해주세요.",
        delayBeforeMs: 2200,
      },
      {
        speaker: "ai",
        label: "AI",
        text: "취소 완료했습니다. 다음 예약 가능한 날짜 안내를 문자로 받아보시겠어요?",
        delayBeforeMs: 1500,
      },
      {
        speaker: "customer",
        label: "고객",
        text: "아니요, 괜찮습니다.",
        delayBeforeMs: 2000,
      },
      {
        speaker: "ai",
        label: "AI",
        text: "알겠습니다. 예약 취소만 완료했습니다. 필요하실 때 다시 연락 주세요.",
        delayBeforeMs: 1400,
      },
      {
        speaker: "system",
        label: "시스템",
        text: "통화 종료",
        delayBeforeMs: 1800,
      },
    ],
  },
];
const voiceWaveBars = [
  18, 34, 58, 82, 64, 42, 76, 92, 54, 30, 46, 72, 88, 68, 40, 24, 52, 80, 62,
  36,
];
const MAX_CALL_SECONDS = 59 * 60 + 59;
const CALL_RESTART_DELAY_MS = 6_000;
const CONVERSATION_SPEED_RATIO = 1.8;
const scenarioTimelines = callScenarios.map((scenario, scenarioIndex) => {
  const messages = scenario.messages.reduce<
    Array<(typeof scenario.messages)[number] & { atMs: number; id: string }>
  >((timeline, message, index) => {
    const previousAtMs = timeline[index - 1]?.atMs ?? 0;
    const atMs =
      index === 0
        ? 0
        : previousAtMs +
          Math.round(message.delayBeforeMs * CONVERSATION_SPEED_RATIO);

    return [...timeline, { ...message, atMs, id: `${scenarioIndex}-${index}` }];
  }, []);

  return {
    ...scenario,
    durationMs: messages[messages.length - 1].atMs + CALL_RESTART_DELAY_MS,
    messages,
  };
});
const CALL_LOOP_DURATION_MS = scenarioTimelines.reduce(
  (duration, scenario) => duration + scenario.durationMs,
  0,
);
const scenarioPlaybackRanges = scenarioTimelines.reduce<
  Array<{
    scenario: (typeof scenarioTimelines)[number];
    startMs: number;
    endMs: number;
  }>
>((ranges, scenario) => {
  const startMs = ranges.at(-1)?.endMs ?? 0;

  return [
    ...ranges,
    {
      scenario,
      startMs,
      endMs: startMs + scenario.durationMs,
    },
  ];
}, []);
const omniChannelConversation = [
  {
    speaker: "customer",
    text: "내일 피부관리 예약 가능한 시간 있을까요?",
    delayBeforeMs: 0,
  },
  {
    speaker: "ai",
    text: "확인해보겠습니다. 원하시는 시간대가 있으실까요?",
    delayBeforeMs: 2_600,
  },
  { speaker: "customer", text: "오후면 괜찮아요.", delayBeforeMs: 3_600 },
  {
    speaker: "ai",
    text: "내일 오후 2시와 5시 예약 가능합니다.",
    delayBeforeMs: 2_200,
  },
  {
    speaker: "customer",
    text: "그럼 5시로 예약해주세요.",
    delayBeforeMs: 3_800,
  },
  {
    speaker: "ai",
    text: "오후 5시 예약 진행해도 괜찮으실까요?",
    delayBeforeMs: 2_400,
  },
  { speaker: "customer", text: "네, 맞아요.", delayBeforeMs: 2_800 },
  {
    speaker: "ai",
    text: "예약 완료했습니다. 알림톡으로 안내드릴게요.",
    delayBeforeMs: 2_200,
  },
];
const omniChannelTimeline = omniChannelConversation.reduce<
  Array<(typeof omniChannelConversation)[number] & { atMs: number; id: number }>
>((timeline, message, index) => {
  const previousAtMs = timeline[index - 1]?.atMs ?? 0;
  const atMs = index === 0 ? 0 : previousAtMs + message.delayBeforeMs;

  return [...timeline, { ...message, atMs, id: index }];
}, []);
const OMNI_LOOP_DURATION_MS =
  omniChannelTimeline[omniChannelTimeline.length - 1].atMs + 5_000;

function formatCallTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getVoiceWaveHeight(
  baseHeight: number,
  index: number,
  elapsedMs: number,
) {
  const time = elapsedMs / 1000;
  const speechEnvelope =
    0.55 +
    Math.abs(Math.sin(time * 1.7)) * 0.28 +
    Math.abs(Math.sin(time * 0.73 + 1.4)) * 0.17;
  const rapidMovement =
    Math.sin(time * (5.2 + index * 0.11) + index * 1.9) * 18 +
    Math.sin(time * (8.4 + index * 0.07) + index * 0.6) * 11;
  const breathNoise = Math.sin(time * 2.1 + index * 3.7) * 7;
  const nextHeight = baseHeight * speechEnvelope + rapidMovement + breathNoise;

  return Math.max(12, Math.min(Math.round(nextHeight), 96));
}

export function Features() {
  const [callElapsedMs, setCallElapsedMs] = useState(0);
  const activeScenarioRange =
    scenarioPlaybackRanges.find((range) => callElapsedMs < range.endMs) ??
    scenarioPlaybackRanges[0];
  const activeScenario = activeScenarioRange.scenario;
  const scenarioElapsedMs = callElapsedMs - activeScenarioRange.startMs;
  const transcriptMessages = activeScenario.messages
    .filter((message) => message.atMs <= scenarioElapsedMs)
    .slice(-4);
  const lastScenarioMessage =
    activeScenario.messages[activeScenario.messages.length - 1];
  const isCallEnded = scenarioElapsedMs >= lastScenarioMessage.atMs;
  const callSeconds = Math.min(
    Math.floor(Math.min(scenarioElapsedMs, lastScenarioMessage.atMs) / 1000),
    MAX_CALL_SECONDS,
  );
  const formattedCallTime = formatCallTime(callSeconds);
  const liveVoiceWaveBars = voiceWaveBars.map((height, index) =>
    isCallEnded ? height : getVoiceWaveHeight(height, index, scenarioElapsedMs),
  );
  const omniElapsedMs = callElapsedMs % OMNI_LOOP_DURATION_MS;
  const omniMessages = omniChannelTimeline
    .filter((message) => message.atMs <= omniElapsedMs)
    .slice(-5);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCallElapsedMs(
        (currentElapsedMs) => (currentElapsedMs + 250) % CALL_LOOP_DURATION_MS,
      );
    }, 250);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section id="features" className="scroll-mt-20 py-16 sm:py-32 bg-[#f9fafb]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-20">
          <h2 className="text-[28px] sm:text-[40px] font-bold text-gray-900 mb-4 sm:mb-5 tracking-tight">
            필요한 모든 기능을 다 담았습니다
          </h2>
          <p className="text-[15px] sm:text-[17px] text-gray-500 leading-relaxed font-medium">
            단순한 챗봇을 넘어, 실제 비즈니스 환경에서 필요한 기능들을 섬세하게
            설계했습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Card 1: AI 콜센터 (Large) */}
          <SectionCard
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-2 flex flex-col gap-5 sm:gap-6 overflow-hidden relative group"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[16px] bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                  <PhoneCall className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-[20px] sm:text-[24px] font-bold text-gray-900 leading-tight">
                  사람처럼 자연스러운 AI 콜센터 에이전트
                </h3>
              </div>
              <p className="text-[14px] sm:text-[16px] text-gray-500 leading-[1.6]">
                고도화된 음성 인식 기술로 24시간 걸려오는 전화를 응대하고 고객의
                요청사항을 시스템에 실시간으로 기록합니다.
              </p>
            </div>

            {/* UI Mockup for Card 1 */}
            <div className="w-full">
              <div className="pb-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="shrink-0">
                    <div className="text-[13px] font-bold text-gray-400">
                      INCOMING CALL - {activeScenario.topic}
                    </div>
                    <div className="mt-1 text-[16px] font-extrabold text-gray-900">
                      {activeScenario.customerName}
                    </div>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-2 rounded-[18px] bg-gray-50 px-3 py-2 sm:flex-row sm:items-center sm:gap-3">
                    <div className="flex shrink-0 items-center gap-3">
                      <div
                        className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border shadow-sm ${
                          isCallEnded
                            ? "border-gray-200 bg-gray-100"
                            : "border-red-100 bg-red-50"
                        }`}
                      >
                        {!isCallEnded && (
                          <span className="absolute inline-flex h-5 w-5 rounded-full bg-red-400 opacity-30 animate-ping"></span>
                        )}
                        <span
                          className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                            isCallEnded
                              ? "bg-gray-400"
                              : "bg-red-500 shadow-[0_0_0_4px_rgb(239,68,68,0.12)]"
                          }`}
                        ></span>
                      </div>
                      <div>
                        <div className="text-[12px] font-bold text-gray-900">
                          {isCallEnded ? "통화 종료" : "통화 응대 중..."}
                        </div>
                        <div
                          className={`mt-0.5 text-[12px] font-bold tabular-nums ${
                            isCallEnded ? "text-gray-500" : "text-red-500"
                          }`}
                        >
                          {formattedCallTime}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`voice-wave-track relative flex h-9 sm:h-10 min-w-0 w-full flex-1 items-center gap-1.5 overflow-hidden rounded-[14px] bg-blue-50/70 px-3 ${
                        isCallEnded ? "opacity-40" : ""
                      }`}
                    >
                      {liveVoiceWaveBars.map((height, index) => (
                        <div
                          key={index}
                          className={`${isCallEnded ? "bg-gray-400" : "bg-blue-500"} w-1 rounded-full`}
                          style={{
                            height: `${height}%`,
                            opacity: 0.65 + (height / 100) * 0.35,
                            transition: isCallEnded
                              ? "none"
                              : "height 180ms ease-out, opacity 180ms ease-out",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[16px] bg-white p-6 sm:px-4 sm:py-3 ring-1 ring-gray-100">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-[12px] font-bold text-blue-500">
                    실시간 대화 내용
                  </div>
                  <div className="text-[11px] font-bold text-gray-400">
                    LIVE TRANSCRIPT
                  </div>
                </div>
                <div className="h-[210px] sm:h-[184px] overflow-hidden">
                  <div className="flex h-full flex-col justify-end gap-2">
                    {transcriptMessages.map((message, index) => {
                      const isLatestMessage =
                        index === transcriptMessages.length - 1;
                      const isAiMessage = message.speaker === "ai";
                      const isSystemMessage = message.speaker === "system";

                      return (
                        <motion.div
                          key={message.id}
                          layout
                          initial={{ opacity: 0, y: 14, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.28, ease: "easeOut" }}
                          className={`${
                            isSystemMessage
                              ? "flex items-center justify-center"
                              : "grid grid-cols-[34px_1fr] sm:grid-cols-[40px_1fr] gap-2 rounded-[14px] px-2 py-2"
                          } ${
                            isLatestMessage && !isSystemMessage
                              ? "bg-blue-50/70 opacity-100"
                              : "opacity-70"
                          }`}
                        >
                          {isSystemMessage ? (
                            <div className="rounded-full bg-gray-100 px-3 py-1.5 text-[11px] font-extrabold text-gray-500">
                              {formatCallTime(Math.floor(message.atMs / 1000))}{" "}
                              · {message.text}
                            </div>
                          ) : (
                            <>
                              <div className="pt-1 text-[11px] font-bold tabular-nums text-gray-400">
                                {formatCallTime(
                                  Math.floor(message.atMs / 1000),
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="mb-1 flex items-center gap-1.5">
                                  <span
                                    className={`h-5 rounded-full px-2 text-[10px] font-extrabold leading-5 ${
                                      isAiMessage
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-100 text-gray-500"
                                    }`}
                                  >
                                    {isAiMessage ? "AI 상담원" : "고객"}
                                  </span>
                                  {isLatestMessage && !isCallEnded && (
                                    <span className="text-[10px] font-bold text-blue-500">
                                      기록 중
                                    </span>
                                  )}
                                </div>
                                <div
                                  className={`break-keep text-[13px] font-bold leading-snug ${
                                    isAiMessage
                                      ? "text-blue-700"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {message.text}
                                </div>
                              </div>
                            </>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-[12px] bg-gray-50 px-3 py-2">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${isCallEnded ? "bg-gray-400" : "bg-blue-500 animate-pulse"}`}
                  ></span>
                  <span className="text-[12px] font-bold text-gray-400">
                    {isCallEnded
                      ? "통화 내용 저장이 완료되었습니다"
                      : "AI가 응답을 생성하고 있습니다"}
                  </span>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Card 2: 옴니채널 연동 (Compact) */}
          <SectionCard
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="md:col-span-1 h-full min-h-0 flex flex-col relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-12 h-12 rounded-[14px] bg-yellow-50 flex items-center justify-center text-yellow-600 shrink-0">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h3 className="text-[20px] font-bold text-gray-900">
                  옴니채널 통합
                </h3>
              </div>
              <p className="text-[15px] text-gray-500 leading-[1.6]">
                카카오톡, 네이버톡톡, 웹챗 등 모든 채널을 하나로 연결합니다.
              </p>
            </div>

            <div className="mt-6 sm:mt-8 flex flex-col">
              <div className="flex flex-col space-y-3">
                <div className="flex flex-col rounded-[16px] bg-white p-6 sm:p-3 ring-1 ring-gray-100">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FAE100] text-[12px] font-extrabold text-[#371D1E]">
                        톡
                      </div>
                      <div>
                        <div className="text-[13px] font-extrabold text-gray-900">
                          최수빈 고객
                        </div>
                        <div className="text-[11px] font-bold text-gray-400">
                          실시간 · 카카오톡
                        </div>
                      </div>
                    </div>
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  </div>

                  <div className="h-[150px] sm:h-[130px] shrink-0 overflow-hidden px-0 py-3 sm:px-3">
                    <div className="flex h-full flex-col justify-end gap-2">
                      {omniMessages.map((message) => {
                        const isAiMessage = message.speaker === "ai";

                        return (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 12, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className={`flex ${isAiMessage ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[88%] rounded-[14px] px-3 py-2 text-[12px] font-bold leading-snug ${
                                isAiMessage
                                  ? "rounded-br-[4px] bg-blue-500 text-white"
                                  : "rounded-bl-[4px] bg-gray-50 text-gray-800 ring-1 ring-gray-100"
                              }`}
                            >
                              {message.text}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 rounded-[12px] bg-blue-50 px-3 py-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                    <span className="text-[12px] font-bold text-blue-500">
                      카카오톡 자동 답변 생성 중
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-[14px] bg-white p-6 sm:p-3 ring-1 ring-gray-100">
                    <div className="mb-1 text-[11px] font-extrabold text-green-500">
                      네이버톡톡
                    </div>
                    <div className="text-[13px] font-extrabold text-gray-900">
                      2건 대기
                    </div>
                  </div>
                  <div className="rounded-[14px] bg-white p-6 sm:p-3 ring-1 ring-gray-100">
                    <div className="mb-1 text-[11px] font-extrabold text-gray-500">
                      웹챗
                    </div>
                    <div className="text-[13px] font-extrabold text-gray-900">
                      1건 처리중
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Card 3: 실시간 처리 (Compact) */}
          <SectionCard
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="md:col-span-1 flex flex-col justify-between"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-12 h-12 rounded-[14px] bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-[20px] font-bold text-gray-900">
                  초저지연 실시간 대화
                </h3>
              </div>
              <p className="text-[15px] text-gray-500 leading-[1.6]">
                최신 LLM 추론 엔진으로 마치 사람과 대화하듯 지연 없는 피드백을
                제공합니다.
              </p>
            </div>
            <div className="mt-6 sm:mt-10 bg-[#f9fafb] p-6 rounded-[20px] border border-gray-100">
              <div className="flex justify-between items-end mb-3">
                <span className="text-[13px] font-bold text-gray-500">
                  엔드 투 엔드 응답시간
                </span>
                <span className="text-[22px] font-extrabold text-red-500">
                  {"< 150ms"}
                </span>
              </div>
              <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-red-400 w-[15%] rounded-full"></div>
              </div>
            </div>
          </SectionCard>

          {/* Card 4: 데이터 자동화 (Large) */}
          <SectionCard
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="md:col-span-2 flex flex-col justify-between overflow-hidden relative"
          >
            <div className="relative z-10 flex flex-col md:flex-row gap-8 justify-between h-full">
              <div className="w-full md:w-1/2">
                <div className="flex items-start sm:items-center gap-4 mb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[16px] bg-green-50 flex items-center justify-center text-green-500 shrink-0">
                    <Database className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <h3 className="text-[20px] sm:text-[24px] font-bold text-gray-900 leading-tight">
                    모든 상담 내용의
                    <br className="hidden sm:block" />
                    자동화된 요약 리포트
                  </h3>
                </div>
                <p className="text-[14px] sm:text-[16px] text-gray-500 leading-[1.6]">
                  음성, 채팅 등 모든 상담 내역은 텍스트로 변환되어 요약되고,
                  핵심 정보 키워드가 추출되어 사내 CRM에 즉시 반영됩니다.
                </p>
              </div>

              {/* UI Mockup for Card 4 */}
              <div className="w-full md:w-1/2 mt-4 md:mt-0">
                <div className="bg-[#f9fafb] rounded-[20px] sm:rounded-[24px] p-6 border border-gray-100 h-full flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                    <span className="text-[14px] font-bold text-gray-700">
                      핵심 요약 리포트
                    </span>
                  </div>
                  <div className="bg-white rounded-[16px] p-6 sm:p-5 shadow-[0_2px_12px_rgb(0,0,0,0.03)] border border-gray-100 mb-4">
                    <span className="text-[12px] text-gray-400 font-bold block mb-1.5 uppercase tracking-wider">
                      주요 고객 의도
                    </span>
                    <span className="text-[15px] text-gray-900 font-bold leading-tight">
                      기존 정기 점검 1주일 연기 요청
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="bg-blue-50 text-blue-600 border border-blue-100/50 text-[13px] px-3 py-1.5 font-bold rounded-full">
                      #예약변경
                    </span>
                    <span className="bg-purple-50 text-purple-600 border border-purple-100/50 text-[13px] px-3 py-1.5 font-bold rounded-full">
                      #프리미엄회원
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Card 5: 스마트 라우팅 */}
          <SectionCard
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="md:col-span-2 flex flex-col justify-between"
          >
            <div className="relative z-10 flex flex-col md:flex-row gap-8 justify-between h-full">
              {/* UI Mockup for Card 5 */}
              <div className="w-full md:w-[45%] h-full flex flex-col justify-center order-2 md:order-1 relative">
                <div className="absolute left-[35px] top-6 bottom-6 w-0.5 bg-gray-100 -z-10"></div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 sm:gap-4 bg-white p-6 sm:p-4 rounded-[18px] sm:rounded-[20px] shadow-[0_4px_16px_rgb(0,0,0,0.04)] border border-gray-100">
                    <div className="w-12 h-12 bg-gray-50 rounded-[14px] flex items-center justify-center shrink-0">
                      <Headphones className="w-6 h-6 text-gray-500" />
                    </div>
                    <div>
                      <div className="text-[15px] font-bold text-gray-900">
                        클레임 / 복잡한 문의
                      </div>
                      <div className="text-[13px] text-purple-500 font-bold mt-1">
                        &rarr; 전문 상담원 즉시 연결
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 bg-white p-6 sm:p-4 rounded-[18px] sm:rounded-[20px] shadow-[0_4px_16px_rgb(0,0,0,0.04)] border border-gray-100">
                    <div className="w-12 h-12 bg-blue-50 rounded-[14px] flex items-center justify-center shrink-0">
                      <PhoneCall className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <div className="text-[15px] font-bold text-gray-900">
                        부재중 전화
                      </div>
                      <div className="text-[13px] text-blue-500 font-bold mt-1">
                        &rarr; AI가 자동 콜백 스케줄링
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-[50%] order-1 md:order-2 flex flex-col justify-center">
                <div className="flex items-start sm:items-center gap-4 mb-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[16px] bg-purple-50 flex items-center justify-center text-purple-500 shrink-0">
                    <ArrowRight className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <h3 className="text-[20px] sm:text-[24px] font-bold text-gray-900 leading-tight">
                    상황에 맞는
                    <br className="hidden sm:block" />
                    스마트 라우팅
                  </h3>
                </div>
                <p className="text-[14px] sm:text-[16px] text-gray-500 leading-[1.6]">
                  단순한 문의는 AI가 즉시 처리하고, 감정적인 클레임이나 복잡한
                  문의는 즉시 전문 상담원에게 연결하여 고객 이탈을 방지합니다.
                </p>
              </div>
            </div>
          </SectionCard>

          {/* Card 6: 보안 */}
          <SectionCard
            surface="dark"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="md:col-span-1 flex flex-col justify-between overflow-hidden relative"
          >
            {/* Subtle glow effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px]" />

            <div className="relative z-10">
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-12 h-12 rounded-[14px] bg-gray-800 border border-gray-700 flex items-center justify-center text-white shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-[20px] font-bold text-white">
                  엔터프라이즈 보안
                </h3>
              </div>
              <p className="text-[15px] text-gray-400 leading-[1.6]">
                금융권 수준의 데이터 암호화와 개인정보 비식별화를 달성했습니다.
              </p>
            </div>
            <div className="mt-6 sm:mt-10 flex flex-col gap-3 relative z-10">
              <div className="bg-[#191f28] flex items-center gap-3 p-6 sm:p-3.5 rounded-[16px] border border-gray-700">
                <Lock className="w-5 h-5 text-green-400 shrink-0 ml-1" />
                <span className="text-[13px] font-bold text-gray-300">
                  End-to-End 암호화
                </span>
              </div>
              <div className="bg-[#191f28] flex items-center gap-3 p-6 sm:p-3.5 rounded-[16px] border border-gray-700">
                <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 ml-1" />
                <span className="text-[13px] font-bold text-gray-300">
                  ISO 27001 인증 준수
                </span>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </section>
  );
}
