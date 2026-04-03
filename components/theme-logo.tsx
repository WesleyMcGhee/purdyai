"use client"

import { useTheme } from "next-themes"

export function ThemeLogo() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  return (
    <img
      src={isDark ? "/purdy-logo.svg" : "/purdy-logo-black.svg"}
      alt="purdy.ai"
      className="h-8 w-8"
    />
  )
}
