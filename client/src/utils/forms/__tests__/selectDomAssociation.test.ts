
import { describe, it, expect } from 'vitest'
import { AUTCOMPLETE_OFF } from '@/utils/autocomplete'
import { patchSelectDomTargets } from '@/utils/forms/selectDomAssociation'

describe('patchSelectDomTargets', () => {
  it('sets select name and patches nearest form', () => {
    document.body.innerHTML = ''

    const form = document.createElement('form')
    const wrapper = document.createElement('div')
    wrapper.id = 'app-select-field-foo'

    const select = document.createElement('select')
    wrapper.appendChild(select)
    form.appendChild(wrapper)
    document.body.appendChild(form)

    patchSelectDomTargets([{ appSelectId: 'app-select-field-foo', expectedName: 'foo' }])

    expect(select.getAttribute('name')).toBe('foo')
    expect(form.getAttribute('autocomplete')).toBe(AUTCOMPLETE_OFF)
  })

  it('is safe when wrapper does not exist', () => {
    document.body.innerHTML = ''
    expect(() => patchSelectDomTargets([{ appSelectId: 'missing', expectedName: 'x' }])).not.toThrow()
  })
})


