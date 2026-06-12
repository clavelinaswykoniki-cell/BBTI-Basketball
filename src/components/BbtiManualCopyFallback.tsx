interface BbtiManualCopyFallbackProps {
  text: string;
  title?: string;
  className?: string;
  tone?: "error" | "neutral";
}

const TONE_CLASS = {
  error: {
    box: "border-red-300/15 bg-red-300/[0.05]",
    title: "text-red-100/70",
  },
  neutral: {
    box: "border-white/10 bg-white/[0.035]",
    title: "text-white/46",
  },
} as const;

export default function BbtiManualCopyFallback({
  text,
  title = "自动复制失败，长按下方文案复制。",
  className = "",
  tone = "error",
}: BbtiManualCopyFallbackProps) {
  if (!text) return null;
  const toneClass = TONE_CLASS[tone];

  return (
    <div className={`rounded-xl border ${toneClass.box} p-3 ${className}`}>
      <p className={`mb-2 text-[11px] font-bold ${toneClass.title}`}>
        {title}
      </p>
      <textarea
        readOnly
        value={text}
        aria-label="手动复制文案"
        className="h-24 w-full resize-none rounded-lg border border-white/10 bg-black/30 p-2 text-[11px] leading-relaxed text-white/65 outline-none"
      />
    </div>
  );
}
