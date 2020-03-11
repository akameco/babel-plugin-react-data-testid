import pluginTester from 'babel-plugin-tester'
import plugin from '.'

pluginTester({
  plugin,
  babelOptions: { parserOpts: { plugins: ['jsx'] } },
  snapshot: true,
  tests: [
    {
      title: 'simple Component',
      code: `
        function Div() {
          return <div />
        }
      `,
    },
  ],
})
