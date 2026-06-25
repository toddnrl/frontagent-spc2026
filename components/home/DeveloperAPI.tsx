import { Terminal, Code2, Webhook, Container } from "lucide-react";
import { SectionCard } from "./SectionCard";

export function DeveloperAPI() {
  return (
    <section id="api" className="py-16 sm:py-32 bg-[#191f28] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[10px] bg-white/10 text-gray-300 text-sm font-semibold mb-6">
            <Terminal className="w-4 h-4" />
            <span>Developer Ecosystem</span>
          </div>
          <h2 className="text-[28px] sm:text-[40px] font-bold text-white mb-4 sm:mb-5 tracking-tight">
            원하는 환경 어디든, <br className="hidden sm:block" />
            코드 몇 줄로 통합하세요
          </h2>
          <p className="text-[15px] sm:text-[17px] text-gray-400 leading-relaxed font-medium">
            기존 사내 시스템, 새로운 프로덕트 환경, 혹은 MCP(Model Context Protocol) 환경까지. <br className="hidden sm:block" />
            개발자를 위한 강력하고 유연한 API 생태계를 지원합니다.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-5 sm:gap-8 mb-10 sm:mb-12">
          {/* REST API Card */}
          <SectionCard surface="api" size="compact">
            <div className="w-12 h-12 rounded-[14px] bg-blue-500/10 text-blue-400 flex items-center justify-center mb-6">
              <Code2 className="w-6 h-6" />
            </div>
            <h3 className="text-[20px] font-bold text-white mb-3">RESTful API</h3>
            <p className="text-[15px] text-gray-400 leading-[1.6] mb-6 font-medium">
              모든 대화 기록, 예약 내역, 설정값에 프로그래밍 방식으로 접근할 수 있는 표준 REST API를 제공합니다.
            </p>
            <div className="bg-[#191f28] p-3 sm:p-4 rounded-[12px] font-mono text-[12px] sm:text-[13px] text-gray-300 border border-white/5 overflow-x-auto">
              <span className="text-blue-400">GET</span> /v1/conversations<br/>
              <span className="text-gray-500">Authorization: Bearer {'<token>'}</span>
            </div>
          </SectionCard>

          {/* Webhooks Card */}
          <SectionCard surface="api" size="compact">
            <div className="w-12 h-12 rounded-[14px] bg-purple-500/10 text-purple-400 flex items-center justify-center mb-6">
              <Webhook className="w-6 h-6" />
            </div>
            <h3 className="text-[20px] font-bold text-white mb-3">Real-time Webhook</h3>
            <p className="text-[15px] text-gray-400 leading-[1.6] mb-6 font-medium">
              고객 문의 발생, 예약 확정/취소 등 주요 이벤트 발생 시 실시간으로 사내 슬랙이나 서버로 알림을 전송합니다.
            </p>
            <div className="bg-[#191f28] p-3 sm:p-4 rounded-[12px] font-mono text-[12px] sm:text-[13px] text-gray-300 border border-white/5">
              {"{"}<br/>
              &nbsp;&nbsp;<span className="text-purple-400">{'"event"'}</span>: {'"reservation.created"'},<br/>
              &nbsp;&nbsp;<span className="text-purple-400">{'"data"'}</span>: {"{ ... }"}<br/>
              {"}"}
            </div>
          </SectionCard>

          {/* MCP Card */}
          <SectionCard surface="api" size="compact" className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-[40px]" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-[14px] bg-green-500/10 text-green-400 flex items-center justify-center mb-6">
                <Container className="w-6 h-6" />
              </div>
              <h3 className="text-[20px] font-bold text-white mb-3">MCP 프로토콜 지원</h3>
              <p className="text-[15px] text-gray-400 leading-[1.6] mb-6 font-medium">
                표준 Model Context Protocol 스펙을 지원하여, 여러분의 LLM 워크스페이스(Cursor, Claude 등)에서 자사 데이터를 즉시 호출할 수 있습니다.
              </p>
              <div className="bg-[#191f28] p-3 sm:p-4 rounded-[12px] font-mono text-[12px] sm:text-[13px] text-gray-300 border border-white/5 overflow-x-auto">
                <span className="text-green-400">mcp connect</span> front-ai \<br/>
                &nbsp;&nbsp;--api-key=$FRONT_API_KEY
              </div>
            </div>
          </SectionCard>
        </div>
        
        <div className="text-center mt-10 sm:mt-12">
          <button className="bg-white hover:bg-gray-100 text-[#191f28] font-bold px-8 py-4 rounded-[16px] transition-colors text-[16px]">
            API 문서 보기
          </button>
        </div>
      </div>
    </section>
  );
}
