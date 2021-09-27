import { render } from '@testing-library/react'

import { Default } from './Text.stories'

test('renders dark without error', () => {
  const { asFragment } = render(<Default />)
  expect(asFragment()).toBeDefined()
})
