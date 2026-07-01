import type { Conversation } from "./types";

export const conversations: Conversation[] = [
  {
    id: "park-jieun",
    customer: "박지은",
    assignee: "이지현",
    channel: "채널톡",
    time: "방금",
    preview: "네. 앞으로는 확인 잘 부탁드립니다.",
    tags: ["불만", "반품", "보상처리"],
    avatar: "박",
    selected: true,
  },
  {
    id: "lee-jonghyuk",
    customer: "이종혁",
    assignee: "김수현",
    channel: "이메일",
    time: "방금",
    preview: "배송 문의 드립니다. (김수현: 수동 처리 완료!)",
    tags: ["배송문의"],
    avatar: "이",
  },
  {
    id: "lee-doyoon",
    customer: "이도윤",
    assignee: "배지희",
    channel: "인스타그램",
    time: "2분",
    preview: "아 상품 링크 부탁드려도 될까요?",
    tags: ["교환", "배송안내"],
    avatar: "도",
  },
  {
    id: "jung-harin",
    customer: "정하린",
    assignee: "박지민",
    channel: "카카오톡",
    time: "5분",
    preview: "선물 포장 옵션 추가 가능한가요?",
    tags: ["상품문의"],
    avatar: "정",
  },
  {
    id: "oh-yejin",
    customer: "오예진",
    assignee: "이지현",
    channel: "전화",
    time: "5분",
    preview: "아직 출고 전이면 다른 색상으로 변경 ...",
    tags: ["변경요청"],
    avatar: "오",
  },
];

export const teamMembers = [
  ["배지희", 5, "배"],
  ["이지현", 14, "이"],
  ["한지윤", 22, "한"],
  ["김수현", 8, "김"],
  ["박지민", 16, "민"],
] as const;
