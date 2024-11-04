import { axios } from '@/utils/axios'

import { endpoints, HOST_API } from '@/constants/config'
import { fileData, fileThumb } from '../file-thumbnail'

type ProcessType = {
  value: string
  filesDrop: Array<File & { preview?: string }>
  onChange: any
}
export const processFiles = async ({ value, filesDrop, onChange }: ProcessType) => {
  const formData = new FormData()

  await Promise.all(
    filesDrop.map(async (file) => {
      const binaryData = await readFileAsArrayBuffer(file)
      const blob = new Blob([binaryData], { type: file.type })
      formData.append('files', blob, file.name)

      file.preview = URL.createObjectURL(file)
    })
  )

  const { data } = await axios.post<Array<File & { preview?: string }>>(
    endpoints.uploads.createUploads,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )

  const newContent = `${value}${data.map((file) => {
    const { preview = '', name } = fileData(file)
    const format = fileThumb(name || preview)

    const thumbnailURL = `${window.location.origin}/plugins/azeplast-frontend/public/${fileThumb(
      format
    )}`

    return `<a href='${HOST_API}/uploads/${name}' target='_blank' rel='noopener noreferrer'><img src='${thumbnailURL}' alt='${name}' /></a>`
  })}`

  onChange?.(newContent)
}

const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}
