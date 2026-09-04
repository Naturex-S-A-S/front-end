"use client";

import { useRef, useState } from "react";

import Chip from "@mui/material/Chip";
import Fade from "@mui/material/Fade";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Switch from "@mui/material/Switch";

import classnames from "classnames";
import { HexColorPicker, HexColorInput } from "react-colorful";

import type { Settings } from "@core/contexts/settingsContext";
import type { PrimaryColorConfig } from "@configs/primaryColorConfig";
import primaryColorConfig from "@configs/primaryColorConfig";
import SkinDefault from "@core/svg/SkinDefault";
import SkinBordered from "@core/svg/SkinBordered";
import styles from "./styles.module.css";

type DebouncedColorPickerProps = {
  settings: Settings;
  isColorFromPrimaryConfig: PrimaryColorConfig | undefined;
  handleChange: (field: keyof Settings | "primaryColor", value: Settings[keyof Settings] | string) => void;
};

const DebouncedColorPicker = (props: DebouncedColorPickerProps) => {
  const { settings, isColorFromPrimaryConfig, handleChange } = props;
  const [debouncedColor, setDebouncedColor] = useState(settings.primaryColor ?? primaryColorConfig[0].main);

  const { useDebounce } = require("react-use");

  useDebounce(() => handleChange("primaryColor", debouncedColor), 200, [debouncedColor]);

  return (
    <>
      <HexColorPicker
        color={!isColorFromPrimaryConfig ? settings.primaryColor ?? primaryColorConfig[0].main : "#eee"}
        onChange={setDebouncedColor}
      />
      <HexColorInput
        className={styles.colorInput}
        color={!isColorFromPrimaryConfig ? settings.primaryColor ?? primaryColorConfig[0].main : "#eee"}
        onChange={setDebouncedColor}
        prefixed
        placeholder='Type a color'
      />
    </>
  );
};

interface ThemingSectionProps {
  settings: Settings;
  isSystemDark: boolean;
  handleChange: (field: keyof Settings | "primaryColor", value: Settings[keyof Settings] | string) => void;
  handleMenuClose: (event: MouseEvent | TouchEvent) => void;
}

const ThemingSection = ({ settings, isSystemDark, handleChange, handleMenuClose }: ThemingSectionProps) => {
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isColorFromPrimaryConfig = primaryColorConfig.find(item => item.main === settings.primaryColor);

  return (
    <div className='flex flex-col gap-6'>
      <Chip label='Theming' size='small' color='primary' variant='tonal' className='self-start rounded-sm' />
      <div className='flex flex-col gap-2'>
        <p className='font-medium'>Primary Color</p>
        <div className='flex items-center justify-between'>
          {primaryColorConfig.map(item => (
            <div
              key={item.main}
              className={classnames(styles.primaryColorWrapper, {
                [styles.active]: settings.primaryColor === item.main
              })}
              onClick={() => handleChange("primaryColor", item.main)}
            >
              <div className={styles.primaryColor} style={{ backgroundColor: item.main }} />
            </div>
          ))}
          <div
            ref={anchorRef}
            className={classnames(styles.primaryColorWrapper, {
              [styles.active]: !isColorFromPrimaryConfig
            })}
            onClick={() => setIsMenuOpen(prev => !prev)}
          >
            <div
              className={classnames(styles.primaryColor, "flex items-center justify-center")}
              style={{
                backgroundColor: !isColorFromPrimaryConfig
                  ? settings.primaryColor
                  : "var(--mui-palette-action-selected)",
                color: isColorFromPrimaryConfig
                  ? "var(--mui-palette-text-primary)"
                  : "var(--mui-palette-primary-contrastText)"
              }}
            >
              <i className='tabler-color-picker text-xl' />
            </div>
          </div>
          <Popper
            transition
            open={isMenuOpen}
            disablePortal
            anchorEl={anchorRef.current}
            placement='bottom-end'
            className='z-[1]'
          >
            {({ TransitionProps }) => (
              <Fade {...TransitionProps} style={{ transformOrigin: "right top" }}>
                <Paper elevation={6} className={styles.colorPopup}>
                  <ClickAwayListener onClickAway={handleMenuClose}>
                    <div>
                      <DebouncedColorPicker
                        settings={settings}
                        isColorFromPrimaryConfig={isColorFromPrimaryConfig}
                        handleChange={handleChange}
                      />
                    </div>
                  </ClickAwayListener>
                </Paper>
              </Fade>
            )}
          </Popper>
        </div>
      </div>
      <div className='flex flex-col gap-2'>
        <p className='font-medium'>Mode</p>
        <div className='flex items-center justify-between'>
          <div className='flex flex-col items-start gap-0.5'>
            <div
              className={classnames(styles.itemWrapper, styles.modeWrapper, {
                [styles.active]: settings.mode === "light"
              })}
              onClick={() => handleChange("mode", "light")}
            >
              <i className='tabler-sun text-[30px]' />
            </div>
            <p className={styles.itemLabel} onClick={() => handleChange("mode", "light")}>
              Light
            </p>
          </div>
          <div className='flex flex-col items-start gap-0.5'>
            <div
              className={classnames(styles.itemWrapper, styles.modeWrapper, {
                [styles.active]: settings.mode === "dark"
              })}
              onClick={() => handleChange("mode", "dark")}
            >
              <i className='tabler-moon-stars text-[30px]' />
            </div>
            <p className={styles.itemLabel} onClick={() => handleChange("mode", "dark")}>
              Dark
            </p>
          </div>
          <div className='flex flex-col items-start gap-0.5'>
            <div
              className={classnames(styles.itemWrapper, styles.modeWrapper, {
                [styles.active]: settings.mode === "system"
              })}
              onClick={() => handleChange("mode", "system")}
            >
              <i className='tabler-device-laptop text-[30px]' />
            </div>
            <p className={styles.itemLabel} onClick={() => handleChange("mode", "system")}>
              System
            </p>
          </div>
        </div>
      </div>
      <div className='flex flex-col gap-2'>
        <p className='font-medium'>Skin</p>
        <div className='flex items-center gap-4'>
          <div className='flex flex-col items-start gap-0.5'>
            <div
              className={classnames(styles.itemWrapper, { [styles.active]: settings.skin === "default" })}
              onClick={() => handleChange("skin", "default")}
            >
              <SkinDefault />
            </div>
            <p className={styles.itemLabel} onClick={() => handleChange("skin", "default")}>
              Default
            </p>
          </div>
          <div className='flex flex-col items-start gap-0.5'>
            <div
              className={classnames(styles.itemWrapper, { [styles.active]: settings.skin === "bordered" })}
              onClick={() => handleChange("skin", "bordered")}
            >
              <SkinBordered />
            </div>
            <p className={styles.itemLabel} onClick={() => handleChange("skin", "bordered")}>
              Bordered
            </p>
          </div>
        </div>
      </div>
      {settings.mode === "dark" ||
      (settings.mode === "system" && isSystemDark) ||
      settings.layout === "horizontal" ? null : (
        <div className='flex items-center justify-between'>
          <label className='font-medium cursor-pointer' htmlFor='customizer-semi-dark'>
            Semi Dark
          </label>
          <Switch
            id='customizer-semi-dark'
            checked={settings.semiDark === true}
            onChange={() => handleChange("semiDark", !settings.semiDark)}
          />
        </div>
      )}
    </div>
  );
};

export default ThemingSection;
