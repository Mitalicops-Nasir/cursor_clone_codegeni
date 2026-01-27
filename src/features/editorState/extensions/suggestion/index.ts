// COMPLEX STUFF

import { StateEffect, StateField } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  keymap,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "@codemirror/view";
import { fetcher } from "./fetcher";

// stateEffct a way to send messages to update state
const setSuggestionEffect = StateEffect.define<string | null>();

//State field holds our suggestion state in the editor
// create() returns the inital value when the editor loads
// -update() called on every transaction (leystroke, etc) to potentially update the value

const suggestionState = StateField.define<string | null>({
  create() {
    return null; // TOTOD: implement this
  },
  update(value, transaction) {
    //check each effect in this transaction
    // if we find our setSuggetsionEffect, return its new value
    // otherwise, we keep the current value unchanged
    for (const effect of transaction.effects) {
      if (effect.is(setSuggestionEffect)) {
        return effect.value;
      }
    }

    return value;
  },
});

// WidgetType: Creates custom DOM elements to display in the editor.
// toDOM() is called by CodeMirror to create the actual HTML element to render.
class SuggestionWidget extends WidgetType {
  constructor(readonly text: string) {
    super();
  }

  toDOM() {
    const span = document.createElement("span");
    span.textContent = this.text;
    ((span.style.opacity = "0.4"), // Ghost text appearance
      (span.style.pointerEvents = "none")); // Dont interfere with click

    return span;
  }
}

let debounceTimer: number | null = null;
let isWaitingForSuggestion = false;
const DEBOUNCE_DELAY = 300; // milliseconds

let currentAbortController: AbortController | null = null;

// Generate the payload to send to the suggestion API
const generatePayload = (view: EditorView, fileName: string) => {
  const code = view.state.doc.toString();

  if (!code || code.trim().length === 0) {
    return null;
  }

  const cursorPosition = view.state.selection.main.head;
  const currentLine = view.state.doc.lineAt(cursorPosition);

  const cursorInLine = cursorPosition - currentLine.from;

  const previousLines: string[] = [];

  const previousLinesToFetch = Math.min(5, currentLine.number - 1);

  for (let i = previousLinesToFetch; i >= 0; i--) {
    previousLines.push(view.state.doc.line(currentLine.number - i).text);
  }

  const nextLines: string[] = [];

  const totalLines = view.state.doc.lines;
  const linesToFetch = Math.min(5, totalLines - currentLine.number);

  for (let i = 1; i <= linesToFetch; i++) {
    nextLines.push(view.state.doc.line(currentLine.number + i).text);
  }

  return {
    fileName,
    code,
    currentLine: currentLine.text,
    lineNumber: currentLine.number,
    previousLines: previousLines.join("\n"),
    nextLines: nextLines.join("\n"),
    textBeforeCursor: currentLine.text.slice(0, cursorInLine),
    textAfterCursor: currentLine.text.slice(cursorInLine),
  };
};

const createDebouncePlugin = (fileName: string) => {
  return ViewPlugin.fromClass(
    class {
      constructor(view: EditorView) {
        this.triggerSuggestion(view);
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.selectionSet) {
          this.triggerSuggestion(update.view);
        }
      }

      triggerSuggestion(view: EditorView) {
        if (debounceTimer !== null) {
          clearTimeout(debounceTimer);
        }

        if (currentAbortController !== null) {
          currentAbortController.abort();
        }

        isWaitingForSuggestion = true;

        debounceTimer = window.setTimeout(async () => {
          const payload = generatePayload(view, fileName);

          if (!payload) {
            isWaitingForSuggestion = false;

            view.dispatch({
              effects: setSuggestionEffect.of(null),
            });
            return;
          }

          currentAbortController = new AbortController();

          const suggestion = await fetcher(
            payload,
            currentAbortController.signal,
          );

          isWaitingForSuggestion = false;

          view.dispatch({
            effects: setSuggestionEffect.of(suggestion),
          });
        }, DEBOUNCE_DELAY);
      }

      destroy() {
        if (debounceTimer !== null) {
          clearTimeout(debounceTimer);
        }
      }
    },
  );
};

const renderPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = this.build(view);
    }

    update(update: ViewUpdate) {
      // Rebuild decorations if the doc changed, cursor moved or suggestion changed

      const suggestionChanged = update.transactions.some((transaction) => {
        const isTrue = transaction.effects.some((effect) =>
          effect.is(setSuggestionEffect),
        );

        if (isTrue) {
          return true;
        }
      });

      // Rebuild decorations if the doc changed, cursor moved, or suggestion changed
      const shouldRebuild =
        update.docChanged || update.selectionSet || suggestionChanged;

      if (shouldRebuild) {
        this.decorations = this.build(update.view);
      }
    }

    build(view: EditorView) {
      if (isWaitingForSuggestion) {
        return Decoration.none;
      }

      // Get the current suggestion from the state field
      const suggestion = view.state.field(suggestionState);
      if (!suggestion) {
        return Decoration.none;
      }

      // Create a widget decoration to show the cursor position
      const cursor = view.state.selection.main.head;

      return Decoration.set([
        Decoration.widget({
          widget: new SuggestionWidget(suggestion),
          side: 1, // Render after cursor (side: 1), not before (side: -1)
        }).range(cursor),
      ]);
    }
  },

  { decorations: (plugin) => plugin.decorations }, // Tell the code mirror to use our decorations
);

const acceptSuggestionKeymap = keymap.of([
  {
    key: "Tab",
    run: (view: EditorView) => {
      const suggestion = view.state.field(suggestionState);
      if (!suggestion) {
        return false; // No suggestion to accept so let tab do its normal thing
      }

      const cursor = view.state.selection.main.head;

      view.dispatch({
        changes: { from: cursor, insert: suggestion }, // insert suggestion text at cursor

        selection: { anchor: cursor + suggestion.length }, // Move cursor to end

        effects: setSuggestionEffect.of(null),
      });

      return true; // handled
    },
  },
]);

export const suggestion = (fileName: string) => [
  suggestionState, // Our State storage
  createDebouncePlugin(fileName), // Trigger suggestions on typing
  renderPlugin, // Renders the ghost text
  acceptSuggestionKeymap, // Tab to accept
];
