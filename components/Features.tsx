const mainGridClass =
  'mb-5 grid min-h-[440px] grid-cols-[380px_1fr] gap-0 overflow-hidden rounded-[20px] !border !border-[rgba(0,0,0,.07)] bg-white !shadow-[0_2px_12px_-2px_rgba(22,25,31,.07),0_0_0_0.5px_rgba(0,0,0,.04)] !transition-shadow !duration-200 max-[860px]:grid-cols-1'
const agentItemClass =
  'mx-[-8px] flex cursor-pointer items-center gap-3 rounded-[10px] border-t border-[var(--gray-border)] px-2 py-3.5 transition-colors duration-[120ms] hover:bg-[#f5f8ff] [&:first-child]:border-t-0 [&:first-child]:pt-0'
const agentIconClass = 'flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-xl text-base'
const agentNameClass = 'text-sm font-semibold text-[var(--black)]'
const qaItemClass =
  'flex cursor-pointer items-start gap-3 border-b border-[#f5f4f0] px-[18px] py-3.5 !transition-colors !duration-[120ms] hover:!bg-[#f5f8ff] [&:last-child]:border-b-0'
const qaAvatarClass = 'flex h-[38px] w-[38px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e8e4dd] text-lg'
const chipCardClass =
  'cursor-pointer rounded-[18px] !border !border-[rgba(0,0,0,.07)] bg-white px-4 py-5 !shadow-[0_2px_8px_-2px_rgba(22,25,31,.06)] !transition-[transform,box-shadow] !duration-[180ms] hover:!-translate-y-[3px] hover:!shadow-[0_10px_28px_-8px_rgba(22,25,31,.16)]'
const chipIconClass = 'mb-3.5 flex h-[38px] w-[38px] items-center justify-center rounded-xl bg-[#f0ede8] text-lg'
const chipTextClass = '!text-[13.5px] !font-bold leading-[1.45] text-[var(--black)]'
import { pageSectionShell } from './sectionLayout'

const sectionClass =
  'mx-auto flex w-full max-w-[1400px] flex-col justify-center bg-transparent px-10 py-12 max-[860px]:px-5'
const sectionTitleClass =
  'mb-9 text-[38px] font-black leading-[1.18] tracking-[-1.2px] text-[#0f1118] max-[860px]:text-[28px]'

export default function Features() {
  return (
    <section className={pageSectionShell} id="quality">
    <div className={sectionClass}>
      <h2 className={sectionTitleClass}>필요한 모든 기능을 다 담았습니다</h2>

      {/* Main two-panel card */}
      <div className={mainGridClass}>
        {/* Left: agent list */}
        <div className="flex flex-col border-r border-[var(--gray-border)] bg-white px-7 py-8">
          <div className="mb-1.5 text-xs font-bold text-[var(--gray-text)]">커스텀 에이전트</div>
          <div className="mb-3.5 text-xl font-extrabold leading-[1.3] text-[var(--black)]">예약 서비스를 자동화하세요.</div>
          <button className="mb-8 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--black)] text-base text-white">→</button>

          <div className="mt-auto flex flex-col gap-0">
            <div className={agentItemClass}>
              <div className={`${agentIconClass} bg-[#fff0e0]`}>💬</div>
              <div>
                <div className={agentNameClass}>
                  채팅&amp;통화 예약
                  <span className="mt-px block text-xs font-normal text-[var(--orange)]">이미 확보된 정보와 지식을 사용해 질문에 답변합니다.</span>
                </div>
              </div>
            </div>
            <div className={agentItemClass}>
              <div className={`${agentIconClass} bg-[#f0e8ff]`}>✅</div>
              <div>
                <div className={agentNameClass}>RAG 기반 지식 등록</div>
                <span className="mt-px block text-xs font-normal text-[var(--orange)]">AI가 알아야 할 지식을 등록해 질문에 답변합니다.</span>
              </div>
            </div>
            <div className={agentItemClass}>
              <div className={`${agentIconClass} bg-[#e0f5f0]`}>📊</div>
              <div>
                <div className={agentNameClass}>규칙 기반 에이전트</div>
                <span className="mt-px block text-xs font-normal text-[var(--orange)]">내 맘대로 AI 설정</span>
              </div>
            </div>
            <div className={agentItemClass}>
              <div className={`${agentIconClass} bg-[#ffe8f5]`}>🎨</div>
              <div>
                <div className={agentNameClass}>예약 태스크 설정</div>
                <span className="mt-px block text-xs font-normal text-[var(--orange)]">보여주고 싶은 내용을 설정할 수 있습니다.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Q&A UI panel */}
        <div className="relative overflow-hidden bg-[var(--peach-bg)] p-0">
          <div className="absolute top-6 left-6 right-0 w-auto overflow-hidden rounded-[18px_0_0_18px] bg-white !shadow-[-8px_0_40px_-4px_rgba(22,25,31,.12)] max-[860px]:relative max-[860px]:top-auto max-[860px]:left-auto max-[860px]:right-auto max-[860px]:w-full max-[860px]:rounded-none">
            <div className="border-b border-[var(--gray-border)] px-[18px] py-3.5 text-[13px] font-bold text-[var(--black)]">사무실 관련 Q&amp;A</div>

            <div className={qaItemClass}>
              <div className={qaAvatarClass}>👩</div>
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 text-[13px] font-bold text-[var(--black)]">김미현</div>
                <div className="mb-1.5 text-[13px] leading-[1.45] text-[#444]">경비는 어떻게 제출하나요?</div>
                <div className="inline-flex items-center gap-[5px] rounded-lg !bg-[#eef4ff] px-[9px] py-[3px] text-[11.5px] font-bold !text-[#2f6bf0]">💬 답변 1개</div>
              </div>
            </div>

            <div className={qaItemClass}>
              <div className={qaAvatarClass}>👓</div>
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 text-[13px] font-bold text-[var(--black)]">이은지</div>
                <div className="mb-1.5 text-[13px] leading-[1.45] text-[#444]">등록 기간은 언제인가요?</div>
                <div className="inline-flex items-center gap-[5px] rounded-lg !bg-[#eef4ff] px-[9px] py-[3px] text-[11.5px] font-bold !text-[#2f6bf0]">💬 답변 1개</div>
              </div>
              <div className="self-center shrink-0 text-sm text-[#ccc]">›</div>
            </div>

            <div className={qaItemClass}>
              <div className={qaAvatarClass}>🧑</div>
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 text-[13px] font-bold text-[var(--black)]">배수지</div>
                <div className="mb-1.5 text-[13px] leading-[1.45] text-[#444]">회사 캘린더는 어디에 있나요?</div>
                <div className="inline-flex items-center gap-[5px] rounded-lg !bg-[#eef4ff] px-[9px] py-[3px] text-[11.5px] font-bold !text-[#2f6bf0]">💬 답변 1개</div>
              </div>
            </div>

            <div className={`${qaItemClass} opacity-[0.55]`}>
              <div className={qaAvatarClass}>👨</div>
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 text-[13px] font-bold text-[var(--black)]">조정석</div>
                <div className="mb-1.5 text-[13px] leading-[1.45] text-[#444]">프린터 설정 방법은?</div>
              </div>
            </div>
          </div>

          <button className="absolute right-5 bottom-5 flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#e8e4dd] text-xs text-[#888]">⏸</button>
        </div>
      </div>

      {/* Bottom chips */}
      <div className="mb-3 text-xs font-bold text-[var(--orange)]">커스텀 에이전트로 할 수 있는 일</div>
      <div className="grid grid-cols-5 gap-2.5 max-[860px]:grid-cols-2">
        <div className={chipCardClass}>
          <div className={`${chipIconClass} bg-[#e0eaff]`}>🤖</div>
          <div className={chipTextClass}>제품 피드백 분류 <span className="ml-0.5 inline-block text-xs">→</span></div>
        </div>
        <div className={chipCardClass}>
          <div className={`${chipIconClass} bg-[#fff5d0]`}>💬</div>
          <div className={chipTextClass}>Slack에서 지원 티켓 해결 <span className="ml-0.5 inline-block text-xs">→</span></div>
        </div>
        <div className={chipCardClass}>
          <div className={`${chipIconClass} bg-[#ffe0d8]`}>🚨</div>
          <div className={chipTextClass}>보안 경고에 더 빠르게 대응 <span className="ml-0.5 inline-block text-xs">→</span></div>
        </div>
        <div className={chipCardClass}>
          <div className={`${chipIconClass} bg-[#d8f5e8]`}>📋</div>
          <div className={chipTextClass}>주간 리포트 작업 자동화 <span className="ml-0.5 inline-block text-xs">→</span></div>
        </div>
        <div className={`${chipCardClass} !border-[var(--blue-dark)] !bg-[linear-gradient(135deg,#1a2033,#2a3050)]`}>
          <div className="mb-3.5 flex">
            <div className="mr-[-4px] flex h-[26px] w-[26px] items-center justify-center rounded-full border-2 border-[var(--blue-dark)] bg-[#60b8ff] text-[13px]">◀</div>
            <div className="mr-[-4px] flex h-[26px] w-[26px] items-center justify-center rounded-full border-2 border-[var(--blue-dark)] bg-[#f5a623] text-[13px]">⏱</div>
            <div className="mr-[-4px] flex h-[26px] w-[26px] items-center justify-center rounded-full border-2 border-[var(--blue-dark)] bg-[#e85656] text-[13px]">👍</div>
          </div>
          <div className={`${chipTextClass} !text-white`}>
            나만의 커스텀 에이전트 만들기 <span className="ml-0.5 inline-block text-xs">→</span>
          </div>
        </div>
      </div>
    </div>
    </section>
  )
}
