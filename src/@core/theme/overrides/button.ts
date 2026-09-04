// MUI Imports
import type { Theme } from "@mui/material/styles";

// Config Imports
import themeConfig from "@configs/themeConfig";

const iconStyles = (size?: string) => ({
  "& > *:nth-of-type(1)": {
    ...(size === "small"
      ? {
          fontSize: "14px"
        }
      : {
          ...(size === "medium"
            ? {
                fontSize: "16px"
              }
            : {
                fontSize: "20px"
              })
        })
  }
});

const BUTTON_COLORS = ["primary", "secondary", "error", "warning", "info", "success"] as const;

const HOVER_SELECTORS =
  "&:not(.Mui-disabled):hover, &:not(.Mui-disabled):active, &.Mui-focusVisible:not(:has(span.MuiTouchRipple-root))";

const getTextVariants = () =>
  BUTTON_COLORS.map(color => ({
    props: { variant: "text" as const, color },
    style: {
      [HOVER_SELECTORS]: {
        backgroundColor: `var(--mui-palette-${color}-lighterOpacity)`
      },
      "&.Mui-disabled": {
        color: `var(--mui-palette-${color}-main)`
      }
    }
  }));

const getOutlinedVariants = () =>
  BUTTON_COLORS.map(color => ({
    props: { variant: "outlined" as const, color },
    style: {
      borderColor: `var(--mui-palette-${color}-main)`,
      [HOVER_SELECTORS]: {
        backgroundColor: `var(--mui-palette-${color}-lighterOpacity)`
      },
      "&.Mui-disabled": {
        color: `var(--mui-palette-${color}-main)`,
        borderColor: `var(--mui-palette-${color}-main)`
      }
    }
  }));

const getContainedVariants = () =>
  BUTTON_COLORS.map(color => ({
    props: { variant: "contained" as const, color },
    style: {
      "&:not(.Mui-disabled)": {
        boxShadow: `var(--mui-customShadows-${color}-sm)`
      },
      "&:not(.Mui-disabled):active, &.Mui-focusVisible:not(:has(span.MuiTouchRipple-root))": {
        backgroundColor: `var(--mui-palette-${color}-dark)`
      },
      "&.Mui-disabled": {
        color: `var(--mui-palette-${color}-contrastText)`,
        backgroundColor: `var(--mui-palette-${color}-main)`
      }
    }
  }));

const getTonalVariants = () =>
  BUTTON_COLORS.map(color => ({
    props: { variant: "tonal" as const, color },
    style: {
      backgroundColor: `var(--mui-palette-${color}-lightOpacity)`,
      color: `var(--mui-palette-${color}-main)`,
      [HOVER_SELECTORS]: {
        backgroundColor: `var(--mui-palette-${color}-mainOpacity)`
      },
      "&.Mui-disabled": {
        color: `var(--mui-palette-${color}-main)`
      }
    }
  }));

const button: Theme["components"] = {
  MuiButtonBase: {
    defaultProps: {
      disableRipple: themeConfig.disableRipple
    }
  },
  MuiButton: {
    styleOverrides: {
      root: ({ theme, ownerState }) => ({
        "&.Mui-disabled": {
          opacity: 0.45
        },
        transition: theme.transitions.create("all", {
          duration: theme.transitions.duration.short
        }),
        "&:not(.Mui-disabled):active": {
          transform: "scale(0.98)"
        },
        ...(ownerState.variant === "text"
          ? {
              ...(ownerState.size === "small" && {
                padding: theme.spacing(1.5, 2.25)
              }),
              ...(ownerState.size === "medium" && {
                padding: theme.spacing(2, 3)
              }),
              ...(ownerState.size === "large" && {
                padding: theme.spacing(2.75, 4)
              })
            }
          : {
              ...(ownerState.variant === "outlined"
                ? {
                    ...(ownerState.size === "small" && {
                      padding: theme.spacing(1.25, 3.25)
                    }),
                    ...(ownerState.size === "medium" && {
                      padding: theme.spacing(1.75, 4.75)
                    }),
                    ...(ownerState.size === "large" && {
                      padding: theme.spacing(2.5, 6.25)
                    })
                  }
                : {
                    ...(ownerState.size === "small" && {
                      padding: theme.spacing(1.5, 3.5)
                    }),
                    ...(ownerState.size === "medium" && {
                      padding: theme.spacing(2, 5)
                    }),
                    ...(ownerState.size === "large" && {
                      padding: theme.spacing(2.75, 6.5)
                    })
                  })
            })
      }),
      sizeSmall: ({ theme }) => ({
        lineHeight: 1.38462,
        fontSize: theme.typography.body2.fontSize,
        borderRadius: "var(--mui-shape-customBorderRadius-sm)"
      }),
      sizeLarge: {
        fontSize: "1.0625rem",
        lineHeight: 1.529412,
        borderRadius: "var(--mui-shape-customBorderRadius-lg)"
      },
      startIcon: ({ theme, ownerState }) => ({
        ...(ownerState.size === "small"
          ? {
              marginInlineEnd: theme.spacing(1.5)
            }
          : {
              ...(ownerState.size === "medium"
                ? {
                    marginInlineEnd: theme.spacing(2)
                  }
                : {
                    marginInlineEnd: theme.spacing(2.5)
                  })
            }),
        ...iconStyles(ownerState.size)
      }),
      endIcon: ({ theme, ownerState }) => ({
        ...(ownerState.size === "small"
          ? {
              marginInlineStart: theme.spacing(1.5)
            }
          : {
              ...(ownerState.size === "medium"
                ? {
                    marginInlineStart: theme.spacing(2)
                  }
                : {
                    marginInlineStart: theme.spacing(2.5)
                  })
            }),
        ...iconStyles(ownerState.size)
      })
    },
    variants: [...getTextVariants(), ...getOutlinedVariants(), ...getContainedVariants(), ...getTonalVariants()]
  }
};

export default button;
