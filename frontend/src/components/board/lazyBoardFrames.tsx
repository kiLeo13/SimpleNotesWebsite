import { LoaderContainer } from "@/components/LoaderContainer"
import { createAsyncComponent } from "@/utils/createAsyncComponent"

export const AsyncTextBoardFrame = createAsyncComponent(
  () => import("./renderers/TextBoardFrame"),
  (module) => module.TextBoardFrame
)

export const AsyncMermaidBoardFrame = createAsyncComponent(
  () => import("./renderers/mermaid/MermaidBoardFrame"),
  (module) => module.MermaidBoardFrame
)

export function BoardFrameLoaderFallback() {
  return <LoaderContainer scale={0.85} loaderColor="#8c7aa8" />
}
