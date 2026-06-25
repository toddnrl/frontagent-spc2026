'use client'

import { useState, useEffect, useRef } from 'react'
import styles from './Phone.module.css'

type MsgFrom = 'u' | 'a' | 'card'
interface Msg {
  f: MsgFrom
  t?: string
  rows?: [string, string][]
}
interface Script {
  who: string
  msgs: Msg[]
}

const SCRIPTS: Record<string, Script> = {
  salon: {
    who: '헤어살롱 예약',
    msgs: [
      { f: 'u', t: '토요일에 펌 예약하고 싶은데 자리 있어요?' },
      { f: 'a', t: '안녕하세요! 토요일은 <b>오후 2시</b>, <b>5시</b> 가능해요. 펌은 약 2시간 소요됩니다. 어느 시간이 좋으세요?' },
      { f: 'u', t: '2시로 해주세요' },
      { f: 'a', t: '네! 지정 디자이너 있으실까요? 없으시면 바로 확정해 드릴게요 🙂' },
      { f: 'u', t: '아무나 괜찮아요' },
      { f: 'card', rows: [['날짜', '토요일 14:00'], ['시술', '펌 (2시간)'], ['예약자', '홍길동']] },
    ],
  },
  resto: {
    who: '레스토랑 예약',
    msgs: [
      { f: 'u', t: '금요일 저녁 7시 4명 예약 되나요?' },
      { f: 'a', t: '금요일 7시 홀은 마감이고, <b>7시 30분</b> 또는 <b>룸</b>이 가능해요. 어느 쪽으로 안내드릴까요?' },
      { f: 'u', t: '룸으로 할게요' },
      { f: 'a', t: '좋아요! 성함만 남겨주시면 룸 예약 확정해 드릴게요.' },
      { f: 'u', t: '홍길동입니다' },
      { f: 'card', rows: [['날짜', '금요일 19:00'], ['좌석', '룸 · 4인'], ['예약자', '홍길동']] },
    ],
  },
  space: {
    who: '공간대여 예약',
    msgs: [
      { f: 'u', t: '일요일 오후에 회의실 2시간 대관 돼요?' },
      { f: 'a', t: '일요일은 <b>1시~3시</b>, <b>4시~6시</b>가 비어 있어요. 인원과 시작 시간 알려주시겠어요?' },
      { f: 'u', t: '6명, 1시부터요' },
      { f: 'a', t: '확인했습니다! 빔프로젝터 포함으로 예약 확정해 드릴게요.' },
      { f: 'card', rows: [['날짜', '일요일 13:00~15:00'], ['공간', '회의실 A · 6인'], ['옵션', '빔프로젝터']] },
    ],
  },
  deliv: {
    who: '배송 예약',
    msgs: [
      { f: 'u', t: '내일 오전에 받게 배송 예약 가능한가요?' },
      { f: 'a', t: '네, 내일 <b>오전 9~12시</b> 배송 가능해요. 받으실 주소와 연락처 남겨주시겠어요?' },
      { f: 'u', t: '역삼동 ○○로 12, 010-1234-5678' },
      { f: 'a', t: '접수되었습니다! 출발 시 알림으로 안내드릴게요 📦' },
      { f: 'card', rows: [['희망 시간', '내일 09:00~12:00'], ['주소', '역삼동 ○○로 12'], ['상태', '배송 예약 완료']] },
    ],
  },
}

const TABS = [
  { key: 'salon', label: '💇 미용실' },
  { key: 'resto', label: '🍽 음식점' },
  { key: 'space', label: '🏛 공간대여' },
  { key: 'deliv', label: '📦 배송' },
]

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

interface ChatMessage {
  id: number
  type: 'user' | 'agent' | 'card' | 'typing'
  content?: string
  rows?: [string, string][]
  mode?: string
}

export default function Section5() {
  const [activeTab, setActiveTab] = useState('salon')
  const [mode, setMode] = useState<'chat' | 'call'>('chat')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [pWho, setPWho] = useState('헤어살롱 예약')
  const [pStatus, setPStatus] = useState('AI 응대 중')
  const phoneRef = useRef<HTMLDivElement>(null)
  const chatBodyRef = useRef<HTMLDivElement>(null)
  const genRef = useRef(0)
  const hasStarted = useRef(false)

  async function play(domain: string, currentMode: string) {
    const gen = ++genRef.current
    const sc = SCRIPTS[domain]
    setPWho(sc.who)
    setPStatus(currentMode === 'call' ? 'AI 통화 응대 중' : 'AI 응대 중')
    setMessages([])
    await sleep(250)

    let msgId = 0
    for (const m of sc.msgs) {
      if (genRef.current !== gen) return

      if (m.f !== 'u') {
        // Show typing indicator
        const typingId = msgId++
        setMessages(prev => [...prev, { id: typingId, type: 'typing' }])
        await sleep(880)
        if (genRef.current !== gen) return
        // Remove typing
        setMessages(prev => prev.filter(x => x.id !== typingId))
      }

      if (m.f === 'card') {
        setMessages(prev => [...prev, { id: msgId++, type: 'card', rows: m.rows }])
      } else if (m.f === 'u') {
        setMessages(prev => [...prev, { id: msgId++, type: 'user', content: m.t }])
      } else {
        setMessages(prev => [...prev, { id: msgId++, type: 'agent', content: m.t, mode: currentMode }])
      }

      await sleep(m.f === 'u' ? 640 : 700)
    }
  }

  // Auto-scroll chat
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight
    }
  }, [messages])

  // IntersectionObserver to start on scroll
  useEffect(() => {
    if (!phoneRef.current) return
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !hasStarted.current) {
          hasStarted.current = true
          play('salon', 'chat')
          observer.disconnect()
        }
      },
      { threshold: 0.35 }
    )
    observer.observe(phoneRef.current)
    return () => observer.disconnect()
  }, [])

  function handleTabClick(key: string) {
    setActiveTab(key)
    play(key, mode)
  }

  function handleModeClick(m: 'chat' | 'call') {
    setMode(m)
    play(activeTab, m)
  }

  return (
    <div className="section" id="domains">
      <h2 className="stitle reveal">업종이 달라도, 예약은 AI가 받습니다</h2>
      <p className="slead reveal" style={{ whiteSpace: 'nowrap' }}>
        미용실·음식점·공간대여·배송까지. 같은 엔진에 지식과 규칙만 바꿔 끼우면 됩니다. 탭을 눌러 직접 확인하세요.
      </p>

      <div className={`${styles.chatsec} reveal`}>
        <div style={{ paddingLeft: '24px' }}>
          <div className={styles.dtabs} id="dtabs">
            {TABS.map(tab => (
              <button
                key={tab.key}
                className={`${styles.dtab}${activeTab === tab.key ? ' ' + styles.dtabActive : ''}`}
                onClick={() => handleTabClick(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <p className={styles.chatDesc}>
            각 업종의 빈 시간 확인과 예약 확정 흐름을 AI가 자연스럽게 처리합니다. 채팅과 전화 두 채널 모두 같은 방식으로 동작해요.
          </p>
        </div>

        <div className={styles.phone} id="phone" ref={phoneRef}>
          {/* Phone bar */}
          <div className={styles.phoneBar}>
            <span className={styles.phoneAv}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M4 5h16v11H8l-4 3V5z" stroke="#2f6bf0" strokeWidth="1.7" strokeLinejoin="round"/>
              </svg>
            </span>
            <div>
              <div className={styles.phoneWho}>{pWho}</div>
              <div className={styles.phoneSt}>
                <span className={styles.live} />
                <span>{pStatus}</span>
              </div>
            </div>
            <div className={styles.modeWrap}>
              <button
                className={mode === 'chat' ? styles.modeOn : ''}
                onClick={() => handleModeClick('chat')}
              >채팅</button>
              <button
                className={mode === 'call' ? styles.modeOn : ''}
                onClick={() => handleModeClick('call')}
              >통화</button>
            </div>
          </div>

          {/* Chat body */}
          <div className={styles.phoneBody} ref={chatBodyRef}>
            {messages.map(msg => {
              if (msg.type === 'typing') {
                return (
                  <div key={msg.id} className="typing">
                    <span/><span/><span/>
                  </div>
                )
              }
              if (msg.type === 'card') {
                return (
                  <div key={msg.id} className="bcard">
                    <div className="bcard__h">
                      <svg width="15" height="15" viewBox="0 0 15 15">
                        <path d="M3 8l3 3 6-7" stroke="#2bb673" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      예약이 확정되었습니다
                    </div>
                    {msg.rows?.map(([label, value], i) => (
                      <div key={i} className="bcard__r">
                        <span>{label}</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                )
              }
              if (msg.type === 'user') {
                return (
                  <div key={msg.id} className="msg msg--u">{msg.content}</div>
                )
              }
              // agent
              return (
                <div key={msg.id} className="msg msg--a">
                  <span className="msg__tag">{msg.mode === 'call' ? 'AI 통화' : 'AI 비서'}</span>
                  <span dangerouslySetInnerHTML={{ __html: msg.content || '' }} />
                </div>
              )
            })}
          </div>

          {/* Phone foot */}
          <div className={styles.phoneFoot}>
            <div className={styles.phoneFake}>메시지를 입력하세요…</div>
            <button className={styles.replay} onClick={() => play(activeTab, mode)}>↻ 다시 보기</button>
          </div>
        </div>
      </div>
    </div>
  )
}
