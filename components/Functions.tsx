'use client'

import { useState, useId } from 'react'
import styles from './Functions.module.css'

interface Functions {
  key: string
  label: string
  content: React.ReactNode
}

const FUNCTIONS: Functions[] = [
  {
    key: 'formal',
    label: '기본 CX 톤앤매너',
    content: (
      <div className={styles.ruleDesc}>
        신뢰감을 주면서도 안전한 답변을 사용해.
        {/* 고객이 질문한 내용만 최대한 간결하게 작성해줘 */}
      </div>
    ),
  },
  {
    key: 'knowledge',
    label: '반복 문의는 지식 문서 먼저 참조',
    content: (
      <div className={styles.ruleDesc}>같은 질문이 반복되면 상담원 연결 전 최신 지식 문서를 우선 검색합니다.</div>
    ),
  },
  {
    key: 'consent',
    label: '문자 발송 전 고객 동의 확인',
    content: (
      <div className={styles.ruleDesc}>안내 문자는 고객이 동의한 경우에만 발송합니다.</div>
    ),
  },
  {
    key: 'privacy',
    label: '민감정보 답변 제한',
    content: (
      <div className={styles.ruleDesc}>사장 연락처·결제정보 등 민감정보는 안내하지 않습니다.</div>
    ),
  },
]

const BEFORE_TEXT = '어 토요일? 2시랑 5시 비어 있어. 사장 번호는 010-1234-5678이고 환불은 그냥 연락하면 돼.'
const AFTER_TEXT = '안녕하세요! 고객님, 토요일 예약은 가능합니다 😊\n\n사장님 개인 연락처는 안내가 어렵고, 환불은 구매일로부터 7일 이내 미사용 시 100% 가능합니다.'

function LabPanel({ titleKey }: { titleKey: string }) {
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

  const activeCount = Object.values(toggles).filter(Boolean).length

  return (
    <div className={styles.lab}>
      {/* LEFT: panel */}
      <div className={styles.labPanelWrap}>
        <div className={styles.labPanel}>
          {FUNCTIONS.map(func => (
            <div key={func.key} className={styles.rule}>
              <div className={styles.ruleTop}>
                <div className={styles.ruleL}>{func.label}</div>
                <button
                  className={`tg${toggles[func.key] ? ' on' : ''}`}
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
      <div className={`${styles.labPrev} ${mode === 'after' ? styles.labPrevAfter : ''}`}>
        <div className={styles.previewLabel}>💬 규칙 적용 미리보기</div>
        <div className={`${styles.labQ} ${mode === 'before' ? styles.labQBefore : ''}`}>야 토요일 예약 되냐? 글고 사장 폰번호랑 환불 규정 좀</div>
        <div className={`${styles.labA}${mode === 'before' ? ` ${styles.labABefore}` : ''}${flash ? ' flash' : ''}`}>
          {mode === 'before' ? (
            <>
              <span className="tag" style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#6b7280', marginBottom: '5px' }}>⚠ 규칙 미적용</span>
              {BEFORE_TEXT}
            </>
          ) : (
            <>
              <span className="tag" style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#1a1a1a', marginBottom: '5px' }}>✦ AI 답변</span>
              안녕하세요! 고객님, 토요일 예약은 가능합니다 😊<br /><br />
              사장님 개인 연락처는 안내가 어렵고, 환불은 구매일로부터 7일 이내 미사용 시 100% 가능합니다. 추가 문의가 있으시면 말씀해 주세요!
            </>
          )}
        </div>

        {/* Before / After buttons */}
        <div className={styles.modeRow}>
          <button
            className={`${styles.modeBtn} ${styles.modeBtnLeft} ${mode === 'before' ? styles.modeBtnActiveBefore : ''}`}
            onClick={() => handleMode('before')}
          >
            Before
          </button>
          <button
            className={`${styles.modeBtn} ${styles.modeBtnRight} ${mode === 'after' ? styles.modeBtnActive : ''}`}
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
    rules: "가깝게 벗어나는 AI를 막는 '규칙'",
    knowledge: "가깝게 벗어나는 AI를 막는 '지식'",
    tasks: "가깝게 벗어나는 AI를 막는 '태스크'",
  }

  return (
    <div className="section" id="rules">
      <h2 className="stitle">{titles[titleVariant]}</h2>
      <p className="slead" style={{ marginBottom: '18px' }}>
        잘못된 프로모션을 약속하거나, 규정과 다른 안내를 하는 AI는 기업의 리스크가 됩니다.
      </p>
      <LabPanel titleKey={titleVariant} />

      <div className={styles.labMeta}>
        <div className={styles.labMetaLeft}>
          <div className={styles.labMetaTitle}>규칙 설정</div>
          <p className={styles.labMetaDesc}>
            규칙을 잘 작성할수록 AI가 똑똑해지고 정확하게 답변합니다. 문의 유형, 고객 정보, 상황에 따라 다른 규칙을 적용할 수 있습니다. 상황에 따라 끄고 켤 수 있습니다.
          </p>
        </div>
        <div className={styles.labMetaRight}>
          <div className={styles.labMetaBadge}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
            규칙이 없을 때
          </div>
          <p className={styles.labMetaDesc}>통제와 규칙 없이 작동하는 AI는 혼란과 위험을 만듭니다</p>
        </div>
      </div>
    </div>
  )
}
