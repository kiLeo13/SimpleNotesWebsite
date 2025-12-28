import type { DOMNode } from "html-react-parser"

import mermaid from "mermaid"
import parse, { attributesToProps } from "html-react-parser"

import { Element, domToReact } from "html-react-parser"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"
import { MdOutlineZoomIn, MdOutlineZoomOut } from "react-icons/md"
import { GrRevert } from "react-icons/gr"
import { toasts } from "@/utils/toastUtils"
import { useEffect, useState, useRef, useMemo } from "react"

import styles from "./MermaidBoardFrame.module.css"

mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  securityLevel: "loose"
})

type MermaidBoardFrameProps = {
  diagram: string
}

export function MermaidBoardFrame({ diagram }: MermaidBoardFrameProps) {
  const [svgString, setSvgString] = useState("")
  const [failed, setFailed] = useState(false)

  const elementIdRef = useRef(`mermaid-diagram-${Math.random().toString(36).slice(2, 11)}`)

  useEffect(() => {
    const renderChart = async () => {
      try {
        setFailed(false)
        const { svg } = await mermaid.render(elementIdRef.current, diagram)
        setSvgString(svg)
      } catch (err) {
        console.error("Mermaid rendering error:", err)
        toasts.error("Failed to render Mermaid diagram.")
        setFailed(true)
      }
    }
    renderChart()
  }, [diagram])

  const parsedContent = useMemo(() => {
    if (!svgString) return null

    return parse(svgString, {
      replace: (domNode: DOMNode) => {
        if (domNode instanceof Element && domNode.name === "svg") {
          // 1. Destructure to separate the bad attributes from the good ones
          // We intentionally discard 'width', 'height', and 'style'
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { width, height, style, ...restAttribs } = domNode.attribs
          const props = attributesToProps(restAttribs)

          return (
            <svg {...props} className={styles.graphSvg}>
              {domToReact(domNode.children as DOMNode[])}
            </svg>
          )
        }
      }
    })
  }, [svgString])

  return (
    <div className={styles.mermaidFrame}>
      {!failed && parsedContent && (
        <TransformWrapper
          initialScale={1}
          minScale={0.2}
          maxScale={20}
          centerOnInit={true}
          limitToBounds
          wheel={{ step: 0.1 }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <div className={styles.controlPanel}>
                <button className={styles.controlButton} onClick={() => zoomIn()}>
                  <MdOutlineZoomIn size={"1.7em"} />
                </button>
                <button className={styles.controlButton} onClick={() => zoomOut()}>
                  <MdOutlineZoomOut size={"1.7em"} />
                </button>
                <button className={styles.controlButton} onClick={() => resetTransform()}>
                  <GrRevert size={"1.7em"} />
                </button>
              </div>

              <TransformComponent
                wrapperStyle={{
                  width: "100%",
                  height: "100%",
                  overflow: "hidden",
                }}
                contentStyle={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                {parsedContent}
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      )}
    </div>
  )
}