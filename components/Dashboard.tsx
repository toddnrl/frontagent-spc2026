import styles from "./Dashboard.module.css";

/* ================================================================== */
/*  공용                                                               */
/* ================================================================== */

const AVATAR_COLORS: Record<string, string> = {
  배지희: "#E8836B",
  이지현: "#C77DBB",
  한지윤: "#6BA8E8",
  김수현: "#6BCBA8",
  박지민: "#E8B86B",
  박지은: "#E89BB0",
  이종혁: "#7C8AE8",
  이도윤: "#7CC9E8",
  정하린: "#B59BE8",
  오예진: "#E8A07C",
};

function Avatar({ name, size = 24 }: { name: string; size?: number }) {
  return (
    <span
      className={styles.avatar}
      style={{
        width: size,
        height: size,
        background: AVATAR_COLORS[name] ?? "#B6BBC2",
        fontSize: size * 0.42,
      }}
    >
      {name.slice(-2, -1)}
    </span>
  );
}

function Tag({ label, tone }: { label: string; tone: "red" | "green" | "yellow" | "purple" | "gray" }) {
  return <span className={`${styles.tag} ${styles[`tag_${tone}`]}`}>{label}</span>;
}

/* 아주 단순한 라인 아이콘들 */
const I = {
  inbox: "M3 6.5h14M5 6.5l1 9a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-9",
  person: "M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5 6c0-2.8 2.2-4.5 5-4.5s5 1.7 5 4.5",
  flow: "M10 3v4m0 6v4M3 10h4m6 0h4",
  funnel: "M3 4h14l-5 6v5l-4 2v-7L3 4Z",
  phone: "M5 4h3l1.5 4-2 1.2a9 9 0 0 0 4 4l1.2-2 4 1.5v3a1 1 0 0 1-1 1A13 13 0 0 1 4 5a1 1 0 0 1 1-1Z",
  help: "M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm-1.6-8.4c0-1 .8-1.6 1.7-1.6s1.7.6 1.7 1.5c0 .8-.5 1.1-1.1 1.5-.5.3-.6.6-.6 1.2M10 14.2v.01",
  bell: "M6 8a4 4 0 0 1 8 0c0 4 1.5 5 1.5 5h-11S6 12 6 8Zm2.5 8a1.5 1.5 0 0 0 3 0",
  star: "M10 3l2 4.2 4.6.5-3.4 3.1 1 4.5L10 13l-4.2 2.3 1-4.5L3.4 7.7 8 7.2 10 3Z",
  eye: "M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5Zm8 2a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  clock: "M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm0-11v5l3 2",
  gear: "M10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7-3-1.4.6.4 1.5-1 1.5-1.5-.4-1.1 1L11.5 17h-3l-.4-1.6-1.5-.4-1.5 .9-1-1.5L4 12.6 3 12V8l1.6-.6L4 5.9l1-1.5L6.5 5 8 4l.5-1.6h3L12 4l1.5-.4 1.5.9L14 6l1.6.6L17 8v2Z",
};

function Icon({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d={d} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ================================================================== */
/*  1. 아이콘 레일                                                      */
/* ================================================================== */

function IconRail() {
  return (
    <nav className={styles.rail}>
      <div className={styles.railTop}>
        <button className={`${styles.railBtn} ${styles.railActive}`} aria-label="수신함">
          <Icon d={I.inbox} />
        </button>
        <button className={styles.railBtn} aria-label="연락처">
          <Icon d={I.person} />
        </button>
        <button className={styles.railBtn} aria-label="플로우">
          <Icon d={I.flow} />
        </button>
        <button className={styles.railBtn} aria-label="필터">
          <Icon d={I.funnel} />
        </button>
        <button className={styles.railBtn} aria-label="전화">
          <Icon d={I.phone} />
        </button>
      </div>
      <button className={styles.railBtn} aria-label="도움말">
        <Icon d={I.help} />
      </button>
    </nav>
  );
}

/* ================================================================== */
/*  2. 수신함 컬럼                                                      */
/* ================================================================== */

function InboxColumn() {
  const queues = [
    { label: "누적", count: 3, color: "#E8A86B" },
    { label: "엑스퍼트", count: 5, color: "#C77DBB" },
    { label: "제품", count: 2, color: "#6BCBA8" },
  ];
  const assignees = [
    { name: "배지희", count: 5 },
    { name: "이지현", count: 14 },
    { name: "한지윤", count: 22 },
    { name: "김수현", count: 8 },
    { name: "박지민", count: 16 },
  ];
  const services = [
    { label: "채널톡 메시지", count: 102, color: "#3B82F6" },
    { label: "전화", count: 22, color: "#22C55E" },
    { label: "이메일", count: 35, color: "#EF4444" },
    { label: "라인 Official...", count: 12, color: "#22C55E" },
  ];

  return (
    <aside className={styles.inbox}>
      <h2 className={styles.colTitle}>수신함</h2>

      <ul className={styles.navList}>
        <li className={styles.navRow}>
          <Avatar name="배지희" size={20} />
          <span className={styles.navLabel}>배지희</span>
          <span className={styles.folderDot} />
          <span className={styles.count}>5</span>
        </li>
        <li className={`${styles.navRow} ${styles.navRowActive}`}>
          <span className={styles.navIcon}>📥</span>
          <span className={styles.navLabel}>전체</span>
          <span className={styles.count}>1k</span>
        </li>
        <li className={styles.navRow}>
          <span className={styles.navIconLine}><Icon d={I.bell} size={16} /></span>
          <span className={styles.navLabel}>안 읽은 메시지</span>
        </li>
        <li className={styles.navRow}>
          <span className={styles.navIconLine}><Icon d={I.star} size={16} /></span>
          <span className={styles.navLabel}>즐겨찾기</span>
        </li>
        <li className={styles.navRow}>
          <span className={styles.navIconLine}><Icon d={I.eye} size={16} /></span>
          <span className={styles.navLabel}>내 세션</span>
        </li>
        <li className={styles.navRow}>
          <span className={styles.navIconLine}><Icon d={I.clock} size={16} /></span>
          <span className={styles.navLabel}>예약 메시지</span>
        </li>
      </ul>

      <div className={styles.divider} />

      <ul className={styles.navList}>
        <li className={styles.navRow}>
          <span className={styles.navIconLine}><Icon d={I.gear} size={16} /></span>
          <span className={styles.navLabel}>고객 ALF</span>
        </li>
      </ul>

      <p className={styles.groupLabel}>대기열 <span className={styles.caret}>⌄</span></p>
      <ul className={styles.navList}>
        {queues.map((q) => (
          <li key={q.label} className={styles.navRow}>
            <span className={styles.swatch} style={{ background: q.color }} />
            <span className={styles.navLabel}>{q.label}</span>
            <span className={styles.count}>{q.count}</span>
          </li>
        ))}
      </ul>

      <p className={styles.groupLabel}>담당자 <span className={styles.caret}>⌄</span></p>
      <ul className={styles.navList}>
        {assignees.map((a) => (
          <li key={a.name} className={styles.navRow}>
            <Avatar name={a.name} size={20} />
            <span className={styles.navLabel}>{a.name}</span>
            <span className={styles.folderDot} />
            <span className={styles.count}>{a.count}</span>
          </li>
        ))}
        <li className={`${styles.navRow} ${styles.navMuted}`}>
          <span className={styles.navIcon}>＋</span>
          <span className={styles.navLabel}>팀 멤버 초대</span>
        </li>
      </ul>

      <p className={styles.groupLabel}>서비스 <span className={styles.caret}>⌄</span></p>
      <ul className={styles.navList}>
        {services.map((s) => (
          <li key={s.label} className={styles.navRow}>
            <span className={styles.serviceDot} style={{ background: s.color }} />
            <span className={styles.navLabel}>{s.label}</span>
            <span className={styles.count}>{s.count}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

/* ================================================================== */
/*  3. 대화 목록 컬럼                                                   */
/* ================================================================== */

function ListColumn() {
  const items = [
    {
      name: "박지은",
      agent: "이지현",
      time: "방금",
      text: "네.. 앞으로는 확인 잘 부탁드립니다.",
      tags: [
        { label: "불만", tone: "red" as const },
        { label: "반품", tone: "yellow" as const },
        { label: "보상처리", tone: "purple" as const },
      ],
      active: true,
    },
    {
      name: "이종혁",
      agent: "김수현",
      time: "방금",
      text: "배송 문의 드립니다.\n(김수현: 수동 처리 완료!)",
      tags: [],
    },
    {
      name: "이도윤",
      agent: "배지희",
      time: "2분",
      text: "아 상품 링크 부탁드려도 될까요?",
      tags: [
        { label: "교환", tone: "purple" as const },
        { label: "배송안내", tone: "green" as const },
      ],
    },
    {
      name: "정하린",
      agent: "박지민",
      time: "5분",
      text: "선물 포장 옵션 추가 가능한가요?",
      tags: [],
    },
    {
      name: "오예진",
      agent: "이지현",
      time: "5분",
      text: "아직 출고 전이면 다른 색상으로 변…",
      tags: [],
    },
  ];

  return (
    <section className={styles.list}>
      <div className={styles.listHeader}>
        <h2 className={styles.colTitle}>전체</h2>
        <div className={styles.listHeaderIcons}>
          <span className={styles.checkbox}>☑</span>
          <span className={styles.sortIcon}>⇅</span>
        </div>
      </div>

      <div className={styles.chips}>
        <button className={`${styles.chip} ${styles.chipActive}`}>진행중</button>
        <button className={styles.chip}>보류중</button>
        <button className={styles.chip}>부재중</button>
        <button className={styles.chip}>종료됨</button>
      </div>

      <ul className={styles.convList}>
        {items.map((it, i) => (
          <li key={i} className={`${styles.convItem} ${it.active ? styles.convActive : ""}`}>
            <Avatar name={it.name} size={36} />
            <div className={styles.convBody}>
              <div className={styles.convTop}>
                <strong className={styles.convName}>{it.name}</strong>
                <span className={styles.convDot}>·</span>
                <span className={styles.convAgent}>{it.agent}</span>
                <span className={styles.convTime}>{it.time}</span>
              </div>
              <p className={styles.convText}>{it.text}</p>
              {it.tags.length > 0 && (
                <div className={styles.convTags}>
                  {it.tags.map((t) => (
                    <Tag key={t.label} label={t.label} tone={t.tone} />
                  ))}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ================================================================== */
/*  4. 대화 스레드 컬럼                                                 */
/* ================================================================== */

function ThreadColumn() {
  return (
    <section className={styles.thread}>
      <div className={styles.threadTabs}>
        <button className={`${styles.tTab} ${styles.tTabActive}`}>고객</button>
        <button className={styles.tTab}>팀</button>
        <button className={styles.tTab}>AI CoS</button>
      </div>

      <div className={styles.threadHeader}>
        <div className={styles.threadTitle}>
          <span className={styles.star}>☆</span>
          <strong>박지은</strong>
        </div>
        <div className={styles.threadActions}>
          <span>෴</span>
          <span>🔗</span>
          <span>⋮</span>
          <span>☾</span>
          <button className={styles.closeBtn}>✓ 종료</button>
        </div>
      </div>

      <div className={styles.messages}>
        <div className={styles.msgRowRight}>
          <div className={styles.bubbleCustomer}>2주 전에 반품 접수했는데 아직도 환불이 안 됐어요.</div>
        </div>

        <div className={styles.internalNote}>
          <span className={styles.internalLabel}>› 내부활동 (3)</span>
          <span className={styles.internalText}>반품 회수 완료, 환불 미처리 — 정산팀 지연</span>
        </div>

        <div className={styles.msgRowLeft}>
          <Avatar name="이지현" size={32} />
          <div>
            <div className={styles.msgMeta}>
              <strong>이지현</strong>
              <span className={styles.msgTime}>● 8:40 PM</span>
            </div>
            <div className={styles.bubbleAgent}>
              안녕하세요, 지은님.<br />
              확인해보니 저희 시스템 오류로 환불 처리가 누락되었습니다.<br />
              정말 죄송합니다. 바로 환불 처리 도와드리겠습니다.
            </div>
          </div>
        </div>

        <div className={styles.msgRowRight}>
          <div className={styles.bubbleCustomer}>2주나 기다렸는데…</div>
        </div>
        <div className={styles.msgRowRight}>
          <div className={styles.bubbleCustomer}>시스템 오류라뇨 😡 전화도 잘 안받으시더니</div>
        </div>

        <div className={styles.internalNote}>
          <span className={styles.internalLabel}>› 내부활동 (8)</span>
        </div>

        <div className={styles.msgRowLeft}>
          <Avatar name="이지현" size={32} />
          <div>
            <div className={styles.internalChatLabel}>내부대화</div>
            <div className={styles.bubbleInternal}>
              <span className={styles.mention}>@배지희</span> 혹시 이 분 적립금 발급 드려도 괜찮을까요?
            </div>
          </div>
        </div>

        <div className={styles.msgRowLeft}>
          <Avatar name="배지희" size={32} />
          <div>
            <div className={styles.internalChatLabel}>내부대화</div>
            <div className={styles.bubbleInternal}>
              <span className={styles.mention}>@이지현</span> 네. 3만원 보상 드리는게 좋을 것 같아요.
            </div>
          </div>
        </div>

        <button className={styles.viewAll}>전체보기</button>

        <div className={styles.msgRowLeft}>
          <Avatar name="이지현" size={32} />
          <div>
            <div className={styles.msgMeta}>
              <strong>이지현</strong>
              <span className={styles.msgTime}>● 8:40 PM</span>
            </div>
            <div className={styles.bubbleAgent}>
              불편을 드려서 진심으로 사과드립니다. 🥹<br />
              환불은 지금 바로 처리되었고, 기다려주신 시간에 대한 사과로<br />
              3만원 적립금도 함께 넣어드렸습니다. 다시 한 번 죄송합니다.
            </div>
          </div>
        </div>
      </div>

      <div className={styles.composer}>
        <div className={styles.composerTabs}>
          <span className={`${styles.cTab} ${styles.cTabActive}`}>고객응대</span>
          <span className={styles.cTab}>내부대화</span>
        </div>
        <p className={styles.composerPlaceholder}>고객에게 보낼 메시지를 입력해 주세요.</p>
        <div className={styles.composerBar}>
          <div className={styles.composerTools}>
            <span>＋</span>
            <span>T</span>
            <span>☺</span>
            <span>@</span>
            <span>🗨</span>
            <span className={styles.toolDivider} />
            <span>◫</span>
            <span>↬</span>
          </div>
          <div className={styles.sendGroup}>
            <span className={styles.aiSpark}>✦</span>
            <button className={styles.sendBtn}>▸</button>
            <button className={styles.sendCaret}>⌄</button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  5. 상세 정보 컬럼                                                   */
/* ================================================================== */

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.dRow}>
      <span className={styles.dLabel}>{label}</span>
      <span className={styles.dValue}>{children}</span>
    </div>
  );
}

function DetailColumn() {
  return (
    <aside className={styles.detail}>
      <div className={styles.detailHeader}>
        <h2 className={styles.colTitle}>상세 정보</h2>
        <span className={styles.detailIcon}>▭</span>
      </div>

      <Row label="팀">
        <span className={styles.teamPill}>🌳 CX</span>
      </Row>
      <Row label="담당자">
        <span className={styles.inlineUser}>
          <Avatar name="이지현" size={18} /> 이지현
        </span>
      </Row>
      <Row label="팔로워">
        <span className={styles.followers}>
          <Avatar name="이지현" size={18} />
          <Avatar name="배지희" size={18} />
          <Avatar name="김수현" size={18} />
          <span className={styles.followAdd}>↪</span>
        </span>
      </Row>

      <p className={styles.groupLabel}>고객 정보 <span className={styles.caret}>⌄</span></p>
      <div className={styles.customerHead}>
        <Avatar name="박지은" size={28} />
        <strong>박지은</strong>
        <span className={styles.memberPill}>회원</span>
      </div>
      <Row label="이메일"><span className={styles.greenDot} />a**@gmail.com</Row>
      <Row label="대표 번호"><span className={styles.greenDot} />+82 10-****-1234</Row>
      <Row label="유입 페이지"><a className={styles.link}>https://sadheuk.com</a></Row>
      <Row label="적립금">₩3,400</Row>
      <Row label="도시">서울 🌐</Row>
      <Row label="고객 태그">
        <span className={styles.tagWrap}>
          <Tag label="일반 고객" tone="purple" />
          <Tag label="리뷰 작성자" tone="yellow" />
        </span>
      </Row>
      <button className={styles.more}>더 보기</button>

      <p className={styles.groupLabel}>상담 정보 <span className={styles.caret}>⌄</span></p>
      <Row label="우선순위">높음</Row>
      <Row label="유입 페이지"><a className={styles.link}>https://sadheuk.com</a></Row>
      <Row label="상담 태그">
        <span className={styles.tagWrap}>
          <Tag label="불만" tone="red" />
          <Tag label="반품" tone="yellow" />
          <Tag label="보상처리" tone="purple" />
        </span>
      </Row>
      <Row label="상담 설명">#수동처리완료 #시스템오류</Row>
      <Row label="CSAT">2</Row>
      <Row label="상담 목표">달성</Row>
      <button className={styles.more}>더 보기</button>

      <p className={styles.groupLabel}>이벤트 <span className={styles.caret}>⌄</span></p>
      <ul className={styles.events}>
        <li>
          <span className={styles.eventDot} />
          <div>
            <span className={styles.eventTitle}>PageView 오늘 01:28 PM</span>
            <a className={styles.eventLink}>https://shopdemo.com</a>
          </div>
        </li>
        <li><span className={styles.eventDot} /><span className={styles.eventTitle}>어제 12</span></li>
        <li><span className={styles.eventDot} /><span className={styles.eventTitle}>2026-03-28 12</span></li>
      </ul>
      <button className={styles.more}>더 보기</button>
    </aside>
  );
}

/* ================================================================== */
/*  메인                                                               */
/* ================================================================== */

export default function Dashboard() {
  return (
    <div className={`${styles.page} section`} id="dashboard">
      <p className={styles.eyebrow}>채널웍스</p>
      <h2 className="stitle">
        카톡, 이메일, 게시판, 전화까지 <b>AI</b>로 상담 채널을 하나로 통합하세요
      </h2>
      <p className="slead" style={{ marginBottom: '18px' }}>
        채팅과 동일한 룰, 지식, 액션 구조로 일관성있는 답변을 제공합니다.
      </p>

      <div className={styles.window}>
        <div className={styles.titleBar}>
          <div className={styles.lights}>
            <span style={{ background: "#FF5F57" }} />
            <span style={{ background: "#FEBC2E" }} />
            <span style={{ background: "#28C840" }} />
          </div>
          <div className={styles.workspace}>
            <span className={styles.wsLogo}>🛍</span> Shop Demo
            <span className={styles.wsNav}>‹ ›</span>
          </div>
          <div className={styles.barTabs}>
            <span className={styles.barTabActive}>고객</span>
            <span className={styles.barTab}>팀</span>
            <span className={styles.barTab}>AI CoS</span>
          </div>
          <div className={styles.barRight}>
            <span className={styles.search}>🔍 검색</span>
            <Avatar name="이지현" size={22} />
            <span className={styles.barAvatarExtra} />
          </div>
        </div>

        <div className={styles.workArea}>
          <IconRail />
          <InboxColumn />
          <ListColumn />
          <ThreadColumn />
          <DetailColumn />
        </div>
      </div>
    </div>
  );
}
