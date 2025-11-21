// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import { useSession } from 'next-auth/react'

import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import { Menu, MenuItem, SubMenu } from '@menu/vertical-menu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'
import type { IChild, IPermissions } from '@/types/next-auth'

type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

type Props = {
  scrollMenu: (container: any, isPerfectScrollbar: boolean) => void
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='tabler-chevron-right' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ scrollMenu }: Props) => {
  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const { isBreakpointReached } = useVerticalNav()
  const { data: session } = useSession()

  // Vars
  const { transitionDuration } = verticalNavOptions

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  const GenerateVerticalMenu = ({ permissions }: { permissions?: IPermissions[] }) => {
    if (!permissions || permissions.length === 0) {
      return (
        <>
          <MenuItem href='/home' icon={<i className='tabler-smart-home' />}>
            Home
          </MenuItem>
        </>
      )
    }

    const renderChild = (child: IChild, key: string, basePath?: string): JSX.Element => {
      const name = child.name || key

      const resolvedPath = child.path
        ? child.path.startsWith('/')
          ? child.path
          : `${(basePath || '').replace(/\/$/, '')}/${child.path}`
        : basePath || '/'

      if (child.children && child.children.length > 0) {
        return (
          <SubMenu key={key} label={name} icon={<i className='tabler-folder' />}>
            {child.children.map((c, i) => renderChild(c, `${key}-${i}`, resolvedPath))}
          </SubMenu>
        )
      }

      return (
        <MenuItem key={key} href={resolvedPath}>
          {name}
        </MenuItem>
      )
    }

    return (
      <>
        {permissions.map((module, idx) => {
          const moduleKey = module.name || `module-${idx}`
          const moduleName = module.name || moduleKey
          const modulePath = module.path || '/'

          if (module.children && module.children.length > 0) {
            return (
              <SubMenu key={`${idx}-${moduleKey}`} label={moduleName} icon={<i className='tabler-folder' />}>
                {module.children.map((child, i) => renderChild(child, `${idx}-${moduleKey}-${i}`, modulePath))}
              </SubMenu>
            )
          }

          return (
            <MenuItem key={`${idx}-${moduleKey}`} href={modulePath} icon={<i className='tabler-folder' />}>
              {moduleName}
            </MenuItem>
          )
        })}
      </>
    )
  }

  return (
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      <Menu
        popoutMenuOffset={{ mainAxis: 23 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        {session?.permissions && <GenerateVerticalMenu permissions={session?.permissions} />}
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
