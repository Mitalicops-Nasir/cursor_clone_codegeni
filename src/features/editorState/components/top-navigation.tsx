import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import React from "react";
import { Id } from "../../../../convex/_generated/dataModel";
import { useEditor } from "../hooks/use-editor";
import { useFile } from "@/features/projects/hooks/use-files";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { FileIcon } from "@react-symbols/icons/utils";
import { XIcon } from "lucide-react";

const Tab = ({
  projectId,
  fileId,
  isFirst,
  index,
}: {
  projectId: Id<"projects">;
  fileId: Id<"files">;
  isFirst: boolean;
  index: number;
}) => {
  const file = useFile(fileId);

  const { activeTabId, previewTabId, setActiveTab, openFile, closeTab } =
    useEditor(projectId);

  const isActive = activeTabId === fileId;
  const isPreview = previewTabId === fileId;
  const fileName = file?.name ?? "Loading...";
  return (
    <div
      onClick={() => setActiveTab(fileId)}
      onDoubleClick={() => openFile(fileId, { pinned: true })}
      className={cn(
        "flex items-center gap-2 h-[35px] pl-2 pr-1.5 cursor-pointer text-muted-foreground group border-y border-x border-transparent hover:bg-accent/30",
        isActive &&
          "bg-background text-foreground border-x-border border-b-background -mb-px drop-shadow",
        isFirst && "border-l-transparent!",
      )}
    >
      {file === undefined ? (
        <>
          <Spinner className="text-ring" />
        </>
      ) : (
        <FileIcon fileName={fileName} autoAssign className="size-4" />
      )}

      <span className={cn("text-sm whitespace-nowrap", isPreview && "italic")}>
        {fileName}
      </span>

      <button
        onClick={(e) => {
          /* * 🏆 BATTLE TROPHY: The Great Bubbling Bug of 2026 for me.
           * * Why e.stopPropagation()?
           * Without it, the click "bubbles" up to the parent <div>,
           * which immediately calls setActiveTab() and re-opens the file
           * we just tried to close. This kills the bubble at the source.
           * * "Those who do not stop propagation are doomed to re-render it."
           */
          (e.preventDefault(), e.stopPropagation(), closeTab(fileId));
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            (e.preventDefault(), e.stopPropagation(), closeTab(fileId));
          }
        }}
        className={cn(
          "p-0.5 hover:bg-white/10  rounded-sm opacity-0 group-hover:opacity-100",
          isActive && "opacity-100",
        )}
      >
        <XIcon className="size-3.5" />
      </button>
    </div>
  );
};

const TopNavigation = ({ projectId }: { projectId: Id<"projects"> }) => {
  const { openTabs } = useEditor(projectId);

  console.log("openTabs", openTabs);
  return (
    <ScrollArea className="flex-1">
      <nav className="bg-sidebar flex items-center h-8.75 border-b">
        {openTabs?.map((fileId, index) => (
          <Tab
            key={fileId}
            projectId={projectId}
            fileId={fileId}
            isFirst={index === 0}
            index={index}
          />
        ))}
      </nav>

      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default TopNavigation;
