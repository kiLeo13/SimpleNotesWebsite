import type { Node } from "unist"

import { visit } from "unist-util-visit"

interface DirectiveNode extends Node {
  type: "textDirective" | "leafDirective" | "containerDirective"
  name: string
  attributes: Record<string, string>
  children: Node[]
  data?: {
    hName?: string
    hProperties?: Record<string, unknown>
  }
}

export function remarkCustomDirectives() {
  return (tree: Node) => {
    visit(tree, (node: Node) => {
      const directiveNode = node as DirectiveNode

      if (
        directiveNode.type === "textDirective" ||
        directiveNode.type === "leafDirective" ||
        directiveNode.type === "containerDirective"
      ) {
        if (directiveNode.name === "note") {
          const data = directiveNode.data || (directiveNode.data = {})
          data.hName = "note-ref"
          data.hProperties = {
            "noteid": directiveNode.attributes.id
          }
        }

        if (directiveNode.name === "tooltip") {
          const data = directiveNode.data || (directiveNode.data = {})
          data.hName = "custom-tooltip"
          data.hProperties = {
            content: directiveNode.attributes.content
          }
        }
      }
    })
  }
}
