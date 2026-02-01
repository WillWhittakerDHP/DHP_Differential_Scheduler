
import { describe, it, expect } from 'vitest'
import { AUTCOMPLETE_OFF } from '@/utils/autocomplete'
import { patchFormElements } from '@/utils/patchFormElements'

describe('patchFormElements', () => {
  it('sets autocomplete off on form and controls and ensures control property exists', () => {
    document.body.innerHTML = ''

    const form = document.createElement('form')
    const input = document.createElement('input')
    const select = document.createElement('select')
    const textarea = document.createElement('textarea')
    form.appendChild(input)
    form.appendChild(select)
    form.appendChild(textarea)
    document.body.appendChild(form)

    patchFormElements(form)

    expect(form.getAttribute('autocomplete')).toBe(AUTCOMPLETE_OFF)
    expect(input.getAttribute('autocomplete')).toBe(AUTCOMPLETE_OFF)
    expect(select.getAttribute('autocomplete')).toBe(AUTCOMPLETE_OFF)
    expect(textarea.getAttribute('autocomplete')).toBe(AUTCOMPLETE_OFF)

    const elements = Array.from(form.elements) as unknown as Array<{ control?: unknown }>
    for (const el of elements) {
      expect(el.control).toBe(form)
    }
  })
})


import { describe, it, expect, beforeEach, vi } from 'vitest'
import { patchFormElements } from '../patchFormElements'
import { AUTCOMPLETE_OFF } from '../autocomplete'

describe('patchFormElements', () => {
  let formElement: HTMLFormElement
  let inputElement: HTMLInputElement
  let selectElement: HTMLSelectElement
  let textareaElement: HTMLTextAreaElement

  beforeEach(() => {
    formElement = document.createElement('form')
    
    inputElement = document.createElement('input')
    selectElement = document.createElement('select')
    textareaElement = document.createElement('textarea')
    
    formElement.appendChild(inputElement)
    formElement.appendChild(selectElement)
    formElement.appendChild(textareaElement)
  })

  it('should set autocomplete on form element', () => {
    patchFormElements(formElement)
    
    expect(formElement.getAttribute('autocomplete')).toBe(AUTCOMPLETE_OFF)
  })

  it('should set autocomplete on all input elements', () => {
    patchFormElements(formElement)
    
    expect(inputElement.getAttribute('autocomplete')).toBe(AUTCOMPLETE_OFF)
  })

  it('should set autocomplete on all select elements', () => {
    patchFormElements(formElement)
    
    expect(selectElement.getAttribute('autocomplete')).toBe(AUTCOMPLETE_OFF)
  })

  it('should set autocomplete on all textarea elements', () => {
    patchFormElements(formElement)
    
    expect(textareaElement.getAttribute('autocomplete')).toBe(AUTCOMPLETE_OFF)
  })

  it('should handle form with no form controls', () => {
    const emptyForm = document.createElement('form')
    
    expect(() => patchFormElements(emptyForm)).not.toThrow()
    expect(emptyForm.getAttribute('autocomplete')).toBe(AUTCOMPLETE_OFF)
  })

  it('should handle form with multiple inputs', () => {
    const input1 = document.createElement('input')
    const input2 = document.createElement('input')
    const input3 = document.createElement('input')
    
    formElement.appendChild(input1)
    formElement.appendChild(input2)
    formElement.appendChild(input3)
    
    patchFormElements(formElement)
    
    expect(input1.getAttribute('autocomplete')).toBe(AUTCOMPLETE_OFF)
    expect(input2.getAttribute('autocomplete')).toBe(AUTCOMPLETE_OFF)
    expect(input3.getAttribute('autocomplete')).toBe(AUTCOMPLETE_OFF)
  })

  it('should handle form with nested elements', () => {
    const div = document.createElement('div')
    const nestedInput = document.createElement('input')
    div.appendChild(nestedInput)
    formElement.appendChild(div)
    
    patchFormElements(formElement)
    
    expect(nestedInput.getAttribute('autocomplete')).toBe(AUTCOMPLETE_OFF)
  })

  it('should handle form with mixed control types', () => {
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    const radio = document.createElement('input')
    radio.type = 'radio'
    const password = document.createElement('input')
    password.type = 'password'
    
    formElement.appendChild(checkbox)
    formElement.appendChild(radio)
    formElement.appendChild(password)
    
    patchFormElements(formElement)
    
    expect(checkbox.getAttribute('autocomplete')).toBe(AUTCOMPLETE_OFF)
    expect(radio.getAttribute('autocomplete')).toBe(AUTCOMPLETE_OFF)
    expect(password.getAttribute('autocomplete')).toBe(AUTCOMPLETE_OFF)
  })

  it('should overwrite existing autocomplete attribute', () => {
    formElement.setAttribute('autocomplete', 'on')
    inputElement.setAttribute('autocomplete', 'username')
    
    patchFormElements(formElement)
    
    expect(formElement.getAttribute('autocomplete')).toBe(AUTCOMPLETE_OFF)
    expect(inputElement.getAttribute('autocomplete')).toBe(AUTCOMPLETE_OFF)
  })

  it('should handle errors gracefully', () => {
    const originalSetAttribute = formElement.setAttribute.bind(formElement)
    formElement.setAttribute = vi.fn(() => {
      throw new Error('Mock error')
    })
    
    expect(() => patchFormElements(formElement)).not.toThrow()
    
    formElement.setAttribute = originalSetAttribute
  })

  it('should handle querySelectorAll errors gracefully', () => {
    const originalQuerySelectorAll = formElement.querySelectorAll.bind(formElement)
    formElement.querySelectorAll = vi.fn(() => {
      throw new Error('Mock querySelectorAll error')
    })
    
    expect(() => patchFormElements(formElement)).not.toThrow()
    
    formElement.querySelectorAll = originalQuerySelectorAll
  })

  it('should handle form element that is not actually a form', () => {
    const div = document.createElement('div') as unknown as HTMLFormElement
    
    expect(() => patchFormElements(div)).not.toThrow()
  })
})

