/** Header offset — keep in sync with globals.css scroll-padding-top */
export const HEADER_OFFSET_PX = 80

/** Full-viewport snap sections (NOT hero). */
export const pageSectionShell =
  'box-border flex h-[100vh] w-full snap-start snap-always flex-col items-center justify-center overflow-hidden'

/** Dashboard — min one screen, can grow */
export const pageSectionShellTall =
  'box-border flex min-h-[100vh] w-full snap-start snap-always flex-col items-center justify-center overflow-visible'

export const FUNCTIONS_ANCHOR_IDS = {
  rules: 'rules',
  knowledge: 'knowledge',
  tasks: 'tasks',
} as const
