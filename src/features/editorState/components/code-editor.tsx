import React, { useEffect, useMemo, useRef } from "react";

import { EditorView, keymap } from "@codemirror/view";

import { basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { customTheme } from "../extensions/theme";
import { getLanguageExtension } from "../extensions/language-extension";
import { indentWithTab } from "@codemirror/commands";
import { minimap } from "../extensions/minimap";
import { indentationMarkers } from "@replit/codemirror-indentation-markers";
import { customSetup } from "../extensions/custom-setup";

interface Props {
  fileName: string;
  onChange: (value: string) => void;
  initialValue?: string;
}

const CodeEditor = ({ fileName, initialValue = "", onChange }: Props) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const languageExtension = getLanguageExtension(fileName);

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
        keymap.of([indentWithTab]),
        minimap(),
        indentationMarkers(),
        EditorView.updateListener.of((update) =>
          onChange(update.state.doc.toString()),
        ),
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
