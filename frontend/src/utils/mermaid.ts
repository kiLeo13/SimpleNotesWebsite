import mermaid from "mermaid"

let isInitialized = false

function ensureMermaidInitialized(): void {
  if (isInitialized) return

  mermaid.initialize({
    startOnLoad: false,
    theme: "dark",
    securityLevel: "loose"
  })

  isInitialized = true
}

export async function renderMermaidToSvg(diagram: string): Promise<string> {
  ensureMermaidInitialized()

  const uniqueId = `mermaid-${Math.random().toString(36).substring(2, 9)}`
  const { svg } = await mermaid.render(uniqueId, diagram)

  return svg
}
