"use client";

import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { STAGES, type Developer, type Stage } from "@/lib/types";
import { StageBadge } from "./StageSelector";

const stageColorMap: Record<Stage, string> = {
  Prospect: "border-slate-600",
  Contacted: "border-blue-600",
  Qualified: "border-yellow-600",
  "In Deal": "border-orange-600",
  Closed: "border-green-600",
};

const stageHeaderBg: Record<Stage, string> = {
  Prospect: "bg-slate-800/50",
  Contacted: "bg-blue-900/30",
  Qualified: "bg-yellow-900/30",
  "In Deal": "bg-orange-900/30",
  Closed: "bg-green-900/30",
};

function formatVolume(cents: number | null): string {
  if (cents === null || cents === undefined) return "";
  const millions = cents / 1_000_000;
  if (millions >= 1) return `$${millions.toFixed(1)}m`;
  const thousands = cents / 1_000;
  return `$${thousands.toFixed(0)}k`;
}

interface KanbanBoardProps {
  developers: Developer[];
  onStageChange: (developerId: number, newStage: Stage) => void;
}

export default function KanbanBoard({ developers, onStageChange }: KanbanBoardProps) {
  const columns: Record<Stage, Developer[]> = {
    Prospect: [],
    Contacted: [],
    Qualified: [],
    "In Deal": [],
    Closed: [],
  };

  for (const dev of developers) {
    const stage = dev.stage as Stage;
    if (columns[stage]) {
      columns[stage].push(dev);
    } else {
      columns["Prospect"].push(dev);
    }
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newStage = result.destination.droppableId as Stage;
    const developerId = parseInt(result.draggableId, 10);

    const dev = developers.find((d) => d.id === developerId);
    if (dev && dev.stage !== newStage) {
      onStageChange(developerId, newStage);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => (
          <div
            key={stage}
            className={`flex-shrink-0 w-72 rounded-xl border ${stageColorMap[stage]} bg-slate-900/50 flex flex-col max-h-[calc(100vh-200px)]`}
          >
            {/* Column Header */}
            <div className={`px-4 py-3 rounded-t-xl ${stageHeaderBg[stage]} border-b ${stageColorMap[stage]}`}>
              <div className="flex items-center justify-between">
                <StageBadge stage={stage} />
                <span className="text-xs font-medium text-slate-400">
                  {columns[stage].length}
                </span>
              </div>
            </div>

            {/* Column Body */}
            <Droppable droppableId={stage}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 overflow-y-auto p-3 space-y-2 min-h-[100px] transition-colors ${
                    snapshot.isDraggingOver ? "bg-slate-800/30" : ""
                  }`}
                >
                  {columns[stage].map((dev, index) => (
                    <Draggable
                      key={dev.id}
                      draggableId={String(dev.id)}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`bg-slate-800 border border-slate-700 rounded-lg p-3 cursor-grab active:cursor-grabbing transition-shadow ${
                            snapshot.isDragging
                              ? "shadow-lg shadow-indigo-500/20 border-indigo-500/50"
                              : "hover:border-slate-600"
                          }`}
                        >
                          <a
                            href={`/developer/${dev.id}`}
                            className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition block mb-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {dev.name}
                          </a>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            {dev.city && dev.state && (
                              <span>{dev.city}, {dev.state}</span>
                            )}
                            {!dev.city && dev.state && (
                              <span>{dev.state}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                            {dev.deals_in_market !== null && (
                              <span>{dev.deals_in_market} deals</span>
                            )}
                            {dev.total_volume_market !== null && (
                              <span>{formatVolume(dev.total_volume_market)}</span>
                            )}
                          </div>
                          {dev.is_corp_llc && (
                            <span className="inline-flex items-center mt-2 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-900/50 text-emerald-300">
                              Corp/LLC
                            </span>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
