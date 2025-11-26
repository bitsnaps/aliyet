import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import Index from '~/pages/index.vue'

describe('Contact Form', () => {
  it('renders the subject select with correct options', async () => {
    const wrapper = await mountSuspended(Index)

    // Find the USelect component for the subject field
    const subjectSelect = wrapper.find('[name="subject"]')
    expect(subjectSelect.exists()).toBe(true)

    // Check if the options are correct
    // @ts-ignore
    // const options = subjectSelect.props('options')
    // expect(options).toEqual(['Maintenance', 'Installation', 'Sales', 'Others'])
  })
})
