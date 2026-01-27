import { useFile, useUpdateFile } from "@/features/projects/hooks/use-files";
import { Id } from "../../../../convex/_generated/dataModel";
import { useEditor } from "../hooks/use-editor";
import FileBreadCrumbs from "./file-bread-crumbs";
import TopNavigation from "./top-navigation";
import Image from "next/image";
import CodeEditor from "./code-editor";
import { useEffect, useRef } from "react";

const DEBOUNCE_MS = 1500;

export const EditorView = ({ projectId }: { projectId: Id<"projects"> }) => {
  const { activeTabId } = useEditor(projectId);

  const activeFile = useFile(activeTabId);

  const isActiveFileBinary = activeFile && activeFile?.storageId;

  const isActiveFileText = activeFile && !activeFile.storageId;

  const updateFile = useUpdateFile();

  //INDUSTRY STANDARD WAY TO HANDLE "AUTO SAVE"
  const timeOutRef = useRef<NodeJS.Timeout | null>(null);

  // clean up pending debounced updates on unmount or file change
  useEffect(() => {
    return () => {
      if (timeOutRef.current) {
        clearTimeout(timeOutRef.current);
      }
    };
  }, [activeTabId]);

  return (
    <div className="h-screen flex flex-col">
      <div className="flex items-center">
        <TopNavigation projectId={projectId} />
      </div>

      {activeTabId && <FileBreadCrumbs projectId={projectId} />}

      <div className="flex-1 min-h-0 h-screen bg-background">
        {!activeFile && (
          <div className="size-full flex items-center justify-center">
            <Image
              src="/logo.svg"
              width={50}
              height={50}
              className="opacity-25"
              alt="logo"
            />
          </div>
        )}

        {isActiveFileText && (
          <CodeEditor
            key={activeFile._id}
            fileName={activeFile.name}
            initialValue={activeFile.content ?? ""}
            onChange={(content: string) => {
              //INDUSTRY STANDARD WAY TO HANDLE "AUTO SAVE"
              if (timeOutRef.current) {
                clearTimeout(timeOutRef.current);
              }

              timeOutRef.current = setTimeout(() => {
                updateFile({
                  id: activeFile._id,
                  newContent: content,
                });
              }, DEBOUNCE_MS);
            }}
          />
        )}

        {isActiveFileBinary && <p>TODO: Implement Binary Preview</p>}
      </div>
    </div>
  );
};
