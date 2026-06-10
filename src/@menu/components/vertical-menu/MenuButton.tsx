// React Imports
import { cloneElement, createElement, forwardRef } from "react";
import type { ForwardRefRenderFunction } from "react";

// Third-party Imports
import classnames from "classnames";

// Type Imports
import type { MenuButtonProps } from "../../types";

// Component Imports
import { RouterLink } from "../RouterLink";

const MenuButton: ForwardRefRenderFunction<HTMLAnchorElement, MenuButtonProps> = (
  { className, component, children, ...rest },
  ref
) => {
  if (component) {
    // If component is a string, create a new element of that type
    if (typeof component === "string") {
      return createElement(
        component,
        {
          className: classnames(className),
          ...rest,
          ref
        },
        children
      );
    } else {
      // Otherwise, clone the element
      const { className: classNameProp, ...props } = component.props;

      return cloneElement(
        component,
        {
          className: classnames(className, classNameProp),
          ...rest,
          ...props,
          ref
        },
        children
      );
    }
  } else {
    // If there is no component but href is defined, render RouterLink
    if (rest.href) {
      return (
        <RouterLink ref={ref} className={className} href={rest.href} {...rest}>
          {children}
        </RouterLink>
      );
    } else {
      return (
        <a ref={ref} className={className} {...rest}>
          {children}
        </a>
      );
    }
  }
};

export default forwardRef(MenuButton);
