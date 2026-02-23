/** TP: variable with known type escaped to any — should be reported with high confidence */
const x: string = 'hello'
const y = x as any
