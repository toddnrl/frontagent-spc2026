import styles from './Advantages.module.css'

const ITEMS = [
  {
    key: 'rules',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <line x1="4" y1="22" x2="4" y2="15" />
      </svg>
    ),
    title: '올바른 규칙',
    desc: '거짓말하는 AI를 방지하고, 기업 규정에 맞춘 정확한 안내로 리스크를 최소화합니다.',
  },
  {
    key: 'knowledge',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="14" rx="2" />
        <path d="M3 7h0" />
        <rect x="3" y="6" width="14" height="14" rx="2" />
        <rect x="1" y="10" width="14" height="14" rx="2" />
      </svg>
    ),
    title: '구조화된 지식',
    desc: '데이터를 단순 축적하는 것이 아니라, 구조화된 지식 체계(RAG)를 구축하여 AI가 완벽하게 이해하고 답변하게 합니다.',
  },
  {
    key: 'tasks',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
    key: 'improve',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 2.1l4 4-4 4" />
        <path d="M3 12.2v-2a4 4 0 0 1 4-4h12.8M7 21.9l-4-4 4-4" />
        <path d="M21 11.8v2a4 4 0 0 1-4 4H4.2" />
      </svg>
    ),
    title: '개선 제안',
    desc: 'AI 스스로 상담 품질을 진단하고 개선점을 제안하며, 오래된 지식을 자동으로 업데이트하여 최상의 성능을 유지합니다.',
  },
]

export default function Advantages() {
  return (
    <div className={`${styles.advantages} section`} id="advantages">
      <h2 className="stitle">상담 80%를 해결하는 AI가 가능한 이유</h2>
      <p className="slead" style={{ marginBottom: '30px' }}>
        채널톡 AI 상담사가 고객에게 제대로 답변할 수 있는 이유, 복잡하지 않습니다.<br />
        올바른 규칙, 구조화된 지식, 직접 실행 가능한 태스크, 개선 제안 이 네 가지면 충분합니다.
      </p>
      <div className={styles.grid}>
        {ITEMS.map(item => (
          <div key={item.key} className={styles.card}>
            <div className={styles.icon}>{item.icon}</div>
            <div className={styles.cardTitle}>{item.title} <span className={styles.arrow}>›</span></div>
            <div className={styles.cardDesc}>{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
