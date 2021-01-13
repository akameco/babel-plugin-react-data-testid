import path from 'path'
import pluginTester from 'babel-plugin-tester'
import plugin from '.'

const test1 = {
  title: 'function Component',
  code: `
function Div() {
  return <div />
}

function Nested() {
  return (
    <div>
      hello
      <div>world</div>
    </div>
  )
}
      `,
}

pluginTester({
  plugin,
  babelOptions: { parserOpts: { plugins: ['jsx'] } },
  snapshot: true,
  tests: [
    test1,
    {
      title: 'arrow function',
      code: `
const Div = () => <div />

const DivBody = () => {
  return <div />
}

const Div2 = () => <Div />
      `,
    },
    {
      title: 'with children',
      code: `
const Div = ({ children }) => <div>{children}</div>

function Div2({ children }) {
  return <div>{children}</div>
}
      `,
    },
    {
      title: 'fragment',
      code: `
import React from 'react'

function Items() {
  return <>
    {items.map((item) => <Item key={item.key} />)}
  </>
}

const Items2 = () => <React.Fragment>hello</React.Fragment>
      `,
    },
    {
      title: 'with data-testid',
      code: `
const Div = () => <div data-testid="hello" />
    `,
    },
    {
      title: 'export default',
      code: `
export default () => {
  return <div>hello</div>
}
      `,
    },
    {
      title: 'jsx spread attribute',
      code: `
const Div = (props) => {
  return <div {...props}>hello</div>
}
      `,
    },
  ],
})

pluginTester({
  title: 'with attributes',
  plugin,
  pluginOptions: {
    attributes: ['data-testid', 'data-cy'],
  },
  babelOptions: { parserOpts: { plugins: ['jsx'] } },
  snapshot: true,
  tests: [
    test1,
    {
      title: 'with data-cy',
      code: `
const Div = () => <div data-cy="hello" />
    `,
    },
  ],
})

pluginTester({
  title: 'with format',
  plugin,
  pluginOptions: {
    format: '_%s',
  },
  babelOptions: { parserOpts: { plugins: ['jsx'] } },
  snapshot: true,
  tests: [test1],
})

pluginTester({
  title: 'with ignored option',
  plugin,
  pluginOptions: {
    ignore: ['React.Fragment', 'MyComponent', 'My.Fancy.Component'],
  },
  babelOptions: { parserOpts: { plugins: ['jsx'] } },
  snapshot: true,
  tests: [
    {
      title: 'ignored',
      code: `
import React from 'react'

const Item1 = () => <>hello</>
const Item2 = () => <React.Fragment>hello</React.Fragment>
const Item3 = () => <MyComponent>hello</MyComponent>
const Item4 = () => <My.Fancy.Component>hello</My.Fancy.Component>
const Item5 = () => <My.Fancy.MyComponent>hello</My.Fancy.MyComponent>
      `,
    },
  ],
})

pluginTester({
  title: 'ignores ignored filenames',
  filename: __filename,
  plugin,
  pluginOptions: {
    ignoreFiles: [/\btest1.js$/u],
  },
  babelOptions: { parserOpts: { plugins: ['jsx'] } },
  snapshot: true,
  tests: [
    {
      title: 'ignored file',
      fixture: path.join(__dirname, '__test-utils__', 'test1.js'),
    },
    {
      title: 'not ignored file',
      fixture: path.join(__dirname, '__test-utils__', 'test2.js'),
    },
  ],
})
