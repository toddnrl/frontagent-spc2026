import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { FileText, Link2, Database, Server } from "lucide-react";
import { SectionCard } from "./SectionCard";

const DOCUMENT_INDEXING_DURATION = 18_000;
const DATABASE_SYNC_DELAY = 1_800;
const DATABASE_SYNC_DURATION = 26_000;

function getProgress(elapsedTime: number, duration: number, delay = 0) {
  const activeElapsedTime = Math.max(elapsedTime - delay, 0);

  return Math.min(Math.floor((activeElapsedTime / duration) * 100), 100);
}

export function CustomRAG() {
  const [indexingProgress, setIndexingProgress] = useState({
    document: 0,
    database: 0,
  });
  const isDocumentIndexingComplete = indexingProgress.document >= 100;
  const isDatabaseSyncComplete = indexingProgress.database >= 100;
  const isIndexingComplete =
    isDocumentIndexingComplete && isDatabaseSyncComplete;

  useEffect(() => {
    if (isIndexingComplete) return;

    const startedAt = Date.now();

    const timer = window.setInterval(() => {
      const elapsedTime = Date.now() - startedAt;

      setIndexingProgress({
        document: getProgress(elapsedTime, DOCUMENT_INDEXING_DURATION),
        database: getProgress(
          elapsedTime,
          DATABASE_SYNC_DURATION,
          DATABASE_SYNC_DELAY,
        ),
      });
    }, 100);

    return () => window.clearInterval(timer);
  }, [isIndexingComplete]);

  return (
    <section id="rag" className="py-16 sm:py-32 bg-[#f9fafb]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-20">
          <h2 className="text-[28px] sm:text-[40px] font-bold text-gray-900 mb-4 sm:mb-5 tracking-tight">
            기업 데이터를 학습하는
            <br />
            맞춤형 지식 리소스(RAG)
          </h2>
          <p className="text-[15px] sm:text-[17px] text-gray-500 leading-relaxed">
            사내 규정, 매뉴얼, FAQ 문서 파일을 업로드하기만 하세요.
            <br className="hidden sm:block" />
            엔진이 스스로 파싱하여 회사 정책에 딱 맞는 정확한 답변을 제공합니다.
          </p>
        </div>

        <SectionCard
          size="section"
          className="relative sm:shadow-[0_8px_32px_rgb(0,0,0,0.04)]"
        >
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center relative z-10">
            <div className="space-y-4 sm:space-y-6">
              <div className="p-6 rounded-[18px] sm:rounded-[20px] bg-[#f9fafb] flex gap-3 sm:gap-4 transition-colors hover:bg-gray-100/50">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-[14px] bg-white shadow-sm flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-[16px] sm:text-[18px] font-bold text-gray-900 mb-1.5">
                    문서 무제한 업로드
                  </h3>
                  <p className="text-[14px] sm:text-[15px] text-gray-600 leading-[1.6]">
                    기존에 작성된 사내 매뉴얼이나 제품 가이드를 (PDF, DOCX)
                    그대로 업로드하면 텍스트를 고도화하여 인덱싱합니다.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-[18px] sm:rounded-[20px] bg-[#f9fafb] flex gap-3 sm:gap-4 transition-colors hover:bg-gray-100/50">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-[14px] bg-white shadow-sm flex items-center justify-center shrink-0">
                  <Link2 className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-[16px] sm:text-[18px] font-bold text-gray-900 mb-1.5">
                    URL 크롤링 동기화
                  </h3>
                  <p className="text-[14px] sm:text-[15px] text-gray-600 leading-[1.6]">
                    홈페이지나 사내 노션/위키 URL을 등록하면 주기적으로 변경된
                    내용을 긁어와 학습 데이터를 최신 상태로 유지합니다.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-[18px] sm:rounded-[20px] bg-[#f9fafb] flex gap-3 sm:gap-4 transition-colors hover:bg-gray-100/50">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-[14px] bg-white shadow-sm flex items-center justify-center shrink-0">
                  <Server className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-[16px] sm:text-[18px] font-bold text-gray-900 mb-1.5">
                    사내 DB 연동 (API)
                  </h3>
                  <p className="text-[14px] sm:text-[15px] text-gray-600 leading-[1.6]">
                    재고, 배송 데이터 등 실시간 조회가 필수적인 정보는 API
                    파이프라인을 통해 지연 없이 다이렉트로 가져옵니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-[#f9fafb] rounded-[20px] sm:rounded-[24px] p-6 sm:p-8 border border-gray-100 relative z-10">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 pb-5 border-b border-gray-200/80">
                  <span className="text-gray-900 font-bold text-[16px] sm:text-[18px] flex items-center gap-2">
                    <Database className="w-5 h-5 text-blue-500" />
                    데이터베이스 동기화
                  </span>
                  <span
                    className={`w-fit text-[12px] sm:text-[13px] font-bold px-3 py-1.5 rounded-full ${
                      isIndexingComplete
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-700 bg-gray-100"
                    }`}
                  >
                    {isIndexingComplete ? "인덱싱 완료" : "인덱싱중"}
                  </span>
                </div>

                <div className="space-y-5 sm:space-y-6">
                  <div>
                    <div className="flex justify-between gap-3 text-[12px] sm:text-[14px] text-gray-600 font-medium mb-2.5">
                      <span className="flex min-w-0 items-center gap-2">
                        <FileText className="w-4 h-4 shrink-0 text-gray-400" />
                        <span className="truncate">
                          refund_policy_final.pdf
                        </span>
                      </span>
                      <span
                        className={`font-bold ${isDocumentIndexingComplete ? "text-gray-900" : "text-blue-500"}`}
                      >
                        {indexingProgress.document}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full relative ${isDocumentIndexingComplete ? "bg-blue-600" : "bg-blue-400"}`}
                        initial={false}
                        animate={{ width: `${indexingProgress.document}%` }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      >
                        {!isDocumentIndexingComplete && (
                          <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        )}
                      </motion.div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between gap-3 text-[12px] sm:text-[14px] text-gray-600 font-medium mb-2.5">
                      <span className="flex min-w-0 items-center gap-2">
                        <Link2 className="w-4 h-4 shrink-0 text-gray-400" />
                        <span className="truncate">docs.front.ai/pricing</span>
                      </span>
                      <span
                        className={`font-bold ${isDatabaseSyncComplete ? "text-gray-900" : "text-blue-500"}`}
                      >
                        {indexingProgress.database}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full relative ${isDatabaseSyncComplete ? "bg-blue-600" : "bg-blue-400"}`}
                        initial={false}
                        animate={{ width: `${indexingProgress.database}%` }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      >
                        {!isDatabaseSyncComplete && (
                          <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        )}
                      </motion.div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 sm:mt-8 bg-white rounded-[16px] p-6 border border-gray-100">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-[12px] font-bold shrink-0 mt-0.5">
                      Q
                    </span>
                    <p className="text-[14px] sm:text-[15px] text-gray-900 font-semibold leading-relaxed">
                      프리미엄 요금제 환불 규정이 어떻게 되나요?
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[12px] font-bold shrink-0 mt-0.5">
                      A
                    </span>
                    <div className="text-[14px] sm:text-[15px] text-gray-700 leading-relaxed font-medium">
                      <span className="text-blue-500 text-[13px] block mb-1">
                        문서 기반 생성 - 정확도 99.8%
                      </span>
                      [이용약관 v2.1 기준] 결제 후 7일 이내 사용 이력이 없는
                      경우 100% 전액 환불이 가능합니다. 이외의 기간에는 일할
                      계산되어 환불 금액이 산정됩니다.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </section>
  );
}
