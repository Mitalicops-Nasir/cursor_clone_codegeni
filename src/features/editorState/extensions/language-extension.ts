import { Extension } from "@codemirror/state";

import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { python } from "@codemirror/lang-python";
import { markdown } from "@codemirror/lang-markdown";
import { json } from "@codemirror/lang-json";

export const getLanguageExtension = (fileName: string): Extension => {
  const ext = fileName.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "js":
      return javascript();
    case "ts":
      return javascript({ typescript: true });
    case "jsx":
      return javascript({ jsx: true });
    case "tsx":
      return javascript({ typescript: true, jsx: true });
    case "html":
      return html();
    case "css":
      return css();
    case "py":
      return python();
    case "md":
      return markdown();
    case "json":
      return json();
    default:
      return [];
  }
};
