
import { AUTCOMPLETE_OFF } from './autocomplete'
import { createLogger } from './logger'

const logger = createLogger('patchFormElements')

export function patchFormElements(formElement: HTMLFormElement): void {
  try {
    formElement.setAttribute('autocomplete', AUTCOMPLETE_OFF)
    
    const allFormControls = formElement.querySelectorAll('input, select, textarea')
    allFormControls.forEach((el: Element) => {
      el.setAttribute('autocomplete', AUTCOMPLETE_OFF)
    })

    /**
     */
    const formElements = Array.from(formElement.elements).filter((el): el is HTMLElement => el != null)
    for (const el of formElements) {
      const hasControl = 'control' in el && (el as { control?: unknown }).control
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
    logger.debug('Failed to patch form elements', { error, formId: formElement.id })
  }
}
