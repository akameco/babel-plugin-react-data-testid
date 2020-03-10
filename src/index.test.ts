import m from '.'

test('snapshot', () => {
  expect(m('unicorn')).toMatchSnapshot()
})
