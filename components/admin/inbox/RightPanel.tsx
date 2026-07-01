import type { Conversation } from "../types";
import { DetailPanel } from "./DetailPanel";

export function RightPanel({ conversation }: { conversation: Conversation }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-[20px] bg-white">
      <DetailPanel conversation={conversation} />
    </section>
  );
}
