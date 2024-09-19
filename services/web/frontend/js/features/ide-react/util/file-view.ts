import { FileRef } from '../../../../../types/file-ref'
import { BinaryFile } from '@/features/file-view/types/binary-file'

export function convertFileRefToBinaryFile(fileRef: FileRef): BinaryFile {
  return {
    _id: fileRef._id,
    name: fileRef.name,
    id: fileRef._id,
    type: 'file',
    selected: true,
    linkedFileData: fileRef.linkedFileData,
    created: fileRef.created ? new Date(fileRef.created) : new Date(),
  }
}

// `FileViewHeader`, which is TypeScript, expects a BinaryFile, which has a
// `created` property of type `Date`, while `TPRFileViewInfo`, written in JS,
// into which `FileViewHeader` passes its BinaryFile, expects a file object with
// `created` property of type `string`, which is a mismatch. `TPRFileViewInfo`
// is the only one making runtime complaints and it seems that other uses of
// `FileViewHeader` pass in a string for `created`, so that's what this function
// does too.
export function fileViewFile(fileRef: FileRef) {
  return {
    ...convertFileRefToBinaryFile(fileRef),
    created: fileRef.created,
  }
}
