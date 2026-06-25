import { motion } from "motion/react";
import { MessageSquare, Calendar, CheckCircle2 } from "lucide-react";

export function Hero() {
  return (
    <section className="relative flex items-center overflow-hidden bg-white pt-24 pb-16 lg:min-h-[100dvh] lg:pt-20 lg:pb-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-6 text-left mb-10 sm:mb-16 lg:mb-0"
          >
            <div className="mb-4 text-[13px] font-bold text-blue-600">
              고객 응대 운영 자동화
            </div>

            <h1 className="text-[34px] sm:text-[56px] font-bold text-gray-900 tracking-[-0.02em] leading-[1.18] sm:leading-[1.18] mb-5 sm:mb-6 whitespace-pre-line">
              {"고객 문의 응대와\n예약 관리를 한곳에서"}
            </h1>
            
            <p className="text-[16px] sm:text-[19px] text-gray-500 mb-8 sm:mb-10 max-w-2xl leading-[1.65] font-medium">
              전화, 카카오톡, 웹챗으로 들어오는 반복 문의를 정리하고
              예약 확인, 변경, 안내 발송까지 실제 운영 흐름에 맞게 처리합니다.
            </p>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-md">
              <a href="#features" className="w-full sm:w-auto bg-blue-500 text-white font-bold px-7 py-4 rounded-2xl flex items-center justify-center text-[16px]">
                기능 살펴보기
              </a>
            </div>
            
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-gray-500 font-bold">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-blue-500" />전화/채팅 통합</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-blue-500" />예약 연동</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-blue-500" />상담 기록 저장</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            className="lg:col-span-6 relative"
          >
            {/* Dashboard Mockup - Toss Style */}
            <div className="relative mx-auto w-full max-w-[480px]">
              <div className="bg-white rounded-[16px] border border-gray-200 overflow-hidden flex flex-col h-[430px] sm:h-[520px]">
                {/* Header */}
                <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[10px] bg-gray-100 text-gray-700 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-[15px] sm:text-[16px] text-gray-900 leading-tight">Front Agent</div>
                      <div className="text-[12px] sm:text-[13px] font-medium text-gray-500 mt-0.5">상담 처리 화면</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] sm:text-[13px] font-semibold text-gray-500 px-2.5 sm:px-3 py-1.5">
                    <span className="relative flex h-2 w-2">
                       <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span> 
                    운영 중
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 min-h-0 flex flex-col relative bg-[#f9fafb]">
                  <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-7 relative">
                    
                    {/* Older Timestamp */}
                    <div className="flex justify-center">
                      <span className="bg-gray-200/60 text-gray-500 text-[12px] font-bold px-3 py-1 rounded-full shadow-sm">오늘 오후 2:30</span>
                    </div>

                    {/* Older Messages */}
                    <div className="flex gap-3 items-end opacity-60">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[11px] sm:text-[12px] font-bold shrink-0 mb-1 shadow-sm">
                        AI
                      </div>
                      <div className="bg-white p-3.5 sm:p-4.5 rounded-[18px] sm:rounded-[20px] rounded-bl-[4px] shadow-[0_4px_16px_rgb(0,0,0,0.04)] border border-gray-100 text-[13px] sm:text-[15px] text-gray-800 leading-[1.6] font-medium max-w-[86%]">
                        고객님의 지난 진료 내역을 보니 충치 치료 후 정기 검진을 받으실 시기네요. 혹시 이번 예약에 정기 검진도 함께 진행하시겠어요?
                      </div>
                    </div>
                    
                    <div className="flex gap-3 flex-row-reverse items-end opacity-60">
                      <div className="bg-[#3182F6] p-3.5 sm:p-4.5 rounded-[18px] sm:rounded-[20px] rounded-br-[4px] shadow-[0_4px_16px_rgb(49,130,246,0.25)] text-[13px] sm:text-[15px] text-white leading-[1.6] font-medium max-w-[86%]">
                        아! 깜빡했네요. 네 정기검진도 같이 잡아주세요.
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="flex justify-center mt-8">
                      <span className="bg-gray-100 text-gray-500 text-[12px] font-bold px-3 py-1 rounded-full shadow-sm">오늘 오후 2:34</span>
                    </div>

                    {/* Chat Bubbles */}
                    <div className="flex gap-3 items-end">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[11px] sm:text-[12px] font-bold shrink-0 mb-1 shadow-sm">
                        AI
                      </div>
                      <div className="bg-white p-3.5 sm:p-4.5 rounded-[18px] sm:rounded-[20px] rounded-bl-[4px] shadow-[0_4px_16px_rgb(0,0,0,0.04)] border border-gray-100 text-[13px] sm:text-[15px] text-gray-800 leading-[1.6] font-medium max-w-[86%]">
                        안녕하세요! 프론트 치과입니다.<br/>어떤 예약을 도와드릴까요?
                      </div>
                    </div>
                    
                    <div className="flex gap-3 flex-row-reverse items-end">
                      <div className="bg-[#3182F6] p-3.5 sm:p-4.5 rounded-[18px] sm:rounded-[20px] rounded-br-[4px] shadow-[0_4px_16px_rgb(49,130,246,0.25)] text-[13px] sm:text-[15px] text-white leading-[1.6] font-medium max-w-[86%]">
                        내일 오후 3시에 원장님 진료 가능한가요?
                      </div>
                    </div>

                    <div className="flex gap-3 items-end">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[11px] sm:text-[12px] font-bold shrink-0 mb-1 shadow-sm">
                        AI
                      </div>
                      <div className="space-y-4 w-full max-w-[85%]">
                        <div className="bg-white p-3.5 sm:p-4.5 rounded-[18px] sm:rounded-[20px] rounded-bl-[4px] shadow-[0_4px_16px_rgb(0,0,0,0.04)] border border-gray-100 text-[13px] sm:text-[15px] text-gray-800 leading-[1.6] font-medium">
                          네, 캘린더를 확인했습니다.<br/>내일 오후 3시 예약이 가능합니다.
                        </div>
                        
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ delay: 0.8, duration: 0.5, type: "spring", bounce: 0.4 }}
                          className="bg-white p-4 sm:p-5 rounded-[20px] sm:rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100/80"
                        >
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                              <Calendar className="w-[16px] h-[16px] text-blue-500" />
                            </div>
                            <span className="text-gray-900 font-bold text-[15px]">예약 시간 제안</span>
                          </div>
                          
                          <div className="space-y-2.5">
                            <button className="w-full relative overflow-hidden group p-4 rounded-[16px] bg-blue-50/50 border border-blue-200 text-left transition-all hover:bg-blue-50">
                              <div className="text-[13px] text-blue-500 font-bold mb-1">가장 요청과 가까운 시간</div>
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-blue-700 text-[14px] sm:text-[16px]">내일 오후 3:00</span>
                                <span className="text-blue-600 font-bold text-[12px] sm:text-[13px] group-hover:translate-x-1 transition-transform">예약하기 &rarr;</span>
                              </div>
                            </button>
                            <button className="w-full flex items-center justify-between p-4 rounded-[16px] bg-gray-50 border border-gray-200/60 font-semibold text-gray-600 text-[15px] hover:bg-gray-100 transition-colors">
                              내일 오후 4:30
                            </button>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bottom gradient fade for aesthetics */}
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#f9fafb] to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
