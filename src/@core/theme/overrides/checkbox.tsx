// MUI Imports
import type { Theme } from "@mui/material/styles";

// Local Imports
import { Icon, IndeterminateIcon, CheckedIcon } from "./checkbox-icons";

const checkbox: Theme["components"] = {
  MuiCheckbox: {
    defaultProps: {
      icon: <Icon />,
      indeterminateIcon: <IndeterminateIcon />,
      checkedIcon: <CheckedIcon />
    },
    styleOverrides: {
      root: ({ theme, ownerState }) => ({
        ...(ownerState.size === "small"
          ? {
              padding: theme.spacing(1),
              "& svg": {
                fontSize: "1.25rem"
              }
            }
          : {
              padding: theme.spacing(1.5),
              "& svg": {
                fontSize: "1.5rem"
              }
            }),
        "&:not(.Mui-checked):not(.Mui-disabled):not(.MuiCheckbox-indeterminate) svg, &:not(.Mui-checked):not(.Mui-disabled):not(.MuiCheckbox-indeterminate) i":
          {
            color: "var(--mui-palette-text-disabled)"
          },
        "&.Mui-checked:not(.Mui-disabled) svg, &.MuiCheckbox-indeterminate:not(.Mui-disabled) svg": {
          filter: `drop-shadow(var(--mui-customShadows-${ownerState.color}-sm))`
        },
        "&.Mui-disabled": {
          opacity: 0.45,
          "&:not(.Mui-checked)": {
            color: "var(--mui-palette-text-disabled)"
          },
          "&.Mui-checked.MuiCheckbox-colorPrimary": {
            color: "var(--mui-palette-primary-main)"
          },
          "&.Mui-checked.MuiCheckbox-colorSecondary": {
            color: "var(--mui-palette-secondary-main)"
          },
          "&.Mui-checked.MuiCheckbox-colorError": {
            color: "var(--mui-palette-error-main)"
          },
          "&.Mui-checked.MuiCheckbox-colorWarning": {
            color: "var(--mui-palette-warning-main)"
          },
          "&.Mui-checked.MuiCheckbox-colorInfo": {
            color: "var(--mui-palette-info-main)"
          },
          "&.Mui-checked.MuiCheckbox-colorSuccess": {
            color: "var(--mui-palette-success-main)"
          }
        }
      })
    }
  }
};

export default checkbox;
