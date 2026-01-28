// Type Imports
import type { ChildrenType, Direction } from '@core/types'

// Context Imports
import { VerticalNavProvider } from '@menu/contexts/verticalNavContext'
import { SettingsProvider } from '@core/contexts/settingsContext'
import ThemeProvider from '@components/theme'

import SessionProvider from '@/components/provider/SessionProvider'
import { AbilityProvider } from '@/components/provider/AbilityProvider'
import ReactQueryProvider from '@/components/provider/ReactQuery'

// Util Imports
import { getMode, getSettingsFromCookie, getSystemMode } from '@core/utils/serverHelpers'

type Props = ChildrenType & {
  direction: Direction
}

const Providers = (props: Props) => {
  // Props
  const { children, direction } = props

  // Vars
  const mode = getMode()
  const settingsCookie = getSettingsFromCookie()
  const systemMode = getSystemMode()

  return (
    <SessionProvider>
      <AbilityProvider>
        <ReactQueryProvider>
          <VerticalNavProvider>
            <SettingsProvider settingsCookie={settingsCookie} mode={mode}>
              <ThemeProvider direction={direction} systemMode={systemMode}>
                {children}
              </ThemeProvider>
            </SettingsProvider>
          </VerticalNavProvider>
        </ReactQueryProvider>
      </AbilityProvider>
    </SessionProvider>
  )
}

export default Providers
