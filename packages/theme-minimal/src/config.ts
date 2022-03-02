import React from 'react'
import { ThemeConfig } from './types'

export const ThemeConfigContext = React.createContext<ThemeConfig>({})
export const useConfig = () => React.useContext(ThemeConfigContext)
