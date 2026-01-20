import { Id } from "../../../../convex/_generated/dataModel";
import { useCallback } from "react";
import { useEditorStore } from "../store/use-editor-store";

//this is an abstaraction over that zustand state we made

export const useEditor = (projectId: Id<"projects">) => {
  const store = useEditorStore();

  const tabState = useEditorStore((state) => state.getTabState(projectId));

  const openFile = useCallback(
    (fileId: Id<"files">, options: { pinned: boolean }) => {
      store.openFile(projectId, fileId, options);
    },
    [store, projectId],
  );

  const closeTab = useCallback(
    (fileId: Id<"files">) => {
      store.closeTab(projectId, fileId);
    },
    [store, projectId],
  );

  const closeAllTab = useCallback(() => {
    store.closeAllTabs(projectId);
  }, [store, projectId]);

  const setActiveTab = useCallback(
    (fileId: Id<"files">) => {
      store.setActiveTab(projectId, fileId);
    },
    [store, projectId],
  );

  return {
    openTabs: tabState?.openTabs,
    activeTabId: tabState?.activeTabId,
    previewTabId: tabState?.previewTabId,
    theWholeTabState: tabState,
    openFile,
    closeTab,
    closeAllTab,
    setActiveTab,
  };
};
