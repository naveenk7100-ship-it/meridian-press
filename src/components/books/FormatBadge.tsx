import { BookFormat } from "@/types/book";

interface FormatBadgeProps {
  formats: BookFormat[];
  className?: string;
}

export function FormatBadge({ formats, className }: FormatBadgeProps) {
  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className || ""}`}>
      {formats.map((fmt) => (
        <span
          key={fmt.type}
          className="inline-flex items-center px-1.5 py-0.5 rounded-[2px] text-[10px] font-mono uppercase tracking-wider bg-[#EDE7DC] text-[#4A4D55] border border-[#DDD6C9]"
        >
          {fmt.type}
        </span>
      ))}
      <span className="inline-flex items-center px-1.5 py-0.5 rounded-[2px] text-[10px] font-mono text-[#8C4217] bg-[#F7EFE9] border border-[#EACBB7]">
        DRM-Free
      </span>
    </div>
  );
}
