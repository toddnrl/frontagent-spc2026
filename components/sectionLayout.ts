/** Full-viewport sections. */
export const pageSectionShell =
  'box-border flex h-[100vh] w-full flex-col items-center justify-center overflow-hidden'

/** Dashboard — min one screen, can grow */
export const pageSectionShellTall =
  'box-border flex min-h-[100vh] w-full flex-col items-center justify-center overflow-visible'

export const FUNCTIONS_ANCHOR_IDS = {
  rules: 'rules',
  knowledge: 'knowledge',
  tasks: 'tasks',
} as const
