export interface CreateNestedComputedOptions<TValue, TParent> {
  getValue: () => TValue | undefined
  getDefault: () => TValue
  getCurrentParent: () => TParent | undefined
  ensureParent: (current: TParent | undefined) => TParent
  updateWithValue: (ensuredParent: TParent, value: TValue) => TParent
  setParent: (parent: TParent) => void
}
