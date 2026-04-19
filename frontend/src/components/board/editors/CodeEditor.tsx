import type { JSX } from "react"

import CodeMirror from "@uiw/react-codemirror"

import { markdown, markdownLanguage } from "@codemirror/lang-markdown"
import { languages } from "@codemirror/language-data"
import { vscodeDark } from "@uiw/codemirror-theme-vscode"

import styles from "./CodeEditor.module.css"

interface CodeEditorProps {
  code: string
  onChange?: (value: string) => void
}

export function CodeEditor({ code, onChange }: CodeEditorProps): JSX.Element {
  return (
    <div className={styles.container}>
      <CodeMirror
        value={code}
        height="400px"
        theme={vscodeDark}
        extensions={[
          markdown({ base: markdownLanguage, codeLanguages: languages }),
        ]}
        onChange={onChange}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
        }}
      />
    </div>
  )
}