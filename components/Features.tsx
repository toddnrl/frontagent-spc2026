'use client'

import { useState } from 'react'
import { pageSectionShell } from './sectionLayout'

const mainGridClass =
  'mb-5 grid min-h-[430px] grid-cols-[380px_1fr] gap-0 overflow-hidden rounded-[20px] !border !border-[rgba(0,0,0,.07)] bg-white !shadow-[0_2px_12px_-2px_rgba(22,25,31,.07),0_0_0_0.5px_rgba(0,0,0,.04)] !transition-shadow !duration-200 max-[860px]:min-h-0 max-[860px]:grid-cols-1'
const agentItemClass =
  'mx-[-8px] flex cursor-pointer items-start gap-3 rounded-[10px] border-t border-[var(--gray-border)] px-2 py-3.5 transition-colors duration-[120ms] hover:bg-[#f5f8ff] [&:first-child]:border-t-0 [&:first-child]:pt-0'
const agentIconClass = 'flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-xl text-base'
const agentNameClass = 'text-sm font-semibold text-[var(--black)]'
const qaItemClass =
  'flex cursor-pointer items-start gap-3 border-b border-[#f5f4f0] px-[18px] py-3.5 !transition-colors !duration-[120ms] hover:!bg-[#f5f8ff] [&:last-child]:border-b-0'
const qaAvatarClass = 'flex h-[38px] w-[38px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e8e4dd] text-lg'
const chipCardClass =
  'cursor-pointer rounded-[18px] !border !border-[rgba(0,0,0,.07)] bg-white px-4 py-5 !shadow-[0_2px_8px_-2px_rgba(22,25,31,.06)] !transition-[transform,box-shadow] !duration-[180ms] hover:!-translate-y-[3px] hover:!shadow-[0_10px_28px_-8px_rgba(22,25,31,.16)]'
const chipIconClass = 'mb-3.5 flex h-[38px] w-[38px] items-center justify-center rounded-xl bg-[#f0ede8] text-lg'
const chipTextClass = '!text-[13.5px] !font-bold leading-[1.45] text-[var(--black)]'

const sectionClass =
  'mx-auto flex w-full max-w-[1400px] flex-col justify-center bg-transparent px-10 py-12 max-[860px]:px-5'
const sectionTitleClass =
  'mb-9 text-[38px] font-black leading-[1.18] tracking-[-1.2px] text-[#0f1118] max-[860px]:text-[28px]'

/* ------------------------------------------------------------------ */
/*  에이전트 & 패널 데이터                                               */
/* ------------------------------------------------------------------ */

function QAPanel() {
  const items = [
    { icon: '👩', name: '김미현', question: '경비는 어떻게 제출하나요?', answers: 1 },
    { icon: '👓', name: '이은지', question: '등록 기간은 언제인가요?', answers: 1 },
    { icon: '🧑', name: '배수지', question: '회사 캘린더는 어디에 있나요?', answers: 1 },
    { icon: '👨', name: '조정석', question: '프린터 설정 방법은?', answers: 0 },
  ]
  return (
    <div className="absolute top-6 left-6 right-0 w-auto overflow-hidden rounded-[18px_0_0_18px] bg-white !shadow-[-8px_0_40px_-4px_rgba(22,25,31,.12)] max-[860px]:relative max-[860px]:top-auto max-[860px]:left-auto max-[860px]:right-auto max-[860px]:w-full max-[860px]:rounded-none">
      <div className="border-b border-[var(--gray-border)] px-[18px] py-3.5 text-[13px] font-bold text-[var(--black)]">사무실 관련 Q&amp;A</div>
      {items.map((item, i) => (
        <div key={i} className={`flex min-h-[92px] cursor-pointer items-center gap-3 border-b border-[#f5f4f0] px-[18px] py-3.5 transition-colors hover:bg-[#f5f8ff] last:border-b-0 ${item.answers}`}>
          <div className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-lg bg-[#f5f4f0] text-base">{item.icon}</div>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold text-[var(--black)]">{item.question}</div>
            <div className="text-[11.5px] text-[#999]">{item.name}</div>
          </div>
          {item.answers > 0 && (
            <span className="shrink-0 rounded-md bg-[#eef4ff] px-2 py-0.5 text-[11px] font-bold text-[#2f6bf0]">💬 답변 {item.answers}개</span>
          )}
        </div>
      ))}
    </div>
  )
}

function KnowledgePanel() {
  const docs = [
    { icon: '📄', title: '반품·교환 정책', tag: '정책', updated: '2일 전' },
    { icon: '📦', title: '배송 안내 문서', tag: '배송', updated: '5일 전' },
    { icon: '💳', title: '결제 및 환불 안내', tag: '결제', updated: '1주 전' },
    { icon: '🔧', title: '제품 사용 설명서', tag: '제품', updated: '2주 전' },
  ]
  return (
    <div className="absolute top-6 left-6 right-0 w-auto overflow-hidden rounded-[18px_0_0_18px] bg-white !shadow-[-8px_0_40px_-4px_rgba(22,25,31,.12)] max-[860px]:relative max-[860px]:top-auto max-[860px]:left-auto max-[860px]:right-auto max-[860px]:w-full max-[860px]:rounded-none">
      <div className="border-b border-[var(--gray-border)] px-[18px] py-3.5 text-[13px] font-bold text-[var(--black)]">등록된 지식 문서</div>
      {docs.map((doc, i) => (
        <div key={i} className="flex min-h-[92px] cursor-pointer items-center gap-3 border-b border-[#f5f4f0] px-[18px] py-3.5 transition-colors hover:bg-[#f5f8ff] last:border-b-0">
          <div className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-lg bg-[#f5f4f0] text-base">{doc.icon}</div>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold text-[var(--black)]">{doc.title}</div>
            <div className="text-[11.5px] text-[#999]">업데이트 {doc.updated}</div>
          </div>
          <span className="shrink-0 rounded-md bg-[#f0ede8] px-2 py-0.5 text-[11px] font-bold text-[#888]">{doc.tag}</span>
        </div>
      ))}
    </div>
  )
}

function RulesPanel() {
  const rules = [
    { label: '민감정보 답변 제한', desc: '개인정보·결제정보 등 민감 데이터는 AI가 직접 답변하지 않습니다.', on: true },
    { label: '기본 CX 톤앤매너', desc: '고객 응대 시 친절하고 일관된 브랜드 말투를 유지합니다.', on: true },
    { label: '반복 문의 지식 우선 참조', desc: '자주 묻는 질문은 등록된 지식 문서를 먼저 참조해 답변합니다.', on: true },
    { label: '문자 발송 전 고객 동의 확인', desc: '마케팅 문자 발송 전 수신 동의 여부를 자동으로 확인합니다.', on: false },
  ]
  return (
    <div className="absolute top-6 left-6 right-0 w-auto overflow-hidden rounded-[18px_0_0_18px] bg-white !shadow-[-8px_0_40px_-4px_rgba(22,25,31,.12)] max-[860px]:relative max-[860px]:top-auto max-[860px]:left-auto max-[860px]:right-auto max-[860px]:w-full max-[860px]:rounded-none">
      <div className="border-b border-[var(--gray-border)] px-[18px] py-3.5 text-[13px] font-bold text-[var(--black)]">활성화된 규칙</div>
      {rules.map((rule, i) => (
        <div key={i} className="flex min-h-[92px] cursor-pointer items-center gap-3 border-b border-[#f5f4f0] px-[18px] py-3.5 transition-colors hover:bg-[#f5f8ff] last:border-b-0">
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold text-[var(--black)]">{rule.label}</div>
            <div className="mt-0.5 text-[11.5px] text-[#999]">{rule.desc}</div>
          </div>
          <div className={[
            'h-5 w-9 shrink-0 rounded-full transition-colors duration-200',
            rule.on ? 'bg-[#2f6bf0]' : 'bg-[#ddd]',
          ].join(' ')}>
            <div className={[
              'mt-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200',
              rule.on ? 'translate-x-[18px]' : 'translate-x-0.5',
            ].join(' ')} />
          </div>
        </div>
      ))}
    </div>
  )
}

function TaskPanel() {
  const tasks = [
    { icon: '📅', label: '예약 접수', status: '자동 처리', color: 'text-[#2f6bf0] bg-[#eef4ff]' },
    { icon: '🔔', label: '예약 알림 발송', status: '자동 처리', color: 'text-[#2f6bf0] bg-[#eef4ff]' },
    { icon: '✏️', label: '예약 변경 요청', status: '상담원 확인', color: 'text-[#e8a93b] bg-[#fff8e6]' },
    { icon: '❌', label: '예약 취소', status: '상담원 확인', color: 'text-[#e8a93b] bg-[#fff8e6]' },
  ]
  return (
    <div className="absolute top-6 left-6 right-0 w-auto overflow-hidden rounded-[18px_0_0_18px] bg-white !shadow-[-8px_0_40px_-4px_rgba(22,25,31,.12)] max-[860px]:relative max-[860px]:top-auto max-[860px]:left-auto max-[860px]:right-auto max-[860px]:w-full max-[860px]:rounded-none">
      <div className="border-b border-[var(--gray-border)] px-[18px] py-3.5 text-[13px] font-bold text-[var(--black)]">예약 태스크 설정</div>
      {tasks.map((task, i) => (
        <div key={i} className="flex min-h-[92px] cursor-pointer items-center gap-3 border-b border-[#f5f4f0] px-[18px] py-3.5 transition-colors hover:bg-[#f5f8ff] last:border-b-0">
          <div className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-lg bg-[#f5f4f0] text-base">{task.icon}</div>
          <div className="min-w-0 flex-1 text-[13px] font-semibold text-[var(--black)]">{task.label}</div>
          <span className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold ${task.color}`}>{task.status}</span>
        </div>
      ))}
    </div>
  )
}

const agents = [
  {
    id: 'booking',
    icon: '💬',
    bg: 'bg-[#fff0e0]',
    name: '채팅 & 통화 상담',
    desc: '이미 확보된 정보와 지식을 사용해 질문에 답변합니다.',
    Panel: QAPanel,
  },
  {
    id: 'rag',
    icon: '✅',
    bg: 'bg-[#f0e8ff]',
    name: 'RAG를 활용한 지식 적용',
    desc: 'AI가 알아야 할 지식을 등록해 질문에 답변합니다.',
    Panel: KnowledgePanel,
  },
  {
    id: 'rules',
    icon: '📊',
    bg: 'bg-[#e0f5f0]',
    name: '규칙 기반 에이전트',
    desc: '내 맘대로 AI 행동 규칙을 설정합니다.',
    Panel: RulesPanel,
  },
  {
    id: 'tasks',
    icon: '🎨',
    bg: 'bg-[#ffe8f5]',
    name: '프로세스 설정',
    desc: '보여주고 싶은 내용을 설정할 수 있습니다.',
    Panel: TaskPanel,
  },
]

/* ------------------------------------------------------------------ */
/*  컴포넌트                                                            */
/* ------------------------------------------------------------------ */

export default function Features() {
  const [activeId, setActiveId] = useState(agents[0].id)

  return (
    <section className={pageSectionShell} id="features">
      <div className={sectionClass}>
        <span id="quality" className="sr-only" aria-hidden="true" />
        <h2 className={sectionTitleClass}>필요한 모든 기능을 다 담았습니다</h2>

        {/* Main two-panel card */}
        <div className={mainGridClass}>
          {/* Left: agent list */}
          <div className="flex flex-col border-r border-[var(--gray-border)] bg-white px-7 py-8">
            <div className="mb-1.5 text-xs font-bold text-[var(--gray-text)]">커스텀 에이전트</div>
            <div className="mb-3.5 text-xl font-extrabold leading-[1.3] text-[var(--black)]">예약 서비스를 자동화하세요.</div>

            <div className="mt-auto flex flex-col gap-0">
              {agents.map((agent) => {
                const isActive = agent.id === activeId
                return (
                  <div
                    key={agent.id}
                    className={agentItemClass}
                    onClick={() => setActiveId(agent.id)}
                  >
                    <div className={`${agentIconClass} ${agent.bg} mt-0.5`}>{agent.icon}</div>
                    <div className="min-w-0 flex-1">
                      <div className={agentNameClass}>{agent.name}</div>
                      {/* 아코디언 desc */}
                      <div
                        className={[
                          'overflow-hidden transition-all duration-300',
                          isActive ? 'max-h-20 opacity-100 mt-1' : 'max-h-0 opacity-0',
                        ].join(' ')}
                      >
                        <span className="block text-xs font-normal text-[var(--orange)]">
                          {agent.desc}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right: Q&A UI panel — activeAgent에 따라 전환 */}
          <div className="relative min-h-[430px] overflow-hidden p-0 max-[860px]:min-h-0">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className={[
                  'absolute inset-0 transition-opacity duration-300 max-[860px]:relative max-[860px]:inset-auto',
                  agent.bg,
                  agent.id === activeId
                    ? 'opacity-100 pointer-events-auto'
                    : 'opacity-0 pointer-events-none max-[860px]:hidden',
                ].join(' ')}
              >
                <agent.Panel />
              </div>
            ))}
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
