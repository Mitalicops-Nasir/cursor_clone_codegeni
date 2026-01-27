import { useEffect, useMemo, useRef } from "react";

import { EditorView, keymap } from "@codemirror/view";
import { oneDark } from "@codemirror/theme-one-dark";
import { customTheme } from "../extensions/theme";
import { getLanguageExtension } from "../extensions/language-extension";
import { indentWithTab } from "@codemirror/commands";
import { minimap } from "../extensions/minimap";
import { indentationMarkers } from "@replit/codemirror-indentation-markers";
import { customSetup } from "../extensions/custom-setup";
import { suggestion } from "../extensions/suggestion";
import { quickEdit } from "../extensions/quick-edit";
import { selectionTooltip } from "../extensions/selection-tooltip";

interface Props {
  fileName: string;
  onChange: (value: string) => void;
  initialValue?: string;
}

const CodeEditor = ({ fileName, initialValue = "", onChange }: Props) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const languageExtension = useMemo(() => {
    return getLanguageExtension(fileName);
  }, [fileName]);

  const viewRef = useRef<EditorView>(null);

  useEffect(() => {
    if (!editorRef.current) return;
    const view = new EditorView({
      doc: initialValue,
      parent: editorRef.current,
      extensions: [
        languageExtension,
        oneDark,
        customTheme,
        customSetup,
        suggestion(fileName), //THIS IS COMPLEX EXTENSION(ALLOWS FOR AI AUTO COMPLETION)
        quickEdit(fileName), // THIS TOO
        selectionTooltip(), // THIS TOO
        keymap.of([indentWithTab]),
        minimap(),
        indentationMarkers(),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString());
          }
        }),
      ],
    });
    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, [languageExtension]);
  return <div ref={editorRef} className="size-full pl-4 bg-background" />;
};

export default CodeEditor;
