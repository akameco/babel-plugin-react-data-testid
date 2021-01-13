import { PluginObj, NodePath, Visitor } from '@babel/core'
import * as t from '@babel/types'
// eslint-disable-next-line import/no-extraneous-dependencies
// import blog from 'babel-log'

type FunctionType =
  | t.FunctionDeclaration
  | t.FunctionExpression
  | t.ArrowFunctionExpression

function nameForReactComponent(
  path: NodePath<FunctionType>
): t.Identifier | null {
  const { parentPath } = path
  if (!t.isArrowFunctionExpression(path.node) && t.isIdentifier(path.node.id)) {
    return path.node.id
  }
  if (t.isVariableDeclarator(parentPath)) {
    // @ts-ignore
    return parentPath.node.id
  }
  return null
}

const DEFAULT_DATA_TESTID = 'data-testid'

function createDataAttribute(name: string, attributeName: string) {
  return t.jsxAttribute(t.jsxIdentifier(attributeName), t.stringLiteral(name))
}

function hasDataAttribute(
  node: t.JSXOpeningElement,
  attributeName: string
): boolean {
  return node.attributes.some(
    (attribute) =>
      t.isJSXAttribute(attribute) &&
      t.isJSXIdentifier(attribute.name, { name: attributeName })
  )
}

function getJSXNodeName(
  node: t.JSXIdentifier | t.JSXNamespacedName | t.JSXMemberExpression,
  prefix?: string
): string {
  if (node.type === 'JSXIdentifier') {
    return `${prefix ?? ''}${node.name}`
  }

  if (node.type === 'JSXNamespacedName') {
    return `${prefix ?? ''}${node.namespace}.${node.name}`
  }

  if (node.type === 'JSXMemberExpression') {
    return `${getJSXNodeName(node.object, prefix)}.${node.property.name}`
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  throw new TypeError(`Unknown node.type: ${(node as any).type}`)
}

type VisitorState = {
  name: string
  attributes: string[]
  ignoredComponentNames: string[]
}

const returnStatementVistor: Visitor<VisitorState> = {
  // topがフラグメントのときはスキップする
  JSXFragment(path) {
    path.skip()
  },
  JSXElement(path, { name, attributes, ignoredComponentNames }) {
    const openingElement = path.get('openingElement')
    const componentName = getJSXNodeName(openingElement.get('name').node)

    // topにあるJSX Elementのみ処理する
    path.skip()

    if (componentName && ignoredComponentNames.includes(componentName)) {
      return
    }

    for (const attribute of attributes) {
      // すでにdata-testidがある場合は処理しない
      if (!hasDataAttribute(openingElement.node, attribute)) {
        const dataAttribute = createDataAttribute(name, attribute)
        // @ts-ignore
        openingElement.node.attributes.unshift(dataAttribute)
      }
    }
  },
}

const functionVisitor: Visitor<VisitorState> = {
  ReturnStatement(path, state) {
    const arg = path.get('argument')
    if (!arg.isIdentifier()) {
      path.traverse(returnStatementVistor, state)
    }
  },
}

type State = {
  opts: {
    attributes?: string[]
    format?: string
    ignore?: string[]
  }
}

export default function plugin(): PluginObj<State> {
  return {
    name: 'react-data-testid',
    visitor: {
      'FunctionExpression|ArrowFunctionExpression|FunctionDeclaration': (
        path: NodePath<FunctionType>,
        {
          opts: {
            attributes = [DEFAULT_DATA_TESTID],
            format = '%s',
            ignore = ['React.Fragment'],
          },
        }: State
      ) => {
        const identifier = nameForReactComponent(path)
        if (!identifier) {
          return
        }

        const attributesReversed = [...attributes].reverse()
        const formattedName = format.replace('%s', identifier.name)

        if (path.isArrowFunctionExpression()) {
          path.traverse(returnStatementVistor, {
            name: formattedName,
            attributes: attributesReversed,
            ignoredComponentNames: ignore,
          })
        } else {
          path.traverse(functionVisitor, {
            name: formattedName,
            attributes: attributesReversed,
            ignoredComponentNames: ignore,
          })
        }
      },
    },
  } as PluginObj<State>
}
