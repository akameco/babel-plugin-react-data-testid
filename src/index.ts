interface Opts {
  postfix: string
}

export default (input: string, opts: Partial<Opts> = {}) => {
  if (typeof input !== 'string') {
    throw new TypeError(`Expected a string, got ${typeof input}`)
  }

  return `${input} & ${opts.postfix || 'rainbows'}`
}
