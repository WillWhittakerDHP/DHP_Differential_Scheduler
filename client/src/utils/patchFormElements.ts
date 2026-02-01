
import { AUTCOMPLETE_OFF } from './autocomplete'

export function patchFormElements(formElement: HTMLFormElement): void {
  try {
    formElement.setAttribute('autocomplete', AUTCOMPLETE_OFF)
    
    const allFormControls = formElement.querySelectorAll('input, select, textarea')
    allFormControls.forEach((el: Element) => {
      el.setAttribute('autocomplete', AUTCOMPLETE_OFF)
    })

    /**
     * LEARNING: Browser extension compatibility patch
     * WHY: Some extensions iterate `form.elements` and expect each element to have a `.control` property.
     * PATTERN: Define a non-writable `control` property that points to the owning form when missing.
     */
    const formElements = Array.from(formElement.elements).filter((el): el is HTMLElement => el != null)
    for (const el of formElements) {
      const hasControl = 'control' in el && (el as unknown as { control?: unknown }).control
      if (!hasControl) {
        Object.defineProperty(el, 'control', {
          value: formElement,
          writable: false,
          enumerable: true,
          configurable: true,
        })
      }
    }
  } catch (error) {
  }
}
