import type { Heading, Node, Parent, Root } from '../shared/kernel'

export type HeadingMeta = {
  titleText?: string
  hasH1: boolean
  headings: Heading[]
}

function isHeading(node: Node): node is Heading {
  return ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(node.type)
}

function visit<T extends Node | Parent>(
  node: T,
  handler: (node: Heading) => void
) {
  if (isHeading(node)) {
    handler(node)
  }
  if ('children' in node) {
    node.children.forEach((n) => visit(n, handler))
    for (let i = 0, len = node.children.length; i < len; i++) {
      const childNode = node.children[i]
      if (childNode) {
        visit(childNode, handler)
      }
    }
  }
}

function getFlattenedValue(node: Parent): string {
  return node.children
    .map((child) =>
      'children' in child
        ? getFlattenedValue(child)
        : 'text' in child
        ? child.text
        : ''
    )
    .join('')
}

export function getHeaders(tree: Root): {
  headings: Array<{ value: string } & Heading>
  titleText?: string
  hasH1: boolean
} {
  const headingMeta: ReturnType<typeof getHeaders> = {
    hasH1: false,
    headings: [],
  }

  visit(tree, (node) => {
    const heading = {
      ...node,
      value: getFlattenedValue(node),
    }

    if (node.type === 'h1') {
      headingMeta.hasH1 = true
      if (Array.isArray(node.children) && node.children.length === 1) {
        const child = node.children[0]
        if (child?.type === 'text') {
          headingMeta.titleText = child.text
        }
      }
    }

    headingMeta.headings.push(heading)
  })

  return headingMeta
}
