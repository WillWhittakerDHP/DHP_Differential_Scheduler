/**
 * TEST: formElementPatching utilities
 *
 * Covers:
 * - `tryPatchFormImmediatelyBySelector` patches a form found via selector
 * - `patchFormFromVFormRef` patches directly via `$el`
 * - `setupFormMutationObserver` patches when the form appears later, and patches autocomplete on inserted controls
 *
 * Dependencies:
 * - JSDOM environment (configured in `vitest.config.ts`)
 * - Vue `ref` (for VForm ref shape)
 */

import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { AUTCOMPLETE_OFF } from '@/utils/autocomplete'
import {
  patchFormFromVFormRef,
  setupFormMutationObserver,
  tryPatchFormImmediatelyBySelector,
} from '@/utils/forms/formElementPatching'

describe('formElementPatching utilities', () => {
  it('tryPatchFormImmediatelyBySelector patches an existing form', () => {
    document.body.innerHTML = ''

    const form = document.createElement('form')
    form.className = 'dynamic-form-fields'
    document.body.appendChild(form)

    const didPatch = tryPatchFormImmediatelyBySelector('.dynamic-form-fields')
    expect(didPatch).toBe(true)
    expect(form.getAttribute('autocomplete')).toBe(AUTCOMPLETE_OFF)
  })

  it('patchFormFromVFormRef patches when $el is the form', async () => {
    document.body.innerHTML = ''
    const form = document.createElement('form')
    document.body.appendChild(form)

    const formRef = ref({ $el: form } as unknown as InstanceType<typeof import('vuetify/components').VForm>)
    await patchFormFromVFormRef(formRef, '.missing')

    expect(form.getAttribute('autocomplete')).toBe(AUTCOMPLETE_OFF)
  })

  it('setupFormMutationObserver patches form and newly added controls', async () => {
    document.body.innerHTML = ''

    const cleanup = setupFormMutationObserver({
      formSelector: '.observed-form',
      useMutationObserver: true,
    })

    // Add a control first (should get autocomplete patched)
    const input = document.createElement('input')
    document.body.appendChild(input)
    await new Promise((r) => setTimeout(r, 0))
    expect(input.getAttribute('autocomplete')).toBe(AUTCOMPLETE_OFF)

    // Now add the form (should be patched and observer disconnects)
    const form = document.createElement('form')
    form.className = 'observed-form'
    document.body.appendChild(form)
    await new Promise((r) => setTimeout(r, 0))

    expect(form.getAttribute('autocomplete')).toBe(AUTCOMPLETE_OFF)

    cleanup()
  })
})


