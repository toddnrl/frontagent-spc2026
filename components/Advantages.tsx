'use client'

import { pageSectionShell } from './sectionLayout'

const ITEMS = [
  {
    key: 'rules',
    color: '#c7e2d2',
    iconColor: '#2d6a4a',
    icon: (
      <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="#2d6a4a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <line x1="4" y1="22" x2="4" y2="15" />
      </svg>
    ),
    title: '올바른 규칙',
    desc: '거짓말하는 AI를 방지하고, 기업 규정에 맞춘 정확한 안내로 리스크를 최소화합니다.',
  },
  {
    key: 'knowledge',
    color: '#c9d8f2',
    iconColor: '#3a5a8a',
    icon: (
      <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="#3a5a8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="14" rx="2" />
        <rect x="1" y="8" width="14" height="14" rx="2" />
      </svg>
    ),
    title: '구조화된 지식',
    desc: '데이터를 단순 축적하는 것이 아니라, 구조화된 지식 체계(RAG)를 구축하여 AI가 완벽하게 이해하고 답변하게 합니다.',
  },
  {
    key: 'tasks',
    color: '#efdfb8',
    iconColor: '#8a6020',
    icon: (
      <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="#8a6020" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 2v6h-6" />
        <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
        <path d="M3 22v-6h6" />
        <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
      </svg>
    ),
    title: '직접 실행 가능한 태스크',
    desc: '단순 상담을 넘어 주문 취소나 예약 변경 등 실제 업무를 AI가 직접 수행하여 문제 해결 속도를 높입니다.',
  },
  {
    key: 'evaluation',
    color: '#ded7f5',
    iconColor: '#5b3df0',
    icon: (
      <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="#5b3df0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 2.1l4 4-4 4" />
        <path d="M3 12.2v-2a4 4 0 0 1 4-4h12.8M7 21.9l-4-4 4-4" />
        <path d="M21 11.8v2a4 4 0 0 1-4 4H4.2" />
      </svg>
    ),
    title: '개선 제안',
    desc: 'AI 스스로 상담 품질을 진단하고 개선점을 제안하며, 오래된 지식을 자동으로 업데이트하여 최상의 성능을 유지합니다.',
  },
]

const sectionClass =
  'mx-auto flex w-full max-w-[1400px] flex-col justify-center bg-transparent px-10 py-12 text-center max-[860px]:px-5'
const titleClass =
  'my-3.5 text-4xl mb-4 font-extrabold leading-tight tracking-[-0.04em] text-[#0f1118] max-[900px]:text-[28px]'
const leadClass =
  'mx-auto mb-[18px] w-full max-w-[800px] text-center text-[17px] leading-[1.75] text-[#5b6b8c]'

export default function Advantages() {
  return (
    <section className={`${pageSectionShell} relative sm:overflow-hidden`} id="advantages">
    <div className={sectionClass}>
      <h2 className={titleClass}>상담 자동화를 현실로 만드는 Call bee의 설계</h2>
      <p className={leadClass}>
        상담 공백을 줄이는 Call bee의 방법, 복잡하지 않습니다.<br />
        올바른 규칙, 구조화된 지식, 직접 실행 가능한 태스크, 개선 제안을 하나의 상담 솔루션으로 준비합니다.
      </p>
      <div className="mx-auto mt-18 grid w-full max-w-[1320px] grid-cols-4 gap-[clamp(20px,2.4vw,34px)] text-left max-[1100px]:grid-cols-2 max-[640px]:grid-cols-1 max-[640px]:gap-[14px]">
        {ITEMS.map(item => (
          <a
            key={item.key}
            href={`#${item.key}`}
            onClick={e => {
              e.preventDefault()
              document.getElementById(item.key)?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="group flex min-w-0 cursor-pointer flex-col gap-3 rounded-2xl border border-[rgba(0,0,0,0.1)] p-[clamp(22px,2.4vw,30px)] transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(0,0,0,0.18)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
          >
            <div
              className="mb-0.5 flex h-[58px] w-[58px] items-center justify-center rounded-[16px] transition-transform duration-300 group-hover:scale-110"
              style={{ background: item.color }}
            >
              {item.icon}
            </div>
            <div className="flex items-center gap-1 text-lg font-bold text-[var(--ink)]">
              {item.title} <span className="text-xl font-normal text-[var(--ink)]">›</span>
            </div>
            <div className="text-[15px] leading-[1.7] text-[var(--muted)]">{item.desc}</div>
          </a>
        ))}
      </div>
    </div>
    </section>
  )
}
