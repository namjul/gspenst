import { useEditState } from 'tinacms/dist/edit-state'
import { View } from '@gspenst/components'

const EditButton = (props: React.PropsWithChildren<{}>) => {
  const { edit, setEdit } = useEditState() // eslint-disable-line @typescript-eslint/no-unsafe-assignment

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
