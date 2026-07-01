/** Full-viewport sections. Mobile gets free height since stacked content can exceed 100vh. */
export const pageSectionShell =
  'box-border flex min-h-[100vh] w-full flex-col items-center justify-center overflow-visible py-12 sm:py-0 sm:h-[100vh] sm:overflow-hidden'

/** Dashboard — min one screen, can grow */
export const pageSectionShellTall =
  'box-border flex min-h-[100vh] w-full flex-col items-center justify-center overflow-visible'

export const FUNCTIONS_ANCHOR_IDS = {
  rules: 'rules',
  knowledge: 'knowledge',
  tasks: 'tasks',
} as const
