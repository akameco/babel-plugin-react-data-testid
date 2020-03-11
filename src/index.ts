/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { PluginObj, NodePath } from '@babel/core'
import * as t from '@babel/types'
// import log from 'babel-log'

function nameForReactComponent(path: NodePath<t.FunctionDeclaration>) {
  if (t.isIdentifier(path.node.id)) {
    return path.node.id
  }
  return { name: 'hoge' }
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default () => {
  const returnStatementVistor = {
    JSXElement(path: NodePath, { name }: { name: string }) {
      const openingElement = path.get('openingElement')
      // log(openingElement)
      // @ts-ignore
      openingElement.node.attributes.push(
        // @ts-ignore
        t.jSXAttribute(t.jSXIdentifier('data-testid'), t.stringLiteral(name))
      )
    },
  }

  return {
    name: 'react-data-testid',
    visitor: {
      'FunctionDeclaration|FunctionExpression|ArrowFunctionExpression': (
        path: NodePath<t.FunctionDeclaration>
      ) => {
        // log(path)
        const { name } = nameForReactComponent(path)
        // console.log(name)
        path.traverse(returnStatementVistor, { name })
      },
    },
  } as PluginObj
}
