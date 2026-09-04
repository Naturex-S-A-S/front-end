"use client";

import { useState } from "react";

import { useTheme } from "@mui/material/styles";
import type { Breakpoint } from "@mui/material/styles";

import classnames from "classnames";
import { useMedia } from "react-use";
import PerfectScrollbar from "react-perfect-scrollbar";

import type { Settings } from "@core/contexts/settingsContext";
import type { Direction } from "@core/types";

import { useSettings } from "@core/hooks/useSettings";

import styles from "./styles.module.css";
import ThemingSection from "./ThemingSection";
import LayoutSection from "./LayoutSection";

type CustomizerProps = {
  breakpoint?: Breakpoint | "xxl" | `${number}px` | `${number}rem` | `${number}em`;
  dir?: Direction;
  disableDirection?: boolean;
};

const Customizer = ({ breakpoint = "lg", dir = "ltr", disableDirection = false }: CustomizerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [direction, setDirection] = useState(dir);

  const theme = useTheme();
  const { settings, updateSettings, resetSettings, isSettingsChanged } = useSettings();
  const isSystemDark = useMedia("(prefers-color-scheme: dark)", false);

  let breakpointValue: CustomizerProps["breakpoint"];

  switch (breakpoint) {
    case "xxl":
      breakpointValue = "1920px";
      break;
    case "xl":
      breakpointValue = `${theme.breakpoints.values.xl}px`;
      break;
    case "lg":
      breakpointValue = `${theme.breakpoints.values.lg}px`;
      break;
    case "md":
      breakpointValue = `${theme.breakpoints.values.md}px`;
      break;
    case "sm":
      breakpointValue = `${theme.breakpoints.values.sm}px`;
      break;
    case "xs":
      breakpointValue = `${theme.breakpoints.values.xs}px`;
      break;
    default:
      breakpointValue = breakpoint;
  }

  const breakpointReached = useMedia(`(max-width: ${breakpointValue})`, false);
  const isMobileScreen = useMedia("(max-width: 600px)", false);
  const isBelowLgScreen = useMedia("(max-width: 1200px)", false);

  const ScrollWrapper = isBelowLgScreen ? "div" : PerfectScrollbar;

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleChange = (field: keyof Settings | "direction", value: Settings[keyof Settings] | Direction) => {
    if (field === "direction") {
      setDirection(value as Direction);
    } else {
      updateSettings({ [field]: value });
    }
  };

  const handleMenuClose = (): void => {
    setIsOpen(false);
  };

  return (
    !breakpointReached && (
      <div
        className={classnames("customizer", styles.customizer, {
          [styles.show]: isOpen,
          [styles.smallScreen]: isMobileScreen
        })}
      >
        <div className={styles.toggler} onClick={handleToggle}>
          <i className='tabler-settings text-[22px]' />
        </div>
        <div className={styles.header}>
          <div className='flex flex-col'>
            <h4 className={styles.customizerTitle}>Theme Customizer</h4>
            <p className={styles.customizerSubtitle}>Customize & Preview in Real Time</p>
          </div>
          <div className='flex gap-4'>
            <div onClick={resetSettings} className='relative flex cursor-pointer'>
              <i className='tabler-refresh text-textPrimary' />
              <div className={classnames(styles.dotStyles, { [styles.show]: isSettingsChanged })} />
            </div>
            <i className='tabler-x text-textPrimary cursor-pointer' onClick={handleToggle} />
          </div>
        </div>
        <ScrollWrapper
          {...(isBelowLgScreen
            ? { className: "bs-full overflow-y-auto overflow-x-hidden" }
            : { options: { wheelPropagation: false, suppressScrollX: true } })}
        >
          <div className={styles.customizerBody}>
            <ThemingSection
              settings={settings}
              isSystemDark={isSystemDark}
              handleChange={handleChange}
              handleMenuClose={handleMenuClose}
            />
            <hr className={styles.hr} />
            <LayoutSection
              settings={settings}
              direction={direction}
              disableDirection={disableDirection}
              updateSettings={updateSettings}
            />
          </div>
        </ScrollWrapper>
      </div>
    )
  );
};

export default Customizer;
