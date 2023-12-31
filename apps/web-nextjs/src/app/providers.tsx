'use client'

import * as React from 'react'
import { WagmiConfig } from 'wagmi'

import { config } from '../wagmi'

export function Providers({ children }: { children: React.ReactNode }) {
  return <WagmiConfig config={config}>{children}</WagmiConfig>
}
