/* ================================================================== */
/*  공용                                                               */
/* ================================================================== */

import { pageSectionShellTall } from './sectionLayout'

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

const cx = {
  aiSpark: "text-[15px] text-[#c77dbb]",
  avatar: "inline-flex shrink-0 items-center justify-center rounded-full font-bold leading-none text-white",
  barAvatarExtra: "h-[22px] w-[18px] rounded-[5px] bg-[#c7ccd3]",
  barRight: "flex items-center gap-2",
  barTab: "cursor-pointer rounded-[7px] px-[14px] py-1 text-[13px] text-[#6a6f76]",
  barTabActive:
    "cursor-pointer rounded-[7px] bg-white px-[14px] py-1 text-[13px] font-semibold text-[#1b1c1e] shadow-[0_1px_2px_rgba(0,0,0,0.08)]",
  barTabs: "mx-auto flex gap-1 rounded-[9px] bg-[#ececee] p-[3px]",
  bubbleAgent: "text-sm leading-[1.6] text-[#2b2d31]",
  bubbleCustomer: "max-w-[72%] rounded-[14px] bg-[#f0f1f3] px-[15px] py-[11px] text-sm leading-[1.5]",
  bubbleInternal: "max-w-[80%] rounded-[14px] bg-[#efeafb] px-[15px] py-[11px] text-sm leading-[1.5]",
  cTab: "text-[12.5px] text-[#9aa0a8]",
  cTabActive: "rounded-md bg-[#f0f1f3] px-2 py-[3px] text-[12.5px] font-bold text-[#2b2d31]",
  caret: "text-[11px]",
  chip: "cursor-pointer rounded-2xl border-0 bg-transparent px-[11px] py-[5px] text-[12.5px] text-[#8b9098]",
  chipActive: "cursor-pointer rounded-2xl border-0 bg-[#2b2d31] px-[11px] py-[5px] text-[12.5px] font-semibold text-white",
  chips: "flex gap-1.5 border-b border-[#ededf0] px-[14px] pb-3",
  closeBtn:
    "cursor-pointer rounded-lg border border-[#dcdee2] bg-white px-[11px] py-[5px] text-[12.5px] font-semibold text-[#4a4f57]",
  colTitle: "m-0 text-[17px] font-extrabold",
  composer: "m-[0_16px_16px] rounded-xl border border-[#dcdee2] px-[14px] py-3",
  composerBar: "flex items-center justify-between",
  composerPlaceholder: "m-[0_0_14px] text-sm text-[#adb2b9]",
  composerTabs: "mb-2 flex gap-[14px]",
  composerTools: "flex items-center gap-[14px] text-[15px] text-[#9aa0a8]",
  convActive: "bg-[#eef0f2] hover:bg-[#eef0f2]",
  convAgent: "text-[12.5px] text-[#9aa0a8]",
  convBody: "min-w-0 flex-1",
  convDot: "text-[#c7ccd3]",
  convItem: "flex cursor-pointer gap-[11px] rounded-[10px] px-2.5 py-3 hover:bg-[#f6f7f8]",
  convList: "m-0 flex-1 list-none overflow-y-auto p-1.5",
  convName: "text-sm font-bold",
  convTags: "mt-2 flex gap-[5px]",
  convText: "m-0 overflow-hidden text-ellipsis whitespace-pre-line text-[13px] leading-[1.45] text-[#6a6f76]",
  convTime: "ml-auto text-[11.5px] text-[#b6bbc2]",
  convTop: "mb-[3px] flex items-center gap-[5px]",
  count: "text-xs text-[#adb2b9]",
  customerHead: "flex items-center gap-2 px-0 pb-2.5 pt-1.5 text-sm font-bold",
  detail: "overflow-y-auto border-l border-[#ededf0] px-4 py-[18px]",
  detailHeader: "mb-4 flex items-center justify-between",
  detailIcon: "text-[#b6bbc2]",
  divider: "mx-1 my-3 h-px bg-[#ededf0]",
  dLabel: "min-w-16 shrink-0 text-[#9aa0a8]",
  dRow: "flex items-center gap-3 py-1.5 text-[13px]",
  dValue: "ml-auto flex flex-wrap items-center justify-end gap-[5px] text-right",
  eventDot: "mt-[5px] h-[7px] w-[7px] shrink-0 rounded-full bg-[#c7ccd3]",
  eventLink: "text-xs text-[#3b82f6] no-underline",
  events: "m-0 flex list-none flex-col gap-3 p-0",
  eventTitle: "block font-semibold",
  eyebrow: "m-[0_0_10px] text-center text-[15px] font-bold",
  folderDot: "h-[11px] w-[13px] rounded-sm bg-[#c7ccd3]",
  followAdd: "ml-1 text-[#9aa0a8]",
  followers: "inline-flex items-center gap-[3px]",
  greenDot: "inline-block h-[7px] w-[7px] rounded-full bg-[#22c55e]",
  groupLabel: "m-[16px_0_8px] flex items-center gap-1 px-1 text-[13px] text-[#9aa0a8]",
  inbox: "overflow-y-auto border-r border-[#ededf0] px-3 py-[18px]",
  inboxTitle: "px-1 pb-3",
  inlineUser: "inline-flex items-center gap-[5px]",
  internalChatLabel: "mb-1 text-[11.5px] text-[#a78bd6]",
  internalLabel: "text-[12.5px] text-[#9aa0a8]",
  internalNote: "flex flex-col gap-1 pl-0.5",
  internalText: "pl-[14px] text-[12.5px] text-[#adb2b9]",
  light: "block h-[11px] w-[11px] rounded-full",
  lights: "flex gap-[7px]",
  link: "text-[#3b82f6] no-underline",
  list: "flex flex-col overflow-hidden border-r border-[#ededf0]",
  listHeader: "flex items-center justify-between px-4 pb-3 pt-[18px]",
  listHeaderIcons: "flex gap-3 text-[15px] text-[#9aa0a8]",
  memberPill: "rounded-md bg-[#f0f1f3] px-2 py-0.5 text-[11px] font-semibold text-[#6a6f76]",
  mention: "font-semibold text-[#6e54c8]",
  messages: "flex flex-1 flex-col gap-[14px] overflow-y-auto px-[22px] py-5",
  more: "mt-2 block cursor-pointer border-0 bg-transparent p-1 text-[12.5px] text-[#9aa0a8]",
  msgMeta: "mb-[5px] flex items-center gap-1.5 text-[13px] [&_strong]:font-bold",
  msgRowLeft: "flex items-start gap-2.5",
  msgRowRight: "flex justify-end",
  msgTime: "text-[11.5px] text-[#b6bbc2]",
  navIcon: "w-4 text-center text-sm",
  navIconLine: "inline-flex text-[#8b9098]",
  navLabel: "flex-1",
  navList: "m-0 flex list-none flex-col gap-px p-0",
  navMuted: "text-[#9aa0a8]",
  navRow: "flex cursor-pointer items-center gap-[9px] rounded-lg px-2 py-[7px] text-[13.5px] hover:bg-[#f4f5f6]",
  navRowActive: "bg-[#eef0f2] font-semibold hover:bg-[#eef0f2]",
  page:
    "box-border flex h-auto min-h-screen w-full flex-col justify-center bg-white px-6 py-[clamp(36px,5vh,56px)] text-center font-['Pretendard',-apple-system,BlinkMacSystemFont,'Apple_SD_Gothic_Neo','Malgun_Gothic',system-ui,sans-serif] text-[#1b1c1e]",
  rail: "flex flex-col items-center justify-between border-r border-[#ededf0] bg-[#fafafb] py-3",
  railActive: "!bg-[#ececef] !text-[#2b2d31]",
  railBtn:
    "flex h-[34px] w-[34px] cursor-pointer items-center justify-center rounded-[9px] border-0 bg-transparent text-[#9aa0a8]",
  railTop: "flex flex-col gap-1",
  search: "rounded-lg bg-[#ececee] px-2.5 py-[5px] text-xs text-[#6a6f76]",
  sendBtn: "h-[26px] w-[34px] cursor-pointer rounded-l-[14px] border-0 bg-[#d3d6da] text-white",
  sendCaret:
    "h-[26px] w-[22px] cursor-pointer rounded-r-[14px] border-0 border-l border-[#c2c6cb] bg-[#d3d6da] text-[11px] text-white",
  sendGroup: "flex items-center gap-2.5",
  serviceDot: "h-3.5 w-3.5 rounded-full",
  star: "text-[#c7ccd3]",
  swatch: "h-3.5 w-3.5 rounded",
  tag: "whitespace-nowrap rounded-md px-[7px] py-0.5 text-[11px] font-semibold",
  tagWrap: "flex flex-wrap justify-end gap-[5px]",
  teamPill: "rounded-md bg-[#f0f1f3] px-2 py-0.5 text-xs",
  thread: "flex flex-col overflow-hidden bg-white",
  threadActions: "flex items-center gap-[14px] text-[15px] text-[#9aa0a8]",
  threadHeader: "flex items-center justify-between border-b border-[#ededf0] px-[18px] pb-[14px] pt-1",
  threadTabs: "flex justify-center gap-1 p-2.5",
  threadTitle: "flex items-center gap-2 text-[17px] font-extrabold",
  titleBar: "flex h-[46px] items-center gap-4 border-b border-[#ededf0] bg-[#f6f6f7] px-4",
  toolDivider: "h-4 w-px bg-[#e2e4e7]",
  tTab: "cursor-pointer rounded-lg border-0 bg-transparent px-4 py-[5px] text-[13px] text-[#8b9098]",
  tTabActive: "cursor-pointer rounded-lg border-0 bg-[#f0f1f3] px-4 py-[5px] text-[13px] font-bold text-[#1b1c1e]",
  viewAll: "ml-[42px] self-start cursor-pointer border-0 bg-transparent text-[12.5px] text-[#6a6f76]",
  window:
    "mx-auto w-full overflow-hidden rounded-[14px] border border-[#e6e7ea] bg-white shadow-[0_24px_70px_rgba(30,35,45,0.18)] max-[1100px]:overflow-x-auto",
  workArea: "grid h-[clamp(500px,66vh,700px)] w-full grid-cols-[48px_200px_230px_1fr_250px] bg-white max-[1100px]:min-w-[1100px]",
  workspace: "flex items-center gap-1.5 text-[13px] font-semibold",
  wsLogo: "text-[13px]",
  wsNav: "ml-2 text-sm tracking-[4px] text-[#b6bbc2]",
};

const tagTone = {
  red: "bg-[#fde2e1] text-[#d24b46]",
  green: "bg-[#dcf3e5] text-[#2a8a52]",
  yellow: "bg-[#fbeccb] text-[#b5852a]",
  purple: "bg-[#e9e3fb] text-[#6e54c8]",
  gray: "bg-[#eceef0] text-[#6a6f76]",
} satisfies Record<"red" | "green" | "yellow" | "purple" | "gray", string>;

function Avatar({ name, size = 24 }: { name: string; size?: number }) {
  return (
    <span
      className={cx.avatar}
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
  return <span className={`${cx.tag} ${tagTone[tone]}`}>{label}</span>;
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
    <nav className={cx.rail}>
      <div className={cx.railTop}>
        <button className={`${cx.railBtn} ${cx.railActive}`} aria-label="수신함">
          <Icon d={I.inbox} />
        </button>
        <button className={cx.railBtn} aria-label="연락처">
          <Icon d={I.person} />
        </button>
        <button className={cx.railBtn} aria-label="플로우">
          <Icon d={I.flow} />
        </button>
        <button className={cx.railBtn} aria-label="필터">
          <Icon d={I.funnel} />
        </button>
        <button className={cx.railBtn} aria-label="전화">
          <Icon d={I.phone} />
        </button>
      </div>
      <button className={cx.railBtn} aria-label="도움말">
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
    <aside className={cx.inbox}>
      <h2 className={`${cx.colTitle} ${cx.inboxTitle}`}>수신함</h2>

      <ul className={cx.navList}>
        <li className={cx.navRow}>
          <Avatar name="배지희" size={20} />
          <span className={cx.navLabel}>배지희</span>
          <span className={cx.folderDot} />
          <span className={cx.count}>5</span>
        </li>
        <li className={`${cx.navRow} ${cx.navRowActive}`}>
          <span className={cx.navIcon}>📥</span>
          <span className={cx.navLabel}>전체</span>
          <span className={cx.count}>1k</span>
        </li>
        <li className={cx.navRow}>
          <span className={cx.navIconLine}><Icon d={I.bell} size={16} /></span>
          <span className={cx.navLabel}>안 읽은 메시지</span>
        </li>
        <li className={cx.navRow}>
          <span className={cx.navIconLine}><Icon d={I.star} size={16} /></span>
          <span className={cx.navLabel}>즐겨찾기</span>
        </li>
        <li className={cx.navRow}>
          <span className={cx.navIconLine}><Icon d={I.eye} size={16} /></span>
          <span className={cx.navLabel}>내 세션</span>
        </li>
        <li className={cx.navRow}>
          <span className={cx.navIconLine}><Icon d={I.clock} size={16} /></span>
          <span className={cx.navLabel}>예약 메시지</span>
        </li>
      </ul>

      <div className={cx.divider} />

      <ul className={cx.navList}>
        <li className={cx.navRow}>
          <span className={cx.navIconLine}><Icon d={I.gear} size={16} /></span>
          <span className={cx.navLabel}>고객 ALF</span>
        </li>
      </ul>

      <p className={cx.groupLabel}>대기열 <span className={cx.caret}>⌄</span></p>
      <ul className={cx.navList}>
        {queues.map((q) => (
          <li key={q.label} className={cx.navRow}>
            <span className={cx.swatch} style={{ background: q.color }} />
            <span className={cx.navLabel}>{q.label}</span>
            <span className={cx.count}>{q.count}</span>
          </li>
        ))}
      </ul>

      <p className={cx.groupLabel}>담당자 <span className={cx.caret}>⌄</span></p>
      <ul className={cx.navList}>
        {assignees.map((a) => (
          <li key={a.name} className={cx.navRow}>
            <Avatar name={a.name} size={20} />
            <span className={cx.navLabel}>{a.name}</span>
            <span className={cx.folderDot} />
            <span className={cx.count}>{a.count}</span>
          </li>
        ))}
        <li className={`${cx.navRow} ${cx.navMuted}`}>
          <span className={cx.navIcon}>＋</span>
          <span className={cx.navLabel}>팀 멤버 초대</span>
        </li>
      </ul>

      <p className={cx.groupLabel}>서비스 <span className={cx.caret}>⌄</span></p>
      <ul className={cx.navList}>
        {services.map((s) => (
          <li key={s.label} className={cx.navRow}>
            <span className={cx.serviceDot} style={{ background: s.color }} />
            <span className={cx.navLabel}>{s.label}</span>
            <span className={cx.count}>{s.count}</span>
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
    <section className={cx.list}>
      <div className={cx.listHeader}>
        <h2 className={cx.colTitle}>전체</h2>
        <div className={cx.listHeaderIcons}>
          <span>☑</span>
          <span>⇅</span>
        </div>
      </div>

      <div className={cx.chips}>
        <button className={cx.chipActive}>진행중</button>
        <button className={cx.chip}>보류중</button>
        <button className={cx.chip}>부재중</button>
        <button className={cx.chip}>종료됨</button>
      </div>

      <ul className={cx.convList}>
        {items.map((it, i) => (
          <li key={i} className={`${cx.convItem} ${it.active ? cx.convActive : ""}`}>
            <Avatar name={it.name} size={36} />
            <div className={cx.convBody}>
              <div className={cx.convTop}>
                <strong className={cx.convName}>{it.name}</strong>
                <span className={cx.convDot}>·</span>
                <span className={cx.convAgent}>{it.agent}</span>
                <span className={cx.convTime}>{it.time}</span>
              </div>
              <p className={cx.convText}>{it.text}</p>
              {it.tags.length > 0 && (
                <div className={cx.convTags}>
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
    <section className={cx.thread}>
      <div className={cx.threadTabs}>
        <button className={cx.tTabActive}>고객</button>
        <button className={cx.tTab}>팀</button>
        <button className={cx.tTab}>AI CoS</button>
      </div>

      <div className={cx.threadHeader}>
        <div className={cx.threadTitle}>
          <span className={cx.star}>☆</span>
          <strong>박지은</strong>
        </div>
        <div className={cx.threadActions}>
          <span>෴</span>
          <span>🔗</span>
          <span>⋮</span>
          <span>☾</span>
          <button className={cx.closeBtn}>✓ 종료</button>
        </div>
      </div>

      <div className={cx.messages}>
        <div className={cx.msgRowRight}>
          <div className={cx.bubbleCustomer}>2주 전에 반품 접수했는데 아직도 환불이 안 됐어요.</div>
        </div>

        <div className={cx.internalNote}>
          <span className={cx.internalLabel}>› 내부활동 (3)</span>
          <span className={cx.internalText}>반품 회수 완료, 환불 미처리 — 정산팀 지연</span>
        </div>

        <div className={cx.msgRowLeft}>
          <Avatar name="이지현" size={32} />
          <div>
            <div className={cx.msgMeta}>
              <strong>이지현</strong>
              <span className={cx.msgTime}>● 8:40 PM</span>
            </div>
            <div className={cx.bubbleAgent}>
              안녕하세요, 지은님.<br />
              확인해보니 저희 시스템 오류로 환불 처리가 누락되었습니다.<br />
              정말 죄송합니다. 바로 환불 처리 도와드리겠습니다.
            </div>
          </div>
        </div>

        <div className={cx.msgRowRight}>
          <div className={cx.bubbleCustomer}>2주나 기다렸는데…</div>
        </div>
        <div className={cx.msgRowRight}>
          <div className={cx.bubbleCustomer}>시스템 오류라뇨 😡 전화도 잘 안받으시더니</div>
        </div>

        <div className={cx.internalNote}>
          <span className={cx.internalLabel}>› 내부활동 (8)</span>
        </div>

        <div className={cx.msgRowLeft}>
          <Avatar name="이지현" size={32} />
          <div>
            <div className={cx.internalChatLabel}>내부대화</div>
            <div className={cx.bubbleInternal}>
              <span className={cx.mention}>@배지희</span> 혹시 이 분 적립금 발급 드려도 괜찮을까요?
            </div>
          </div>
        </div>

        <div className={cx.msgRowLeft}>
          <Avatar name="배지희" size={32} />
          <div>
            <div className={cx.internalChatLabel}>내부대화</div>
            <div className={cx.bubbleInternal}>
              <span className={cx.mention}>@이지현</span> 네. 3만원 보상 드리는게 좋을 것 같아요.
            </div>
          </div>
        </div>

        <button className={cx.viewAll}>전체보기</button>

        <div className={cx.msgRowLeft}>
          <Avatar name="이지현" size={32} />
          <div>
            <div className={cx.msgMeta}>
              <strong>이지현</strong>
              <span className={cx.msgTime}>● 8:40 PM</span>
            </div>
            <div className={cx.bubbleAgent}>
              불편을 드려서 진심으로 사과드립니다. 🥹<br />
              환불은 지금 바로 처리되었고, 기다려주신 시간에 대한 사과로<br />
              3만원 적립금도 함께 넣어드렸습니다. 다시 한 번 죄송합니다.
            </div>
          </div>
        </div>
      </div>

      <div className={cx.composer}>
        <div className={cx.composerTabs}>
          <span className={cx.cTabActive}>고객응대</span>
          <span className={cx.cTab}>내부대화</span>
        </div>
        <p className={cx.composerPlaceholder}>고객에게 보낼 메시지를 입력해 주세요.</p>
        <div className={cx.composerBar}>
          <div className={cx.composerTools}>
            <span>＋</span>
            <span>T</span>
            <span>☺</span>
            <span>@</span>
            <span>🗨</span>
            <span className={cx.toolDivider} />
            <span>◫</span>
            <span>↬</span>
          </div>
          <div className={cx.sendGroup}>
            <span className={cx.aiSpark}>✦</span>
            <button className={cx.sendBtn}>▸</button>
            <button className={cx.sendCaret}>⌄</button>
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
    <div className={cx.dRow}>
      <span className={cx.dLabel}>{label}</span>
      <span className={cx.dValue}>{children}</span>
    </div>
  );
}

function DetailColumn() {
  return (
    <aside className={cx.detail}>
      <div className={cx.detailHeader}>
        <h2 className={cx.colTitle}>상세 정보</h2>
        <span className={cx.detailIcon}>▭</span>
      </div>

      <Row label="팀">
        <span className={cx.teamPill}>🌳 CX</span>
      </Row>
      <Row label="담당자">
        <span className={cx.inlineUser}>
          <Avatar name="이지현" size={18} /> 이지현
        </span>
      </Row>
      <Row label="팔로워">
        <span className={cx.followers}>
          <Avatar name="이지현" size={18} />
          <Avatar name="배지희" size={18} />
          <Avatar name="김수현" size={18} />
          <span className={cx.followAdd}>↪</span>
        </span>
      </Row>

      <p className={cx.groupLabel}>고객 정보 <span className={cx.caret}>⌄</span></p>
      <div className={cx.customerHead}>
        <Avatar name="박지은" size={28} />
        <strong>박지은</strong>
        <span className={cx.memberPill}>회원</span>
      </div>
      <Row label="이메일"><span className={cx.greenDot} />a**@gmail.com</Row>
      <Row label="대표 번호"><span className={cx.greenDot} />+82 10-****-1234</Row>
      <Row label="유입 페이지"><a className={cx.link}>https://sadheuk.com</a></Row>
      <Row label="적립금">₩3,400</Row>
      <Row label="도시">서울 🌐</Row>
      <Row label="고객 태그">
        <span className={cx.tagWrap}>
          <Tag label="일반 고객" tone="purple" />
          <Tag label="리뷰 작성자" tone="yellow" />
        </span>
      </Row>
      <button className={cx.more}>더 보기</button>

      <p className={cx.groupLabel}>상담 정보 <span className={cx.caret}>⌄</span></p>
      <Row label="우선순위">높음</Row>
      <Row label="유입 페이지"><a className={cx.link}>https://sadheuk.com</a></Row>
      <Row label="상담 태그">
        <span className={cx.tagWrap}>
          <Tag label="불만" tone="red" />
          <Tag label="반품" tone="yellow" />
          <Tag label="보상처리" tone="purple" />
        </span>
      </Row>
      <Row label="상담 설명">#수동처리완료 #시스템오류</Row>
      <Row label="CSAT">2</Row>
      <Row label="상담 목표">달성</Row>
      <button className={cx.more}>더 보기</button>

      <p className={cx.groupLabel}>이벤트 <span className={cx.caret}>⌄</span></p>
      <ul className={cx.events}>
        <li className="flex items-start gap-[9px] text-[13px]">
          <span className={cx.eventDot} />
          <div>
            <span className={cx.eventTitle}>PageView 오늘 01:28 PM</span>
            <a className={cx.eventLink}>https://shopdemo.com</a>
          </div>
        </li>
        <li className="flex items-start gap-[9px] text-[13px]"><span className={cx.eventDot} /><span className={cx.eventTitle}>어제 12</span></li>
        <li className="flex items-start gap-[9px] text-[13px]"><span className={cx.eventDot} /><span className={cx.eventTitle}>2026-03-28 12</span></li>
      </ul>
      <button className={cx.more}>더 보기</button>
    </aside>
  );
}

/* ================================================================== */
/*  메인                                                               */
/* ================================================================== */

export default function Dashboard() {
  return (
    <section className={pageSectionShellTall} id="dashboard">
    <div className="mx-auto flex w-full max-w-[1400px] flex-col justify-center bg-transparent px-10 py-12 max-[860px]:px-5">
      <p className={cx.eyebrow}>채널웍스</p>
      <h2 className="mx-auto my-3.5 w-full whitespace-nowrap text-center text-4xl font-extrabold leading-tight tracking-[-0.04em] text-[#0f1118] max-[1100px]:whitespace-normal max-[900px]:text-[28px]">
        카톡, 이메일, 게시판, 전화까지 <b>AI</b>로 상담 채널을 하나로 통합하세요
      </h2>
      <p className="mx-auto mb-[18px] w-full max-w-[660px] text-center text-[17px] leading-[1.75] text-[#5b6b8c]">
        채팅과 동일한 룰, 지식, 액션 구조로 일관성있는 답변을 제공합니다.
      </p>

      <div className={cx.window}>
        <div className={cx.titleBar}>
          <div className={cx.lights}>
            <span className={cx.light} style={{ background: "#FF5F57" }} />
            <span className={cx.light} style={{ background: "#FEBC2E" }} />
            <span className={cx.light} style={{ background: "#28C840" }} />
          </div>
          <div className={cx.workspace}>
            <span className={cx.wsLogo}>🛍</span> Shop Demo
            <span className={cx.wsNav}>‹ ›</span>
          </div>
          <div className={cx.barTabs}>
            <span className={cx.barTabActive}>고객</span>
            <span className={cx.barTab}>팀</span>
            <span className={cx.barTab}>AI CoS</span>
          </div>
          <div className={cx.barRight}>
            <span className={cx.search}>🔍 검색</span>
            <Avatar name="이지현" size={22} />
            <span className={cx.barAvatarExtra} />
          </div>
        </div>

        <div className={cx.workArea}>
          <IconRail />
          <InboxColumn />
          <ListColumn />
          <ThreadColumn />
          <DetailColumn />
        </div>
      </div>
    </div>
    </section>
  );
}
