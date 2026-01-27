// COMPLEX STUFF

import { StateEffect, StateField, EditorState } from "@codemirror/state";
import { showTooltip, EditorView, keymap, Tooltip } from "@codemirror/view";
import { fetcher } from "./fetcher";

// stateEffct a way to send messages to update state
export const showQuickEditorEffect = StateEffect.define<boolean>();

let editorView: EditorView | null = null;
let currentAbortController: AbortController | null = null;

//State field holds our suggestion state in the editor
// create() returns the inital value when the editor loads
// -update() called on every transaction (leystroke, etc) to potentially update the value

export const quickEditState = StateField.define<boolean>({
  create() {
    return false;
  },

  update(value, tr) {
    for (const effect of tr.effects) {
      if (effect.is(showQuickEditorEffect)) {
        return effect.value;
      }
    }
    if (tr.selection) {
      const selection = tr.state.selection.main;

      if (selection.empty) {
        return false;
      }
    }

    return value;
  },
});

const createQuickEditTooltip = (state: EditorState): readonly Tooltip[] => {
  const selection = state.selection.main;

  if (selection.empty) {
    return [];
  }

  const isQuickEditActive = state.field(quickEditState);

  if (!isQuickEditActive) {
    return [];
  }

  return [
    {
      pos: selection.to,
      above: false,
      strictSide: false,
      create() {
        //THIS HOW CODE WAS BEFORE REACT JSX
        const dom = document.createElement("div");
        dom.className = `bg-popover 
        text-popover-foreground z-50 
        rounded-sm border border-input 
        p-2 shadow-md flex flex-col gap-2 text-sm`;

        const form = document.createElement("form");
        form.className = "flex flex-col gap-2";

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Edit selected code";
        input.className =
          "bg-transparent border-none outline-none px-2 py-1 font-sans w-100";
        input.autofocus = true;

        const buttonContainer = document.createElement("div");
        buttonContainer.className = "flex items-center justify-between gap-2";

        const cancelButton = document.createElement("button");
        cancelButton.type = "button";
        cancelButton.textContent = "Cancel";
        cancelButton.className =
          "font-sans p-1 px-2 text-muted-foreground hover:text-foreground hover:bg-foreground/10 rounded-sm";
        cancelButton.onclick = () => {
          if (currentAbortController) {
            (currentAbortController.abort(), (currentAbortController = null));
          }

          if (editorView) {
            editorView.dispatch({
              effects: showQuickEditorEffect.of(false),
            });
          }
        };

        const submitBtn = document.createElement("button");
        submitBtn.type = "submit";
        submitBtn.textContent = "Submit";
        submitBtn.className =
          "font-sans p-1 px-2 text-muted-foreground hover:text-foreground hover:bg-foreground/10 rounded-sm";

        form.onsubmit = async (e) => {
          e.preventDefault();

          if (!editorView) {
            return;
          }

          const trimmedInstructions = input.value.trim();
          if (!trimmedInstructions) {
            return;
          }
          const selection = editorView.state.selection.main;

          const selectedCode = editorView.state.doc.sliceString(
            selection.from,
            selection.to,
          );

          const fullCode = editorView.state.doc.toString();
          submitBtn.disabled = true;
          submitBtn.textContent = "Editing...";

          currentAbortController = new AbortController();

          const editedCode = await fetcher(
            {
              selectedCode,
              fullCode,
              instruction: trimmedInstructions,
            },
            currentAbortController.signal,
          );

          if (editedCode) {
            editorView.dispatch({
              changes: {
                from: selection.from,
                to: selection.to,
                insert: editedCode,
              },
              selection: { anchor: selection.to + editedCode.length },
              effects: showQuickEditorEffect.of(false),
            });
          } else {
            submitBtn.disabled = false;
            submitBtn.textContent = "Submit";
          }

          currentAbortController = null;
        };

        buttonContainer.appendChild(cancelButton);
        buttonContainer.appendChild(submitBtn);

        form.appendChild(input);
        form.appendChild(buttonContainer);

        dom.appendChild(form);

        setTimeout(() => {
          input.focus();
        }, 0);

        return { dom };
      },
    },
  ];
};

const quickEditTooltipField = StateField.define<readonly Tooltip[]>({
  create(state) {
    return createQuickEditTooltip(state);
  },

  update(tooltips, transaction) {
    if (transaction.docChanged || transaction.selection) {
      return createQuickEditTooltip(transaction.state);
    }

    for (const effect of transaction.effects) {
      if (effect.is(showQuickEditorEffect)) {
        return createQuickEditTooltip(transaction.state);
      }
    }

    return tooltips;
  },

  provide: (field) =>
    showTooltip.computeN([field], (state) => state.field(field)),
});

const quickEditKeymap = keymap.of([
  {
    key: "B",
    run: (view) => {
      const selection = view.state.selection.main;
      if (selection.empty) {
        return false;
      }

      view.dispatch({
        effects: showQuickEditorEffect.of(true),
      });
      return true;
    },
  },
]);

const captureViewExtension = EditorView.updateListener.of((update) => {
  editorView = update.view
})

export const quickEdit = (fileName: string) => [
  quickEditState, // Our State storage
  quickEditTooltipField,
  quickEditKeymap,
  captureViewExtension,
];
