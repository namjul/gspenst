// import { useEditState } from '@gspenst/next'
import { useState } from 'react'
import { View } from '@gspenst/components'

const EditButton = (props: React.PropsWithChildren<{}>) => {
  // const { edit, setEdit } = useEditState() // eslint-disable-line @typescript-eslint/no-unsafe-assignment
  const [edit, setEdit] = useState(false)

  return (
    <View
      as="button"
      onClick={() => {
        setEdit((editState: boolean) => !editState) // eslint-disable-line @typescript-eslint/no-unsafe-call
      }}
      aria-label="edit-mode"
      {...props}
      css={{ color: '$gray11', backgroundColor: '$gray2' }}
    >
      {edit ? 'Exit edit mode' : 'Enter edit mode'}
    </View>
  )
}

export default EditButton
