import { StateField, EditorState } from "@codemirror/state";
import { showTooltip, EditorView, Tooltip } from "@codemirror/view";
import { quickEditState, showQuickEditorEffect } from "./quick-edit";

let editorView: EditorView | null = null;

const createTooltipForSelection = (state: EditorState): readonly Tooltip[] => {
  const selection = state.selection.main;

  if (selection.empty) {
    return [];
  }

  const isQuickEditActive = state.field(quickEditState);

  if (isQuickEditActive) {
    return [];
  }

  return [
    {
      pos: selection.to,
      above: false,
      strictSide: false,
      create() {
        const dom = document.createElement("div");
        dom.className =
          "bg-popover text-popover-foreground z-50 rounded-sm border border-input p-2 shadow-md flex gap-2 text-sm";
        const addToChatBtn = document.createElement("button");
        addToChatBtn.type = "button";
        addToChatBtn.textContent = "Add to Chat";
        addToChatBtn.className =
          "font-sans p-1 px-2 text-muted-foreground hover:text-foreground hover:bg-foreground/10 rounded-sm";

        const quickEditBtn = document.createElement("button");
        quickEditBtn.className =
          "font-sans p-1 px-2 text-muted-foreground hover:text-foreground hover:bg-foreground/10 rounded-sm";
        const quickEditBtnText = document.createElement("span");
        quickEditBtnText.textContent = "Quick Edit";

        const quickEditBtnShortcut = document.createElement("span");
        quickEditBtnShortcut.textContent = "(Ctrl + Q)";
        quickEditBtnShortcut.className = "text-sm opacity-60";

        quickEditBtn.appendChild(quickEditBtnText);
        quickEditBtn.appendChild(quickEditBtnShortcut);

        quickEditBtn.onclick = () => {
          if (editorView) {
            editorView.dispatch({
              effects: showQuickEditorEffect.of(true),
            });
          }
        };

        dom.appendChild(addToChatBtn);
        dom.appendChild(quickEditBtn);
        return { dom };
      },
    },
  ];
};

const selectionTooltipField = StateField.define<readonly Tooltip[]>({
  create(state) {
    return createTooltipForSelection(state);
  },

  update(tooltips, transaction) {
    if (transaction.docChanged || transaction.selection) {
      return createTooltipForSelection(transaction.state);
    }
    for (const effect of transaction.effects) {
      if (effect.is(showQuickEditorEffect)) {
        return createTooltipForSelection(transaction.state);
      }
    }
    return tooltips;
  },

  provide(field) {
    return showTooltip.computeN([field], (state) => state.field(field));
  },
});

const captureViewExtension = EditorView.updateListener.of((update) => {
  editorView = update.view;
});

export const selectionTooltip = () => [
  selectionTooltipField,
  captureViewExtension,
];
