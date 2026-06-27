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
        신뢰감을 주면서도 안전한 답변을 사용해.
        {/* 고객이 질문한 내용만 최대한 간결하게 작성해줘 */}
      </div>
    ),
  },
  {
    key: 'knowledge',
    label: '반복 문의는 지식 문서 먼저 참조',
    content: (
      <div className={ruleDescClass}>같은 질문이 반복되면 상담원 연결 전 최신 지식 문서를 우선 검색합니다.</div>
    ),
  },
  {
    key: 'consent',
    label: '문자 발송 전 고객 동의 확인',
    content: (
      <div className={ruleDescClass}>안내 문자는 고객이 동의한 경우에만 발송합니다.</div>
    ),
  },
  {
    key: 'privacy',
    label: '민감정보 답변 제한',
    content: (
      <div className={ruleDescClass}>사장 연락처·결제정보 등 민감정보는 안내하지 않습니다.</div>
    ),
  },
]

const BEFORE_TEXT = '어 토요일? 2시랑 5시 비어 있어. 사장 번호는 010-1234-5678이고 환불은 그냥 연락하면 돼.'

function LabPanel() {
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(FUNCTIONS.map(f => [f.key, true]))
  )
  const [mode, setMode] = useState<'before' | 'after'>('after')
  const [flash, setFlash] = useState(false)

  function handleToggle(key: string) {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function handleMode(m: 'before' | 'after') {
    setMode(m)
    setFlash(false)
    setTimeout(() => setFlash(true), 10)
    setTimeout(() => setFlash(false), 510)
  }

  return (
    <div className="grid min-h-[clamp(380px,40vw,520px)] grid-cols-[1.4fr_0.8fr] items-stretch gap-[clamp(16px,2.5vw,34px)] max-[700px]:min-h-[auto] max-[700px]:grid-cols-1 max-[700px]:gap-4">
      {/* LEFT: panel */}
      <div className="flex flex-col justify-center rounded-[clamp(16px,1.8vw,26px)] !bg-[linear-gradient(145deg,#cddeff_0%,#b8ccff_50%,#a8bdff_100%)] px-[19%] py-[18px] !shadow-[inset_0_1px_0_rgba(255,255,255,.5)] max-[700px]:rounded-[18px] max-[700px]:px-[6%] max-[700px]:py-3.5">
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
              </div>
              {func.content}
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
          className={`ml-auto max-w-[88%] rounded-2xl rounded-br-[5px] !bg-white px-[clamp(10px,1vw,15px)] py-[clamp(9px,0.85vw,12px)] text-[clamp(12px,1.05vw,14px)] ${
            mode === 'before' ? '!text-[#4b5563]' : 'text-[#1a1a1a]'
          }`}
        >
          야 토요일 예약 되냐? 글고 사장 폰번호랑 환불 규정 좀
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
              안녕하세요! 고객님, 토요일 예약은 가능합니다 😊<br /><br />
              사장님 개인 연락처는 안내가 어렵고, 환불은 구매일로부터 7일 이내 미사용 시 100% 가능합니다. 추가 문의가 있으시면 말씀해 주세요!
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
    rules: "설정한 맞춤 '규칙'을 따르는 AI",
    knowledge: "가깝게 벗어나는 AI를 막는 '지식'",
    tasks: "가깝게 벗어나는 AI를 막는 '태스크'",
  }

  const sectionId = FUNCTIONS_ANCHOR_IDS[titleVariant]

  return (
    <section className={pageSectionShell} id={sectionId}>
    <div className={sectionClass}>
      <h2 className={sectionTitleClass}>{titles[titleVariant]}</h2>
      <p className={sectionLeadClass}>
        기업이 정한 규칙 안에서만 답변하도록 설정합니다.
      </p>
      <LabPanel />

      <div className="mt-7 grid grid-cols-[1.4fr_0.8fr] gap-[clamp(24px,4vw,48px)] pt-6 max-[700px]:grid-cols-1 max-[700px]:gap-5">
        <div>
          <div className="mb-2.5 text-[clamp(16px,1.4vw,19px)] font-bold text-[var(--ink)]">규칙 설정</div>
          <p className={labMetaDescClass}>
            규칙을 잘 작성할수록 AI가 똑똑해지고 정확하게 답변합니다. 문의 유형, 고객 정보, 상황에 따라 다른 규칙을 적용할 수 있습니다. 상황에 따라 끄고 켤 수 있습니다.
          </p>
        </div>
        <div className="flex flex-col gap-2.5">
          <div className="inline-flex items-center gap-[7px] text-[clamp(13px,1.15vw,16px)] font-bold text-[var(--ink)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
            규칙이 없을 때
          </div>
          <p className={labMetaDescClass}>통제와 규칙 없이 작동하는 AI는 혼란과 위험을 만듭니다</p>
        </div>
      </div>
    </div>
    </section>
  )
}
