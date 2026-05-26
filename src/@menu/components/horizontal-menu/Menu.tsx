'use client'

// React Imports
import { forwardRef, useMemo } from 'react'
import type { ForwardRefRenderFunction, MenuHTMLAttributes } from 'react'

// Third-party Imports
import classnames from 'classnames'
import { FloatingTree } from '@floating-ui/react'

// Type Imports
import type { ChildrenType, RootStylesType } from '../../types'

// Util Imports
import { menuClasses } from '../../utils/menuClasses'

// Styled Component Imports
import StyledHorizontalMenu from '../../styles/horizontal/StyledHorizontalMenu'

// Style Imports
import styles from '../../styles/horizontal/horizontalUl.module.css'

// Default Config Imports
import { horizontalSubMenuToggleDuration } from '../../defaultConfigs'

// Context Imports
import { HorizontalMenuContext } from './horizontalMenuContext'
import type { HorizontalMenuContextProps } from './horizontalMenuContext'

export type MenuProps = HorizontalMenuContextProps &
  RootStylesType &
  Partial<ChildrenType> &
  MenuHTMLAttributes<HTMLMenuElement>

export { HorizontalMenuContext, HorizontalMenuContextProps } from './horizontalMenuContext'

const Menu: ForwardRefRenderFunction<HTMLMenuElement, MenuProps> = (props, ref) => {
  // Props
  const {
    children,
    className,
    rootStyles,
    menuItemStyles,
    triggerPopout = 'hover',
    browserScroll = false,
    transitionDuration = horizontalSubMenuToggleDuration,
    renderExpandIcon,
    renderExpandedMenuItemIcon,
    popoutMenuOffset = { mainAxis: 0 },
    textTruncate = true,
    verticalMenuProps,
    ...rest
  } = props

  const providerValue = useMemo(
    () => ({
      triggerPopout,
      browserScroll,
      menuItemStyles,
      renderExpandIcon,
      renderExpandedMenuItemIcon,
      transitionDuration,
      popoutMenuOffset,
      textTruncate,
      verticalMenuProps
    }),
    [
      triggerPopout,
      browserScroll,
      menuItemStyles,
      renderExpandIcon,
      renderExpandedMenuItemIcon,
      transitionDuration,
      popoutMenuOffset,
      textTruncate,
      verticalMenuProps
    ]
  )

  return (
    <HorizontalMenuContext.Provider value={providerValue}>
      <FloatingTree>
        <StyledHorizontalMenu
          ref={ref}
          className={classnames(menuClasses.root, className)}
          rootStyles={rootStyles}
          {...rest}
        >
          <ul className={styles.root}>{children}</ul>
        </StyledHorizontalMenu>
      </FloatingTree>
    </HorizontalMenuContext.Provider>
  )
}

export default forwardRef(Menu)
