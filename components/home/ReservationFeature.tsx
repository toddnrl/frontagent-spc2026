import { motion } from "motion/react";
import { Calendar, MessageSquare, Phone, RefreshCw } from "lucide-react";
import { SectionCard } from "./SectionCard";

export function ReservationFeature() {
  return (
    <section id="reservation" className="py-16 sm:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-2 lg:order-1"
          >
            {/* Visual Representation of a Modern Calendar UI */}
            <SectionCard
              size="flush"
              className="sm:shadow-[0_12px_40px_rgb(0,0,0,0.06)]"
            >
              <div className="p-6 sm:px-6 sm:py-5 border-b border-gray-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white">
                <h3 className="text-[16px] sm:text-[17px] font-bold text-gray-900 flex items-center gap-2.5">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  예약 스케줄러
                </h3>
                <span className="flex w-fit items-center gap-1.5 text-[12px] sm:text-[13px] font-semibold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
                  <RefreshCw className="w-3.5 h-3.5" />
                  실시간 연동 중
                </span>
              </div>

              <div className="p-6 space-y-3">
                <div className="bg-white p-6 sm:p-4.5 rounded-[16px] ring-1 ring-gray-100 flex items-start sm:items-center gap-3 sm:gap-4 group hover:shadow-[0_4px_16px_rgb(0,0,0,0.06)] transition-shadow">
                  <div className="flex flex-col items-center justify-center shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-blue-50 rounded-[12px] text-blue-600">
                    <span className="text-[12px] font-semibold opacity-70">
                      오후
                    </span>
                    <span className="text-[18px] font-bold">2:00</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-start mb-1">
                      <div className="font-bold text-[15px] sm:text-[16px] text-gray-900">
                        김지수{" "}
                        <span className="text-[12px] sm:text-[13px] font-medium text-gray-500 font-normal ml-1">
                          재방문
                        </span>
                      </div>
                      <span className="bg-green-50 text-green-600 text-[12px] font-bold px-2.5 py-1 rounded-[6px]">
                        수락됨
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[13px] text-gray-500 font-medium">
                      <span className="flex items-center gap-1 text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-[4px]">
                        <Phone className="w-3 h-3" /> AI 전화 예약
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 sm:p-4.5 rounded-[16px] ring-1 ring-gray-100 flex items-start sm:items-center gap-3 sm:gap-4 group hover:shadow-[0_4px_16px_rgb(0,0,0,0.06)] transition-shadow">
                  <div className="flex flex-col items-center justify-center shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-gray-50 rounded-[12px] text-gray-600">
                    <span className="text-[12px] font-semibold opacity-70">
                      오후
                    </span>
                    <span className="text-[18px] font-bold">3:30</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-start mb-1">
                      <div className="font-bold text-[15px] sm:text-[16px] text-gray-900">
                        이성민{" "}
                        <span className="text-[12px] sm:text-[13px] font-medium text-gray-500 font-normal ml-1">
                          첫방문
                        </span>
                      </div>
                      <span className="bg-green-50 text-green-600 text-[12px] font-bold px-2.5 py-1 rounded-[6px]">
                        수락됨
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[13px] text-gray-500 font-medium">
                      <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded-[4px]">
                        <MessageSquare className="w-3 h-3" /> 카카오톡 예약
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-4.5 rounded-[16px] border border-dashed border-gray-200 bg-white/50 flex items-start sm:items-center gap-3 sm:gap-4 cursor-pointer hover:bg-white transition-colors">
                  <div className="flex flex-col items-center justify-center shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-transparent text-gray-400">
                    <span className="text-[12px] font-semibold opacity-70">
                      오후
                    </span>
                    <span className="text-[18px] font-bold">4:30</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-[15px] text-gray-400">
                      예약 가능한 시간
                    </div>
                    <div className="text-[13px] text-gray-400 mt-0.5 font-medium">
                      AI가 빈 시간대를 제안하고 있습니다.
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="order-1 lg:order-2"
          >
            <h2 className="text-[28px] sm:text-[40px] font-bold text-gray-900 mb-4 sm:mb-5 leading-tight tracking-tight">
              외부 캘린더와 완벽하게 <br />
              양방향 연동됩니다
            </h2>

            <p className="text-[15px] sm:text-[17px] text-gray-500 mb-8 sm:mb-10 leading-relaxed font-medium">
              구글 캘린더, 네이버 예약, 사내 자체 EMR 시스템 등 이미 사용 중인
              일정 관리 툴과 실시간으로 연동되어 이중 예약(Double Booking)을
              완벽하게 방지합니다.
            </p>

            <ul className="space-y-6 sm:space-y-8">
              <li className="flex gap-4">
                <div className="w-[32px] h-[32px] rounded-full bg-blue-50 flex items-center justify-center text-blue-500 font-bold shrink-0 text-[14px]">
                  1
                </div>
                <div>
                  <h4 className="text-[17px] sm:text-[19px] font-bold text-gray-900 mb-2">
                    기존 캘린더 연동 (API)
                  </h4>
                  <p className="text-[14px] sm:text-[16px] text-gray-600 leading-relaxed">
                    매장의 기존 캘린더를 시스템이 실시간으로 확인하고, 예약이
                    가능한 빈 시간대만 추출하여 고객에게 제안합니다.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-[32px] h-[32px] rounded-full bg-blue-50 flex items-center justify-center text-blue-500 font-bold shrink-0 text-[14px]">
                  2
                </div>
                <div>
                  <h4 className="text-[17px] sm:text-[19px] font-bold text-gray-900 mb-2">
                    자동 리마인드 메시지
                  </h4>
                  <p className="text-[14px] sm:text-[16px] text-gray-600 leading-relaxed">
                    노쇼(No-show)를 최소화하기 위해 예약 시간 전, 설정된 룰에
                    따라 카카오톡이나 알림톡으로 안내 메시지를 발송합니다.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-[32px] h-[32px] rounded-full bg-blue-50 flex items-center justify-center text-blue-500 font-bold shrink-0 text-[14px]">
                  3
                </div>
                <div>
                  <h4 className="text-[17px] sm:text-[19px] font-bold text-gray-900 mb-2">
                    대기 리스트 관리
                  </h4>
                  <p className="text-[14px] sm:text-[16px] text-gray-600 leading-relaxed">
                    기존 예약이 취소될 경우, 대기 중인 고객에게 즉시 알림을
                    발송하여 빈 스케줄을 자동으로 채워 매장의 수익을
                    극대화합니다.
                  </p>
                </div>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
