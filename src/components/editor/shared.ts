import { axios } from '@/utils/axios'

import { endpoints, HOST_API } from '@/constants/config'
import { fileData, fileThumb } from '../file-thumbnail'

export const replaceBase64WithUrl = async (content: string | null) => {
  const imgTagRegex = /<img[^>]+src="data:image\/[^;]+;base64[^"]+"[^>]*>/g
  const matches = content?.match(imgTagRegex)

  if (!matches) {
    return String(content)
  }

  const base64ToFileMap: { [key: string]: File } = {}

  const uploadPromises = matches.map(async (match) => {
    const base64Match = match.match(/src="([^"]+)"/)
    const base64String = base64Match ? base64Match[1] : ''

    const file = base64ToFile(base64String, 'image.png')

    base64ToFileMap[base64String] = file

    return file
  })

  const files = await Promise.all(uploadPromises)

  const imageUrls = await handleImageUploads(files)

  const transformedContent = imageUrls.map((url, index) =>
    content?.replace(
      matches[index],
      `<a href='${url}' target='_blank' rel='noopener noreferrer'><img src="${url}" /></a>`
    )
  )

  return transformedContent.join('')
}

type Files = Array<{
  fieldname: string
  originalname: string
  name: string
  encoding: string
  mimetype: string
  destination: string
  filename: string
  path: string
  preview: string
  size: number
}>

const handleImageUploads = async (files: File[]) => {
  const formData = new FormData()

  files.forEach((file) => formData.append('files', file))

  const response = await axios.post<Files>(endpoints.uploads.createUploads, formData)

  return response.data.map(({ name }) => `${HOST_API}/uploads/${name}`)
}

const base64ToFile = (base64: string, filename: string) => {
  const arr = base64.split(',')
  const mimeMatch = arr[0]?.match(/:(.*?);/)
  const mime = mimeMatch ? mimeMatch[1] : ''
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }

  return new File([u8arr], filename, { type: mime })
}

const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

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
