'use client'

import { useState, type ReactNode } from 'react'
import { FUNCTIONS_ANCHOR_IDS, pageSectionShell } from './sectionLayout'

const ruleDescClass = 'mt-1 max-w-none pl-[3px] text-[clamp(11px,0.9vw,12.5px)] leading-[1.55] text-[var(--muted)]'
const ruleClass = 'border-b border-[var(--line)] bg-white py-[clamp(10px,1.2vw,14px)] last:border-0 last:pb-0'
const ruleLabelClass = 'flex-1 text-[clamp(12px,1.05vw,14.5px)] font-bold text-[var(--ink)]'
const labAClass =
  'mt-[clamp(10px,1vw,14px)] min-h-[clamp(72px,8vw,96px)] rounded-2xl rounded-bl-[5px] !border !border-[rgba(0,0,0,.06)] !bg-white px-[clamp(12px,1.2vw,17px)] py-[clamp(11px,1.1vw,15px)] text-[clamp(12px,1.05vw,14px)] leading-[1.6]'
const modeBtnClass = 'cursor-pointer px-[clamp(20px,2.2vw,32px)] py-[clamp(7px,0.7vw,10px)] text-[clamp(11px,0.95vw,13px)] font-bold transition-all duration-150 [font-family:inherit]'
const labMetaDescClass = 'm-0 text-[clamp(13px,1.1vw,15px)] leading-[1.65] text-[var(--muted)]'
const sectionClass =
  'mx-auto flex w-full max-w-[1400px] flex-col justify-center bg-transparent px-10 py-12 max-[860px]:px-5'
const sectionTitleClass =
  'my-3.5 text-4xl font-extrabold leading-tight tracking-[-0.04em] text-[#0f1118] max-[900px]:text-[28px]'
const sectionLeadClass = 'mb-[18px] max-w-[660px] text-[17px] leading-[1.75] text-[#5b6b8c]'

interface Functions {
  key: string
  label: string
  content: ReactNode
}

const FUNCTIONS: Functions[] = [
  {
    key: 'formal',
    label: '기본 CX 톤앤매너',
    content: (
      <div className={ruleDescClass}>
        신뢰감을 주면서도 안전한 답변을 사용합니다.
        {/* 고객이 질문한 내용만 최대한 간결하게 작성해줘 */}
        <ul className="mt-1.5 list-disc space-y-0.5 pl-4">
          <li>브랜드 관련된 내용을 친절하게 안내해줘.</li>
          <li>고객이 질문한 내용만 최대한 간결하게 작성해줘.</li>
        </ul>
      </div>
    ),
  },
  {
    key: 'privacy',
    label: '민감정보 답변 제한',
    content: (
      <div className={ruleDescClass}>
        연락처·결제정보 등 민감정보는 안내하지 않습니다.
        <ul className="mt-1.5 list-disc space-y-0.5 pl-4">
          <li>고객의 개인정보는 절대 외부에 공유하지 않습니다.</li>
          <li>결제 관련 문의는 공식 채널을 통해서만 안내합니다.</li>
        </ul>
      </div>
    ),
  },
  {
    key: 'knowledge',
    label: '반복 문의는 지식 문서 먼저 참조',
    content: (
      <div className={ruleDescClass}>
        상담원 연결 전 지식 문서를 우선 검색합니다.
        <ul className="mt-1.5 list-disc space-y-0.5 pl-4">
          <li>자주 묻는 질문은 지식 베이스에서 먼저 확인합니다.</li>
          <li>답변을 찾지 못한 경우에만 상담원에게 연결합니다.</li>
        </ul>
      </div>
    ),
  },
  {
    key: 'consent',
    label: '문자 발송 전 고객 동의 확인',
    content: (
      <div className={ruleDescClass}>
        안내 문자는 고객이 동의한 경우에만 발송합니다.
        <ul className="mt-1.5 list-disc space-y-0.5 pl-4">
          <li>수신 동의 여부를 먼저 확인한 후 발송을 진행합니다.</li>
          <li>동의하지 않은 고객에게는 문자를 발송하지 않습니다.</li>
        </ul>
      </div>
    ),
  },
]

const BEFORE_TEXT = '어 토요일? 2시랑 5시 비어 있어. 사장 번호는 010-1234-5678이고 환불은 그냥 연락하면 돼.'

function buildAfterAnswer(toggles: Record<string, boolean>): ReactNode {
  const formal = toggles['formal']
  const privacy = toggles['privacy']
  const knowledge = toggles['knowledge']

  const greeting = formal
    ? <>안녕하세요! 고객님, 토요일 예약은 가능합니다 😊<br /><br /></>
    : <>어, 토요일 2시랑 5시 비어 있어.<br /><br /></>

  const privacyPart = privacy
    ? '사장님 개인 연락처는 안내가 어렵고, '
    : '사장님 개인 연락처는 010-1234-5678이고, '

  const refundPart = knowledge
    ? '환불은 구매일로부터 7일 이내 미사용 시 100% 가능합니다.'
    : '환불은 고객센터로 문의해 주세요.'

  const closing = formal ? ' 추가 문의가 있으시면 말씀해 주세요!' : ''

  return <>{greeting}{privacyPart}{refundPart}{closing}</>
}

interface LabPanelProps {
  mode: 'before' | 'after'
  onModeChange: (m: 'before' | 'after') => void
}

function LabPanel({ mode, onModeChange }: LabPanelProps) {
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(FUNCTIONS.map(f => [f.key, true]))
  )
  const [open, setOpen] = useState<string | null>(FUNCTIONS[0].key)
  const [flash, setFlash] = useState(false)

  function handleToggle(key: string) {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function handleOpen(key: string) {
    setOpen(prev => (prev === key ? null : key))
  }

  function handleMode(m: 'before' | 'after') {
    onModeChange(m)
    setFlash(false)
    setTimeout(() => setFlash(true), 10)
    setTimeout(() => setFlash(false), 510)
  }

  return (
    <div className="grid min-h-[clamp(380px,40vw,520px)] grid-cols-[1.4fr_0.8fr] items-stretch gap-[clamp(16px,2.5vw,34px)] max-[700px]:min-h-[auto] max-[700px]:grid-cols-1 max-[700px]:gap-4">
      {/* LEFT: panel */}
      <div className="relative overflow-hidden flex flex-col justify-center rounded-[clamp(16px,1.8vw,26px)] !bg-[linear-gradient(145deg,#cddeff_0%,#b8ccff_50%,#a8bdff_100%)] px-[19%] py-[18px] !shadow-[inset_0_1px_0_rgba(255,255,255,.5)] max-[700px]:rounded-[18px] max-[700px]:px-[6%] max-[700px]:py-3.5">
        {/* White diagonal sheen */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.38)_0%,rgba(255,255,255,0.12)_28%,transparent_48%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_60%,rgba(255,255,255,0.1)_100%)]" />
        {/* Geometric shape decorations */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 400 280"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Full circle — top-left peek */}
          <circle cx="-8" cy="58" r="70" fill="rgba(255,255,255,0.22)" />
          {/* Quarter circle — bottom-left */}
          <path d="M-8,280 L-8,192 Q-8,132 52,132 L52,280 Z" fill="rgba(255,255,255,0.18)" />
          {/* Arch / rainbow — top-right */}
          <path d="M296,2 A58,58 0 0,1 412,2 L412,28 A34,34 0 0,0 296,28 Z" fill="rgba(255,255,255,0.22)" />
          {/* Small filled circle — bottom-right */}
          <circle cx="396" cy="272" r="48" fill="rgba(255,255,255,0.17)" />
          {/* Clover / petal — center-right edge */}
          <g transform="translate(384,142)" fill="rgba(255,255,255,0.17)">
            <ellipse cx="0"   cy="-20" rx="13" ry="20" />
            <ellipse cx="20"  cy="0"   rx="20" ry="13" />
            <ellipse cx="0"   cy="20"  rx="13" ry="20" />
            <ellipse cx="-20" cy="0"   rx="20" ry="13" />
          </g>
        </svg>
        <div className="rounded-[clamp(12px,1.3vw,18px)] !border !border-[rgba(0,0,0,.06)] bg-white px-4 py-2.5 !shadow-[0_4px_24px_-8px_rgba(22,25,31,.18)]">
          {FUNCTIONS.map(func => (
            <div key={func.key} className={ruleClass}>
              <div className="flex items-center justify-between gap-2.5">
                <div className={ruleLabelClass}>{func.label}</div>
                <button
                  className={`relative h-[26px] w-[46px] shrink-0 cursor-pointer rounded-full border-0 shadow-[0_2px_6px_rgba(0,0,0,0.12)] transition-colors duration-200 after:absolute after:left-[3px] after:top-[3px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-[0_2px_6px_rgba(0,0,0,0.25)] after:transition-transform after:duration-200 ${
                    toggles[func.key]
                      ? 'bg-[linear-gradient(135deg,#2f6bf0,#5b6bf0)] after:translate-x-5'
                      : 'bg-[#d4d8e2]'
                  }`}
                  aria-pressed={toggles[func.key]}
                  onClick={() => handleToggle(func.key)}
                />
                <button
                  className={`flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-[var(--muted)] ${open === func.key ? 'rotate-180' : ''}`}
                  aria-expanded={open === func.key}
                  onClick={() => handleOpen(func.key)}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
              </div>
              {open === func.key && func.content}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: preview */}
      <div
        className={`flex flex-col rounded-[clamp(14px,1.5vw,20px)] !border p-[clamp(14px,1.7vw,24px)] transition-colors duration-300 ${
          mode === 'after'
            ? '!border-[rgba(206,168,241,0.3)] !bg-[#e7e7fd]'
            : '!border-[rgba(0,0,0,.07)] bg-[#ebebeb]'
        }`}
      >
        <div className="mb-3 text-[clamp(10px,0.85vw,12px)] font-bold text-[var(--muted)]">💬 규칙 적용 미리보기</div>
        <div
          className="ml-auto max-w-[88%] rounded-2xl rounded-br-[5px] border border-[rgba(0,0,0,.15)] bg-transparent px-[clamp(10px,1vw,15px)] py-[clamp(9px,0.85vw,12px)] text-[clamp(12px,1.05vw,14px)] text-[#1a1a1a]"
        >
          토요일 예약 가능? 그리고 연락처랑 환불 규정 좀
        </div>
        <div
          className={`${labAClass}${mode === 'after' ? ' !bg-[#f4f6fb]' : ''}${mode === 'before' ? ' !border-[rgba(0,0,0,.09)] !bg-white text-[#5a5a5a]' : ''}${flash ? ' animate-[flash_0.5s]' : ''}`}
        >
          {mode === 'before' ? (
            <>
              <span className="mb-[5px] block text-[11px] font-extrabold text-[#6b7280]">⚠ 규칙 미적용</span>
              {BEFORE_TEXT}
            </>
          ) : (
            <>
              <span className="mb-[5px] block text-[11px] font-extrabold text-[#1a1a1a]">✦ AI 답변</span>
              {buildAfterAnswer(toggles)}
            </>
          )}
        </div>

        {/* Before / After buttons */}
        <div className="mt-auto flex justify-center gap-0 border-t border-[var(--line)] pt-[clamp(10px,1.2vw,16px)]">
          <button
            className={`${modeBtnClass} rounded-[10px_0_0_10px] border border-[var(--line)] bg-white text-[var(--ink)] ${
              mode === 'before' ? '!border-[#6b7280] !bg-[#6b7280] !text-white' : ''
            }`}
            onClick={() => handleMode('before')}
          >
            Before
          </button>
          <button
            className={`${modeBtnClass} rounded-[0_10px_10px_0] border border-[var(--line)] bg-white text-[var(--ink)] ${
              mode === 'after' ? '!border-[#7c3aed] !bg-[#7c3aed] !text-white' : ''
            }`}
            onClick={() => handleMode('after')}
          >
            After
          </button>
        </div>
      </div>
    </div>
  )
}

interface Section3Props {
  titleVariant?: 'rules' | 'knowledge' | 'tasks'
}

export default function Section3({ titleVariant = 'rules' }: Section3Props) {
  const titles: Record<string, string> = {
    rules: "설정한 맞춤 규칙을 따르는 AI",
    knowledge: "정교한 답변을 위한 지식 등록",
    tasks: "가깝게 벗어나는 AI를 막는 '태스크'",
  }

  const leads: Record<string, string> = {
    rules: "기업이 정한 규칙을 반영하고, 그에 맞는 답변을 하도록 설정합니다.",
    knowledge: "필요한 지식을 등록하고, AI가 정확한 정보를 바탕으로 답변하도록 합니다.",
    tasks: "AI가 수행할 태스크를 정의하고, 일관된 방식으로 처리되도록 설정합니다.",
  }

  const subTitles: Record<string, string> = {
    rules: "규칙 설정",
    knowledge: "지식 등록",
    tasks: "태스크 설정",
  }

  const subDescs: Record<string, string> = {
    rules: "문의 유형이나 서비스 정책에 따라 규칙을 추가하거나 변경하여 원하는 상담 품질을 유지할 수 있습니다.",
    knowledge: "자주 묻는 질문이나 제품 정보를 등록해 AI가 정확하게 안내할 수 있도록 합니다.",
    tasks: "특정 요청에 대해 AI가 일관된 방식으로 처리하도록 태스크를 추가하거나 변경할 수 있습니다.",
  }

  const sectionId = FUNCTIONS_ANCHOR_IDS[titleVariant]
  const [mode, setMode] = useState<'before' | 'after'>('after')

  return (
    <section className={`${pageSectionShell} relative overflow-hidden`} id={sectionId}>
      {/* White diagonal gradient decorations */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -left-24 -top-32 h-[420px] w-[700px] rotate-[22deg] bg-[linear-gradient(to_right,rgba(255,255,255,0.09),transparent)]" />
        <div className="absolute -bottom-32 right-0 h-[360px] w-[580px] rotate-[22deg] bg-[linear-gradient(to_left,rgba(255,255,255,0.06),transparent)]" />
      </div>
    <div className={`${sectionClass} relative z-10`}>
      <h2 className={sectionTitleClass}>{titles[titleVariant]}</h2>
      <p className={sectionLeadClass}>
        {leads[titleVariant]}
      </p>
      <LabPanel mode={mode} onModeChange={setMode} />

      <div className="mt-7 grid grid-cols-[1.4fr_0.8fr] gap-[clamp(24px,4vw,48px)] pt-6 max-[700px]:grid-cols-1 max-[700px]:gap-5">
        <div className="pl-4">
          <div className="mb-2.5 text-[clamp(16px,1.4vw,19px)] font-bold text-[var(--ink)]">규칙 설정</div>
          <p className={labMetaDescClass}>
            문의 유형이나 서비스 정책에 따라 규칙을 추가하거나 변경하여 원하는 상담 품질을 유지할 수 있습니다.
          </p>
        </div>
        <div className="flex flex-col gap-2.5 pl-4">
          {mode === 'before' ? (
            <>
              <div className="inline-flex items-center gap-[7px] text-[clamp(13px,1.15vw,16px)] font-bold text-[var(--ink)]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                </svg>
                규칙이 없을 때
              </div>
              <p className={labMetaDescClass}>통제와 규칙 없이 작동하는 AI는 혼란과 위험을 만듭니다</p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-[7px] text-[clamp(13px,1.15vw,16px)] font-bold text-[#2f6bf0]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="7 12.5 10.5 16 17 9" />
                </svg>
                규칙이 있을 때
              </div>
              <p className={labMetaDescClass}>규칙 안에서 AI가 일관되고 안전하게 답변합니다</p>
            </>
          )}
        </div>
      </div>
    </div>
    </section>
  )
}
