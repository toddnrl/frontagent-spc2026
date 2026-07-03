import { Avatar } from "./Avatar";

export function ActivityDivider({ label }: { label: string }) {
  return (
    <div className="mb-3 mt-4 text-sm font-semibold text-gray-400">
      · {label}
    </div>
  );
}

export function AgentMessage({
  name,
  time,
  text,
}: {
  name: string;
  time: string;
  text: string;
}) {
  return (
    <div className="mb-6 flex gap-3">
      <Avatar label={name[0]} size="lg" />
      <div>
        <div className="mb-1 text-sm font-bold">
          {name}
          <span className="ml-2 font-medium text-gray-400">● {time}</span>
        </div>
        <p className="whitespace-pre-line text-sm font-medium leading-relaxed">
          {text}
        </p>
      </div>
    </div>
  );
}

export function CustomerBubble({ text }: { text: string }) {
  return (
    <div className="mb-3 ml-auto max-w-[55%] rounded-[18px] rounded-tr-[8px] bg-[#ececec] px-5 py-3 text-sm font-semibold">
      {text}
    </div>
  );
}

export function InternalNote({ name, text }: { name: string; text: string }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <Avatar label={name[0]} />
      <div className="rounded-[16px] bg-[#f1eaff] px-5 py-3 text-sm font-semibold text-[#6b4aa0]">
        {text}
      </div>
    </div>
  );
}
