"use client";

import { STAGES, type Stage } from "@/lib/types";

const stageColors: Record<Stage, { bg: string; text: string; ring: string }> = {
  Prospect: {
    bg: "bg-slate-700",
    text: "text-slate-200",
    ring: "ring-slate-500",
  },
  Contacted: {
    bg: "bg-blue-900/60",
    text: "text-blue-200",
    ring: "ring-blue-500",
  },
  Qualified: {
    bg: "bg-yellow-900/60",
    text: "text-yellow-200",
    ring: "ring-yellow-500",
  },
  "In Deal": {
    bg: "bg-orange-900/60",
    text: "text-orange-200",
    ring: "ring-orange-500",
  },
  Closed: {
    bg: "bg-green-900/60",
    text: "text-green-200",
    ring: "ring-green-500",
  },
};

export function StageBadge({ stage }: { stage: Stage }) {
  const colors = stageColors[stage] || stageColors.Prospect;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
    >
      {stage}
    </span>
  );
}

interface StageSelectorProps {
  currentStage: Stage;
  onStageChange: (stage: Stage) => void;
  disabled?: boolean;
}

export default function StageSelector({
  currentStage,
  onStageChange,
  disabled,
}: StageSelectorProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {STAGES.map((stage) => {
        const colors = stageColors[stage];
        const isCurrent = stage === currentStage;
        return (
          <button
            key={stage}
            onClick={() => onStageChange(stage)}
            disabled={disabled || isCurrent}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isCurrent
                ? `${colors.bg} ${colors.text} ring-2 ${colors.ring}`
                : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
            } disabled:cursor-default`}
          >
            {stage}
          </button>
        );
      })}
    </div>
  );
}
