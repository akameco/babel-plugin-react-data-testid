import pluginTester from 'babel-plugin-tester'
import plugin from '.'

pluginTester({
  plugin,
  babelOptions: { parserOpts: { plugins: ['jsx'] } },
  snapshot: true,
  tests: [
    {
      title: 'basic Component',
      code: `
        function Div() {
          return <div />
        }
      `,
    },
    {
      title: 'nested Component',
      code: `
        function Nested() {
          return <div>hello</div>
        }
    `,
    },
  ],
})
