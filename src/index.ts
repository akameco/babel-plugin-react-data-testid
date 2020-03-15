import { PluginObj, NodePath } from '@babel/core'
import * as t from '@babel/types'
// import log from 'babel-log'

function nameForReactComponent(
  path: NodePath<t.FunctionDeclaration>
): t.Identifier | null {
  if (t.isIdentifier(path.node.id)) {
    return path.node.id
  }
  return null
}

export default function plugin(): PluginObj {
  const returnStatementVistor = {
    JSXElement(path: NodePath<t.JSXElement>, { name }: { name: string }) {
      const openingElement = path.get('openingElement')
      openingElement.node.attributes.push(
        t.jsxAttribute(t.jsxIdentifier('data-testid'), t.stringLiteral(name))
      )
    },
  }

  return {
    name: 'react-data-testid',
    visitor: {
      'FunctionDeclaration|FunctionExpression|ArrowFunctionExpression': (
        path: NodePath<t.FunctionDeclaration>
      ) => {
        const identifier = nameForReactComponent(path)
        if (identifier) {
          path.traverse(returnStatementVistor, { name: identifier.name })
        }
      },
    },
  } as PluginObj
}
