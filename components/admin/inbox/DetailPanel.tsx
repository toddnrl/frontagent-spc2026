import { ChevronDown, PanelRight } from "lucide-react";
import type { Conversation } from "../types";
import { Avatar } from "../ui/Avatar";
import { DetailRows, DetailSection } from "../ui/DetailInfo";

export function DetailPanel({ conversation }: { conversation: Conversation }) {
  return (
    <aside className="h-full overflow-y-auto bg-white px-5 py-6">
      <div className="mb-7 flex items-center justify-between">
        <h2 className="text-2xl font-bold">상세 정보</h2>
        <PanelRight className="h-5 w-5 text-gray-400" />
      </div>

      <DetailRows
        rows={[
          ["팀", "🌳 CX"],
          ["담당자", "👩🏻 이지현"],
          ["팔로워", "배 · 이 · 박"],
        ]}
      />

      <DetailSection title="고객 정보">
        <div className="mb-4 flex items-center gap-3">
          <Avatar label={conversation.avatar} size="lg" />
          <div>
            <div className="font-bold">{conversation.customer}</div>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold">
              회원
            </span>
          </div>
        </div>
        <DetailRows
          rows={[
            ["이메일", "a**@gmail.com"],
            ["대표 번호", "+82 10-****-1234"],
            ["유입 페이지", "https://sadheuk.com"],
            ["적립금", "₩3,400"],
            ["도시", "서울 🌐"],
            ["고객 태그", "일반 고객 · 리뷰 작성자"],
          ]}
        />
      </DetailSection>

      <DetailSection title="상담 정보">
        <DetailRows
          rows={[
            ["우선순위", "높음"],
            ["유입 페이지", "https://sadheuk.com"],
            ["상담 태그", conversation.tags.join(" · ")],
            ["상담 설명", "#수동처리완료 #시스템오류"],
            ["CSAT", "2"],
            ["상담 목표", "달성"],
          ]}
        />
      </DetailSection>

      <DetailSection title="이벤트">
        <div className="space-y-4 text-sm font-medium text-gray-600">
          {["PageView 오늘 01:28 PM", "결제 12", "2026-03-28 12"].map((event) => (
            <div key={event} className="flex gap-2">
              <span className="mt-1.5 h-2 w-2 rounded-full bg-gray-400" />
              <span>{event}</span>
            </div>
          ))}
        </div>
        <button className="mt-4 flex items-center gap-1 text-sm font-bold text-gray-400">
          더보기
          <ChevronDown className="h-4 w-4" />
        </button>
      </DetailSection>
    </aside>
  );
}
