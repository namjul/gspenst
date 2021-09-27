import { render } from '@testing-library/react'

import { Default } from './View.stories'

test('renders without error', () => {
  const { asFragment } = render(<Default />)
  expect(asFragment()).toBeDefined()
})
