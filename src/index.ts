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

function createDataAttribute(name: string) {
  return t.jsxAttribute(
    t.jsxIdentifier(DEFAULT_DATA_TESTID),
    t.stringLiteral(name)
  )
}

function hasDataAttribute(node: t.JSXOpeningElement): boolean {
  return node.attributes.some(
    attribute =>
      t.isJSXAttribute(attribute) &&
      t.isJSXIdentifier(attribute.name, { name: DEFAULT_DATA_TESTID })
  )
}

const returnStatementVistor: Visitor<{ name: string }> = {
  // topがフラグメントのときはスキップする
  JSXFragment(path) {
    path.skip()
  },
  JSXElement(path, { name }) {
    const openingElement = path.get('openingElement')

    // topにあるJSX Elementのみ処理する
    path.skip()

    // すでにdata-testidがある場合は処理しない
    if (hasDataAttribute(openingElement.node)) {
      return
    }

    openingElement.node.attributes.push(createDataAttribute(name))
  },
}

const functionVisitor: Visitor<{ name: string }> = {
  ReturnStatement(path, state) {
    const arg = path.get('argument')
    if (!arg.isIdentifier()) {
      path.traverse(returnStatementVistor, state)
    }
  },
}

export default function plugin(): PluginObj<{}> {
  return {
    name: 'react-data-testid',
    visitor: {
      'FunctionExpression|ArrowFunctionExpression|FunctionDeclaration': (
        path: NodePath<FunctionType>
      ) => {
        const identifier = nameForReactComponent(path)
        if (!identifier) {
          return
        }

        if (path.isArrowFunctionExpression()) {
          path.traverse(returnStatementVistor, { name: identifier.name })
        } else {
          path.traverse(functionVisitor, { name: identifier.name })
        }
      },
    },
  } as PluginObj<{}>
}
