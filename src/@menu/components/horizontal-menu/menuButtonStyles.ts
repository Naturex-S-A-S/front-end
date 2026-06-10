// Third-party Imports
import { css } from "@emotion/react";

// Type Imports
import type { ChildrenType } from "../../types";

// Util Imports
import { menuClasses } from "../../utils/menuClasses";

type MenuButtonStylesProps = Partial<ChildrenType> & {
  level: number;
  disabled?: boolean;
};

export const menuButtonStyles = (props: MenuButtonStylesProps) => {
  // Props
  const { level, disabled, children } = props;

  return css({
    display: "flex",
    alignItems: "center",
    minBlockSize: "30px",
    textDecoration: "none",
    color: "inherit",
    boxSizing: "border-box",
    cursor: "pointer",
    paddingInline: "20px",

    "&:hover": {
      backgroundColor: "#f3f3f3"
    },

    "&:focus-visible": {
      outline: "none",
      backgroundColor: "#f3f3f3"
    },

    ...(disabled && {
      pointerEvents: "none",
      cursor: "default",
      color: "#adadad"
    }),

    // All the active styles are applied to the button including menu items or submenu
    [`&.${menuClasses.active}`]: {
      ...(level === 0
        ? {
            color: "white",
            backgroundColor: "#765feb"
          }
        : {
            ...(children ? { backgroundColor: "#f3f3f3" } : { color: "#765feb", backgroundColor: "#765feb1f" })
          })
    }
  });
};
