export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "참조중" || status === "성공"
      ? "bg-blue-50 text-blue-600"
      : status === "인덱싱중" || status === "확인필요"
        ? "bg-orange-50 text-orange-600"
        : "bg-gray-100 text-gray-500";

  return <span className={`w-fit rounded-full px-3 py-1 text-[12px] font-bold ${tone}`}>{status}</span>;
}
