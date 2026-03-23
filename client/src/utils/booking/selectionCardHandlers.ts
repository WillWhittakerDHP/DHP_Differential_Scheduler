export function updateNestedChildSelections(params: {
  current: readonly string[]
  childId: string
  selected: boolean
}): string[] {
  return params.selected
    ? params.current.includes(params.childId)
      ? [...params.current]
      : [...params.current, params.childId]
    : params.current.filter((id) => id !== params.childId)
}

export function isNestedComponentsClick(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null
  return !!element?.closest?.('.nested-components')
}


