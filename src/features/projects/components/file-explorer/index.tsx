import React, { useState } from "react";
import { Id } from "../../../../../convex/_generated/dataModel";


interface TabState {
  openTabs: Id<"files">[];
  activeTabId: Id<"files"> | null;
  previewTabId: Id<"files"> | null;
}

const defaultTabState: TabState = {
  openTabs: [],
  activeTabId: null,
  previewTabId: null,
};

interface EditorStore {
  tabs: Map<Id<"projects">, TabState>;
  getTabState: (projectId: Id<"projects">) => TabState | undefined;
  openFile: (
    projectId: Id<"projects">,
    fileId: Id<"files">,
    options: { pinned: boolean },
  ) => void;
  closeTab: (projectId: Id<"projects">, fileId: Id<"files">) => void;
  closeAllTabs: (projectId: Id<"projects">) => void;
  setActiveTab: (projectId: Id<"projects">, fileId: Id<"files">) => void;
}

export const Index = () => {
  const [tabState, setTabState] = useState({
    tabs: new Map<Id<"projects">, TabState>(),
  });

  const useEditorStore: () => EditorStore = () => ({
    tabs: new Map(),
    getTabState: (projectId) => {
      return tabState.tabs.get(projectId) ?? defaultTabState;
    },

    openFile: (projectId, fileId, pinned) => {
      const tabs = new Map(tabState.tabs);

      const state = tabs.get(projectId) ?? defaultTabState;

      const { openTabs, previewTabId } = state;

      const isOpen = openTabs.includes(fileId);

      // Case 1: opening as preview --- replace existing preview or add new
      if (!isOpen && !pinned) {
        const newTabs = previewTabId
          ? openTabs.map((id) => (id === previewTabId ? fileId : id))
          : [...openTabs, fileId];

        tabs.set(projectId, {
          openTabs: newTabs,
          activeTabId: fileId,
          previewTabId: fileId,
        });

        setTabState({ tabs });
        return;
      }

      //case 2: opening as pinned - add new tab

      if (!isOpen && pinned) {
        tabs.set(projectId, {
          ...state,
          openTabs: [...openTabs, fileId],
          activeTabId: fileId,
        });

        setTabState({ tabs });
        return;
      }

      //case 3: file is already open - just activate (and pin if double-clicked)

      const shouldPin = pinned && previewTabId === fileId;

      tabs.set(projectId, {
        ...state,
        activeTabId: fileId,
        previewTabId: shouldPin ? null : previewTabId,
      });

      setTabState({ tabs });
    },

    closeTab: (projectId, fileId) => {
      const tabs = new Map(tabState.tabs);
      const state = tabs.get(projectId) ?? defaultTabState;
      const { openTabs, activeTabId, previewTabId } = state;
      const tabIndex = openTabs.indexOf(fileId);

      if (tabIndex === -1) {
        return;
      }

      const newTabs = openTabs.filter((id) => id !== fileId);

      let newActiveTabId = activeTabId;

      if (activeTabId === fileId) {
        if (newTabs.length === 0) {
          newActiveTabId = null;
        } else if (tabIndex >= newTabs.length) {
          newActiveTabId = newTabs[newTabs.length - 1];
        } else {
          newActiveTabId = newTabs[tabIndex];
        }
      }

      tabs.set(projectId, {
        openTabs: newTabs,
        activeTabId: newActiveTabId,
        previewTabId: previewTabId === fileId ? null : previewTabId,
      });

      setTabState({ tabs });
    },

    closeAllTabs: (projectId) => {
      const tabs = new Map(tabState.tabs);
      tabs.set(projectId, defaultTabState);
      setTabState({ tabs });
    },

    setActiveTab: (projectId, fileId) => {
      const tabs = new Map(tabState.tabs);
      const state = tabs.get(projectId) ?? defaultTabState;
      tabs.set(projectId, { ...state, activeTabId: fileId });
      setTabState({ tabs });
    },
  });


  return <div>Index</div>;
};

export default Index;
