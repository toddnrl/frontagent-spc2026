import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  Folder,
  FolderPlus,
  GitBranch,
  Globe2,
  ListChecks,
  MessageSquareText,
  Plus,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { SectionCard } from "./SectionCard";

type KnowledgeItem = {
  id: string;
  source: string;
  title: string;
  icon: typeof FileText;
  resolutionRate: number;
  references: number;
};

type KnowledgeFolder = {
  id: string;
  name: string;
  items: KnowledgeItem[];
};

type RuleItem = {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
};

const evaluationRows = [
  {
    label: "답변 정확도",
    value: "98.4%",
    detail: "문서 근거 일치",
    tone: "text-blue-600 bg-blue-50",
  },
  {
    label: "확인 절차 준수",
    value: "99.1%",
    detail: "문자 발송 전 동의",
    tone: "text-green-600 bg-green-50",
  },
  {
    label: "상담원 전환",
    value: "2.1%",
    detail: "복잡 문의 분리",
    tone: "text-gray-700 bg-gray-100",
  },
];

const reviewQueue = [
  {
    title: "예약 변경 후 안내 문자 발송",
    status: "검토 필요",
    text: "고객에게 문자 발송 동의를 다시 확인하도록 규칙 보강",
  },
  {
    title: "환불 규정 답변 근거 부족",
    status: "지식 업데이트",
    text: "프리미엄 요금제 예외 조항을 FAQ 문서에 연결",
  },
  {
    title: "클레임성 문의 감지",
    status: "자동 전환",
    text: "감정 키워드 포함 시 상담원 연결 태스크 생성",
  },
];

const knowledgeTemplates: Omit<KnowledgeItem, "id">[] = [
  {
    source: "문서",
    title: "진료 전 안내 매뉴얼",
    icon: FileText,
    resolutionRate: 94,
    references: 128,
  },
  {
    source: "웹사이트",
    title: "가격 안내 페이지",
    icon: Globe2,
    resolutionRate: 91,
    references: 86,
  },
  {
    source: "엑셀",
    title: "지점별 운영 시간표",
    icon: FileSpreadsheet,
    resolutionRate: 89,
    references: 64,
  },
  {
    source: "PDF",
    title: "환불 및 취소 규정",
    icon: FileText,
    resolutionRate: 97,
    references: 214,
  },
];

const initialKnowledgeFolders: KnowledgeFolder[] = [
  {
    id: "policy",
    name: "운영 정책",
    items: [
      {
        id: "refund-policy",
        source: "PDF",
        title: "환불 및 취소 규정",
        icon: FileText,
        resolutionRate: 97,
        references: 214,
      },
      {
        id: "pricing-page",
        source: "웹사이트",
        title: "가격 안내 페이지",
        icon: Globe2,
        resolutionRate: 91,
        references: 86,
      },
    ],
  },
  {
    id: "reservation",
    name: "예약 응대",
    items: [
      {
        id: "clinic-hours",
        source: "엑셀",
        title: "지점별 운영 시간표",
        icon: FileSpreadsheet,
        resolutionRate: 89,
        references: 64,
      },
    ],
  },
];

const initialRules: RuleItem[] = [
  {
    id: "sms-consent",
    title: "문자 발송 전 고객 동의 확인",
    description: "안내 문자는 고객이 동의한 경우에만 발송합니다.",
    enabled: true,
  },
  {
    id: "handoff-claim",
    title: "클레임 감지 시 상담원 연결",
    description: "불만, 환불, 항의 키워드가 포함되면 상담원에게 전환합니다.",
    enabled: true,
  },
  {
    id: "privacy-limit",
    title: "민감정보 답변 제한",
    description: "주민번호, 결제정보 등 민감정보는 저장하거나 반복 안내하지 않습니다.",
    enabled: false,
  },
];

export function OperationsControl() {
  const [knowledgeFolders, setKnowledgeFolders] = useState(
    initialKnowledgeFolders,
  );
  const [selectedFolderId, setSelectedFolderId] = useState(
    initialKnowledgeFolders[0].id,
  );
  const [rules, setRules] = useState(initialRules);
  const [createdFolderCount, setCreatedFolderCount] = useState(1);
  const [addedKnowledgeCount, setAddedKnowledgeCount] = useState(0);
  const selectedFolder = useMemo(
    () =>
      knowledgeFolders.find((folder) => folder.id === selectedFolderId) ??
      knowledgeFolders[0],
    [knowledgeFolders, selectedFolderId],
  );
  const totalKnowledgeCount = knowledgeFolders.reduce(
    (total, folder) => total + folder.items.length,
    0,
  );
  const averageResolutionRate = Math.round(
    knowledgeFolders.reduce(
      (total, folder) =>
        total +
        folder.items.reduce((itemTotal, item) => itemTotal + item.resolutionRate, 0),
      0,
    ) / Math.max(totalKnowledgeCount, 1),
  );
  const totalReferences = knowledgeFolders.reduce(
    (total, folder) =>
      total + folder.items.reduce((itemTotal, item) => itemTotal + item.references, 0),
    0,
  );

  const createKnowledgeFolder = () => {
    const nextCount = createdFolderCount + 1;
    const nextFolder = {
      id: `custom-${nextCount}`,
      name: `신규 지식 폴더 ${nextCount}`,
      items: [],
    };

    setKnowledgeFolders((folders) => [...folders, nextFolder]);
    setSelectedFolderId(nextFolder.id);
    setCreatedFolderCount(nextCount);
  };

  const addKnowledgeItem = () => {
    const template =
      knowledgeTemplates[addedKnowledgeCount % knowledgeTemplates.length];
    const nextItem = {
      ...template,
      id: `${selectedFolderId}-${Date.now()}`,
      references: template.references + addedKnowledgeCount * 7,
      resolutionRate: Math.min(template.resolutionRate + (addedKnowledgeCount % 3), 99),
    };

    setKnowledgeFolders((folders) =>
      folders.map((folder) =>
        folder.id === selectedFolderId
          ? { ...folder, items: [nextItem, ...folder.items] }
          : folder,
      ),
    );
    setAddedKnowledgeCount((count) => count + 1);
  };

  const toggleRule = (ruleId: string) => {
    setRules((currentRules) =>
      currentRules.map((rule) =>
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule,
      ),
    );
  };

  const addRule = () => {
    const nextRule = {
      id: `custom-rule-${rules.length + 1}`,
      title: "반복 문의는 지식 문서 먼저 참조",
      description: "같은 질문이 반복되면 상담원 연결 전에 최신 지식 문서를 우선 검색합니다.",
      enabled: true,
    };

    setRules((currentRules) => [nextRule, ...currentRules]);
  };

  return (
    <section className="bg-white py-16 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-20">
          <div className="mb-4 text-[13px] font-bold text-blue-600">
            운영 품질 관리
          </div>
          <h2 className="mb-4 text-[28px] font-bold tracking-tight text-gray-900 sm:mb-5 sm:text-[40px]">
            AI가 일한 결과를 검토하고
            <br />
            운영 기준을 계속 개선합니다
          </h2>
          <p className="text-[15px] font-medium leading-relaxed text-gray-500 sm:text-[17px]">
            상담 결과, 태스크 수행, 지식 근거, 규칙 준수 여부를 한 화면에서
            확인하고 실제 운영 정책으로 반영합니다.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          <SectionCard
            size="section"
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[16px] bg-blue-50 text-blue-500">
                  <ClipboardCheck className="h-6 w-6" />
                </div>
                <h3 className="text-[22px] font-bold text-gray-900">
                  평가 및 개선 대시보드
                </h3>
                <p className="mt-2 max-w-xl text-[15px] font-medium leading-relaxed text-gray-500">
                  실제 통화와 채팅 결과를 기준으로 AI 응대 품질을 점수화하고,
                  개선이 필요한 항목만 운영자가 검토합니다.
                </p>
              </div>
              <div className="flex w-fit items-center gap-2 rounded-full bg-gray-50 px-3 py-1.5 text-[12px] font-extrabold text-gray-600">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                오늘 237건 분석
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {evaluationRows.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[20px] border border-gray-100 bg-[#f9fafb] p-5"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-[13px] font-bold text-gray-500">
                      {item.label}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${item.tone}`}>
                      정상
                    </span>
                  </div>
                  <div className="text-[26px] font-extrabold text-gray-900">
                    {item.value}
                  </div>
                  <div className="mt-1 text-[12px] font-bold text-gray-400">
                    {item.detail}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[24px] border border-gray-100 bg-white p-5">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[14px] font-extrabold text-gray-900">
                  <GitBranch className="h-4 w-4 text-blue-500" />
                  개선 반영 흐름
                </div>
                <span className="text-[12px] font-bold text-gray-400">
                  자동 기록
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-4">
                {["대화 수집", "품질 평가", "개선 태스크", "규칙 반영"].map(
                  (step, index) => (
                    <div key={step} className="relative rounded-[16px] bg-[#f9fafb] p-4">
                      <div className="mb-3 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[12px] font-extrabold text-blue-500 shadow-sm">
                        {index + 1}
                      </div>
                      <div className="text-[13px] font-extrabold text-gray-800">
                        {step}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </SectionCard>

          <SectionCard
            className="lg:col-span-5"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-[16px] bg-purple-50 text-purple-500">
                  <MessageSquareText className="h-6 w-6" />
                </div>
                <h3 className="text-[20px] font-bold text-gray-900">
                  운영자 검토 큐
                </h3>
                <p className="mt-1 text-[13px] font-bold text-gray-400">
                  개선이 필요한 대화만 모아봅니다
                </p>
              </div>
              <div className="rounded-full bg-red-50 px-3 py-1.5 text-[12px] font-extrabold text-red-500">
                3건 대기
              </div>
            </div>

            <div className="space-y-3">
              {reviewQueue.map((item, index) => (
                <div
                  key={item.title}
                  className="rounded-[20px] border border-gray-100 bg-[#f9fafb] p-5"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[12px] font-extrabold text-gray-500 shadow-sm">
                        {index + 1}
                      </div>
                      <div className="truncate text-[14px] font-extrabold text-gray-900">
                        {item.title}
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-extrabold text-blue-500 shadow-sm">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-[13px] font-medium leading-relaxed text-gray-500">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-[18px] border border-blue-100 bg-blue-50/70 p-4">
              <div className="mb-1 flex items-center gap-2 text-[13px] font-extrabold text-blue-700">
                <AlertTriangle className="h-4 w-4" />
                자동 개선 제안
              </div>
              <p className="text-[13px] font-medium leading-relaxed text-blue-700/80">
                “문자도 보내드릴까요?” 질문 후 고객 확인을 받은 경우에만 발송
                태스크를 실행하도록 규칙을 보강합니다.
              </p>
            </div>
          </SectionCard>
        </div>

        <div className="mt-6 space-y-6">
          <TaskAssetCard />
          <KnowledgeManager
            folders={knowledgeFolders}
            selectedFolderId={selectedFolderId}
            selectedFolder={selectedFolder}
            totalKnowledgeCount={totalKnowledgeCount}
            averageResolutionRate={averageResolutionRate}
            totalReferences={totalReferences}
            onSelectFolder={setSelectedFolderId}
            onCreateFolder={createKnowledgeFolder}
            onAddKnowledge={addKnowledgeItem}
          />
          <RulesManager rules={rules} onToggleRule={toggleRule} onAddRule={addRule} />
        </div>
      </div>
    </section>
  );
}

function TaskAssetCard() {
  return (
    <SectionCard
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.45 }}
      className="flex flex-col"
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-blue-50 text-blue-500">
            <ListChecks className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-[19px] font-bold text-gray-900">태스크</h3>
            <p className="mt-0.5 text-[12px] font-bold text-gray-400">
              상담 중 실행할 업무 순서
            </p>
          </div>
        </div>
        <div className="rounded-full bg-blue-50 px-3 py-1.5 text-[12px] font-extrabold text-blue-600">
          3개 자동 실행
        </div>
      </div>

      <div className="space-y-2.5">
        {[
          ["예약 확인", "캘린더에서 기존 예약과 가능 시간을 조회합니다.", "완료"],
          ["고객 동의 확인", "문자 발송 전 고객에게 먼저 확인합니다.", "진행"],
          ["CRM 요약 저장", "대화 요약과 처리 결과를 고객 기록에 남깁니다.", "대기"],
        ].map(([item, description, status]) => (
          <div
            key={item}
            className="flex flex-col gap-3 rounded-[16px] bg-[#f9fafb] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 shrink-0 text-gray-400" />
              <div className="min-w-0">
                <div className="truncate text-[13px] font-extrabold text-gray-800">
                  {item}
                </div>
                <div className="truncate text-[12px] font-medium text-gray-400">
                  {description}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[12px] font-extrabold text-blue-500">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {status}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-2 rounded-[16px] border border-gray-100 bg-white px-4 py-3 text-[13px] font-bold text-gray-500">
        <FileCheck2 className="h-4 w-4 text-gray-400" />
        변경 내역 자동 저장
      </div>
    </SectionCard>
  );
}

function KnowledgeManager({
  folders,
  selectedFolderId,
  selectedFolder,
  totalKnowledgeCount,
  averageResolutionRate,
  totalReferences,
  onSelectFolder,
  onCreateFolder,
  onAddKnowledge,
}: {
  folders: KnowledgeFolder[];
  selectedFolderId: string;
  selectedFolder: KnowledgeFolder;
  totalKnowledgeCount: number;
  averageResolutionRate: number;
  totalReferences: number;
  onSelectFolder: (folderId: string) => void;
  onCreateFolder: () => void;
  onAddKnowledge: () => void;
}) {
  return (
    <SectionCard
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.45, delay: 0.05 }}
      className="flex flex-col"
    >
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-blue-50 text-blue-500">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-[19px] font-bold text-gray-900">지식</h3>
            <p className="mt-0.5 text-[12px] font-bold text-gray-400">
              폴더, 문서, 웹사이트, 엑셀, PDF 관리
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onCreateFolder}
            className="flex items-center gap-1.5 rounded-[12px] bg-gray-100 px-3 py-2 text-[12px] font-extrabold text-gray-700"
          >
            <FolderPlus className="h-4 w-4" />
            폴더 만들기
          </button>
          <button
            type="button"
            onClick={onAddKnowledge}
            className="flex items-center gap-1.5 rounded-[12px] bg-blue-500 px-3 py-2 text-[12px] font-extrabold text-white"
          >
            <Plus className="h-4 w-4" />
            지식 추가
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-[24px] border border-gray-100 bg-[#f9fafb] p-4 sm:p-5">
          <div className="mb-4 grid grid-cols-3 gap-2">
            <KnowledgeMetric label="지식 수" value={`${totalKnowledgeCount}개`} />
            <KnowledgeMetric label="해결율" value={`${averageResolutionRate}%`} />
            <KnowledgeMetric label="참조횟수" value={`${totalReferences}회`} />
          </div>

          <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
            {folders.map((folder) => {
              const selected = folder.id === selectedFolderId;

              return (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => onSelectFolder(folder.id)}
                  className={`flex shrink-0 items-center gap-2 rounded-[14px] px-4 py-3 text-[13px] font-extrabold ${
                    selected
                      ? "bg-white text-blue-600 shadow-sm"
                      : "bg-transparent text-gray-500"
                  }`}
                >
                  <Folder className="h-4 w-4" />
                  {folder.name}
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-400">
                    {folder.items.length}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mb-3 flex items-center justify-between">
            <div className="text-[13px] font-extrabold text-gray-900">
              {selectedFolder.name} 지식
            </div>
            <div className="text-[12px] font-bold text-gray-400">
              문서 / 웹사이트 / 엑셀 / PDF
            </div>
          </div>

          <div className="space-y-2.5">
            {selectedFolder.items.length === 0 ? (
              <div className="flex h-[286px] flex-col items-center justify-center rounded-[18px] border border-dashed border-gray-200 bg-white p-6 text-center">
                <FolderPlus className="mb-3 h-6 w-6 text-gray-300" />
                <div className="text-[14px] font-extrabold text-gray-700">
                  아직 지식이 없습니다
                </div>
                <p className="mt-1 text-[13px] font-medium text-gray-400">
                  지식 추가를 누르면 문서, 웹사이트, 엑셀, PDF가 순서대로 추가됩니다.
                </p>
              </div>
            ) : (
              selectedFolder.items.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.id}
                    className="grid gap-3 rounded-[16px] border border-gray-100 bg-white p-3 sm:grid-cols-[minmax(0,1fr)_74px_74px] sm:items-center"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-blue-50 text-blue-500">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-[14px] font-extrabold text-gray-900">
                          {item.title}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-[12px] font-bold text-gray-400">
                          <span>{item.source}</span>
                          <span className="h-1 w-1 rounded-full bg-gray-300" />
                          <span>활성</span>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-[12px] bg-[#f9fafb] px-3 py-2 sm:text-center">
                      <div className="text-[10px] font-bold text-gray-400">
                        해결율
                      </div>
                      <div className="text-[14px] font-extrabold text-gray-900">
                        {item.resolutionRate}%
                      </div>
                    </div>
                    <div className="rounded-[12px] bg-[#f9fafb] px-3 py-2 sm:text-center">
                      <div className="text-[10px] font-bold text-gray-400">
                        참조
                      </div>
                      <div className="text-[14px] font-extrabold text-gray-900">
                        {item.references}회
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-[24px] border border-gray-100 bg-[#f9fafb] p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-[13px] font-extrabold text-gray-900">
                지식 적용 전후 비교
              </div>
              <div className="mt-1 text-[12px] font-bold text-gray-400">
                같은 질문에 대한 답변 품질 변화
              </div>
            </div>
            <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-extrabold text-blue-500 shadow-sm">
              실시간 미리보기
            </span>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <KnowledgeChatPreview
              title="지식 넣기 전"
              status="근거 부족"
              accent="gray"
              answer="정확한 환불 규정은 확인이 필요합니다. 상담원이 확인 후 안내드리겠습니다."
              resolutionRate="42%"
              references="0회"
            />
            <KnowledgeChatPreview
              title="지식 넣은 후"
              status="문서 근거 답변"
              accent="blue"
              answer="[환불 및 취소 규정] 기준으로, 예약 24시간 전까지는 수수료 없이 변경 가능하며 당일 취소는 정책에 따라 처리됩니다. 문자로 규정 링크도 보내드릴까요?"
              resolutionRate={`${averageResolutionRate}%`}
              references={`${totalReferences}회`}
            />
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function KnowledgeChatPreview({
  title,
  status,
  accent,
  answer,
  resolutionRate,
  references,
}: {
  title: string;
  status: string;
  accent: "gray" | "blue";
  answer: string;
  resolutionRate: string;
  references: string;
}) {
  const isBlue = accent === "blue";

  return (
    <div className="rounded-[20px] border border-gray-100 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-[13px] font-extrabold text-gray-900">{title}</div>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${
            isBlue ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500"
          }`}
        >
          {status}
        </span>
      </div>

      <div className="space-y-3">
        <div className="ml-auto max-w-[82%] rounded-[16px] rounded-br-[4px] bg-blue-500 px-4 py-3 text-[13px] font-bold leading-relaxed text-white">
          예약 취소하면 환불 규정이 어떻게 되나요?
        </div>
        <div
          className={`max-w-[90%] rounded-[16px] rounded-bl-[4px] px-4 py-3 text-[13px] font-bold leading-relaxed ${
            isBlue
              ? "bg-blue-50 text-blue-700"
              : "bg-[#f9fafb] text-gray-500"
          }`}
        >
          {answer}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-[12px] bg-[#f9fafb] px-3 py-2">
          <div className="text-[10px] font-bold text-gray-400">해결율</div>
          <div className="text-[14px] font-extrabold text-gray-900">
            {resolutionRate}
          </div>
        </div>
        <div className="rounded-[12px] bg-[#f9fafb] px-3 py-2">
          <div className="text-[10px] font-bold text-gray-400">참조횟수</div>
          <div className="text-[14px] font-extrabold text-gray-900">
            {references}
          </div>
        </div>
      </div>
    </div>
  );
}

function KnowledgeMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] bg-[#f9fafb] p-3">
      <div className="text-[11px] font-bold text-gray-400">{label}</div>
      <div className="mt-1 text-[16px] font-extrabold text-gray-900">
        {value}
      </div>
    </div>
  );
}

function RulesManager({
  rules,
  onToggleRule,
  onAddRule,
}: {
  rules: RuleItem[];
  onToggleRule: (ruleId: string) => void;
  onAddRule: () => void;
}) {
  const enabledCount = rules.filter((rule) => rule.enabled).length;

  return (
    <SectionCard
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.45, delay: 0.1 }}
      className="flex flex-col"
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-blue-50 text-blue-500">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-[19px] font-bold text-gray-900">규칙</h3>
            <p className="mt-0.5 text-[12px] font-bold text-gray-400">
              {enabledCount}개 활성화
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onAddRule}
          className="flex items-center gap-1.5 rounded-[12px] bg-blue-500 px-3 py-2 text-[12px] font-extrabold text-white"
        >
          <Plus className="h-4 w-4" />
          규칙 추가
        </button>
      </div>

      <div className="space-y-3">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="grid gap-3 rounded-[18px] border border-gray-100 bg-[#f9fafb] p-4 lg:grid-cols-[minmax(0,1fr)_92px_52px] lg:items-center"
          >
            <div className="min-w-0">
              <div className="text-[14px] font-extrabold text-gray-900">
                {rule.title}
              </div>
              <p className="mt-1 text-[12px] font-medium leading-relaxed text-gray-500">
                {rule.description}
              </p>
            </div>
            <div className="flex lg:justify-center">
              <div
                className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-extrabold ${
                  rule.enabled
                    ? "bg-blue-50 text-blue-600"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {rule.enabled ? "적용 중" : "비활성"}
              </div>
            </div>
            <div className="flex lg:justify-end">
              <button
                type="button"
                onClick={() => onToggleRule(rule.id)}
                className={`relative h-7 w-12 shrink-0 rounded-full p-0.5 transition-colors ${
                  rule.enabled ? "bg-blue-500" : "bg-gray-200"
                }`}
                aria-label={`${rule.title} ${rule.enabled ? "끄기" : "켜기"}`}
              >
                <span
                  className={`block h-6 w-6 rounded-full bg-white transition-transform ${
                    rule.enabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
