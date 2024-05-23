'use client'

import { m } from 'framer-motion'

import { forwardRef, ReactNode } from 'react'

import { Box, Fab, Tooltip } from '@/components/mui'

import NextLink from 'next/link'

import { SxProps, FabProps } from '@mui/material'

import { useTheme } from '@mui/material/styles'

import { t } from 'i18next'

import { useAuth } from '@/hooks'

interface Props extends Omit<FabProps, 'color'> {
  sxWrap?: SxProps
  href?: string
  permission?: string[]
  title?: string
  color?: 'inherit' | 'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error'
}

export const FabButtonAnimate = forwardRef<HTMLButtonElement, Props>(
  ({ color = 'primary', size = 'large', children, href, sx, sxWrap, title = 'novo', permission, ...other }, ref) => {
    const theme = useTheme()
    const { havePermission, readOnly } = useAuth() || {}
    if (!havePermission) return null

    const animateProps = { href, size, sxWrap, title: t(title ?? '') }

    if (readOnly || (permission?.length && !havePermission(permission))) {
      return null
    }

    if (color === 'default' || color === 'inherit' || color === 'primary' || color === 'secondary') {
      return (
        <AnimateWrap {...animateProps}>
          <Fab ref={ref} size={size} color={color} sx={sx} {...other}>
            {children}
          </Fab>
        </AnimateWrap>
      )
    }

    return (
      <AnimateWrap {...animateProps}>
        <Fab
          ref={ref}
          size={size}
          sx={{
            boxShadow: theme.customShadows[color],
            color: theme.palette[color].contrastText,
            bgcolor: theme.palette[color].main,
            '&:hover': {
              bgcolor: theme.palette[color].dark
            },
            ...sx
          }}
          {...other}
        >
          {children}
        </Fab>
      </AnimateWrap>
    )
  }
)

type AnimateWrapProp = {
  children: ReactNode
  size: 'small' | 'medium' | 'large'
  sxWrap?: SxProps
  href?: string
  title?: string
}

const varSmall = {
  hover: { scale: 1.07 },
  tap: { scale: 0.97 }
}

const varMedium = {
  hover: { scale: 1.06 },
  tap: { scale: 0.98 }
}

const varLarge = {
  hover: { scale: 1.05 },
  tap: { scale: 0.99 }
}

function AnimateWrap({ size, href, sxWrap, title, ...rest }: AnimateWrapProp) {
  const isSmall = size === 'small'
  const isLarge = size === 'large'

  let Component = (
    <Box
      component={m.div}
      whileTap="tap"
      whileHover="hover"
      variants={(isSmall && varSmall) || (isLarge && varLarge) || varMedium}
      sx={{
        display: 'inline-flex',
        ...sxWrap
      }}
    >
      {rest.children}
    </Box>
  )

  if (title) {
    Component = <Tooltip title={title}>{Component}</Tooltip>
  }

  if (href) {
    return <NextLink href={href}>{Component}</NextLink>
  }

  return Component
}
