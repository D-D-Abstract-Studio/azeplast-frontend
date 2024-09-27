import { axios } from '@/utils/axios'

import { endpoints, HOST_API } from '@/constants/config'

export const replaceBase64WithUrl = async (content: string | null) => {
  const imgTagRegex = /<img[^>]+src="data:image\/[^;]+;base64[^"]+"[^>]*>/g
  const matches = content?.match(imgTagRegex)

  if (!matches) return content

  const uploadPromises = matches.map(async (match) => {
    const base64Match = match.match(/src="([^"]+)"/)
    const base64String = base64Match ? base64Match[1] : ''

    const file = base64ToFile(base64String, 'image.png')

    const imageUrl = await handleImageUpload(file)

    if (imageUrl) {
      content = content?.replace(base64String, imageUrl) || ''
    }
  })

  await Promise.all(uploadPromises)

  return content
}

type Files = Array<{
  fieldname: string
  originalname: string
  encoding: string
  mimetype: string
  destination: string
  filename: string
  path: string
  preview: string
  size: number
}>

const handleImageUpload = async (file: File) => {
  const formData = new FormData()
  formData.append('files', file)

  try {
    const response = await axios.post<Files>(endpoints.uploads.createUploads, formData)

    return response.data.map((file) => HOST_API + file.preview)[0]
  } catch (error) {
    console.error('Erro no upload da imagem', error)
    return null
  }
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
