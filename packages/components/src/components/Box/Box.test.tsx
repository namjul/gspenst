import { render } from '@testing-library/react'

import { Default } from './Box.stories'

test('renders dark without error', () => {
  const { asFragment } = render(<Default />)
  expect(asFragment()).toBeDefined()
})
