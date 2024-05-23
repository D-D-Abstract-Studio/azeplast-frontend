import { Icon, IconifyIcon } from '@iconify/react'

import { Box, BoxProps, SxProps } from '@mui/material'

interface Props extends BoxProps {
  sx?: SxProps
  icon?: IconifyIcon | string
  size?: number
  name?: string
}

export const Iconify = ({ icon, size = 2, sx, name, ...other }: Props) => {
  return <Box component={Icon} icon={icon} sx={{ ...sx, fontSize: size * 10 }} {...other} />
}

export default Iconify
