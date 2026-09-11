"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";

import Chip from "@mui/material/Chip";

import classnames from "classnames";

import type { Settings } from "@core/contexts/settingsContext";
import type { Direction } from "@core/types";
import LayoutVertical from "@core/svg/LayoutVertical";
import LayoutCollapsed from "@core/svg/LayoutCollapsed";
import LayoutHorizontal from "@core/svg/LayoutHorizontal";
import ContentCompact from "@core/svg/ContentCompact";
import ContentWide from "@core/svg/ContentWide";
import DirectionLtr from "@core/svg/DirectionLtr";
import DirectionRtl from "@core/svg/DirectionRtl";
import styles from "./styles.module.css";

const getLocalePath = (pathName: string, locale: string) => {
  if (!pathName) return "/";
  const segments = pathName.split("/");

  segments[1] = locale;

  return segments.join("/");
};

interface LayoutSectionProps {
  settings: Settings;
  direction: Direction;
  disableDirection: boolean;
  updateSettings: (settings: Partial<Settings>) => void;
}

const LayoutSection = ({ settings, direction, disableDirection, updateSettings }: LayoutSectionProps) => {
  const pathName = usePathname();

  return (
    <div className='flex flex-col gap-6'>
      <Chip label='Layout' variant='outlined' color='primary' className='self-start rounded-sm' />
      <div className='flex flex-col gap-2'>
        <p className='font-medium'>Layouts</p>
        <div className='flex items-center justify-between'>
          <div className='flex flex-col items-start gap-0.5'>
            <div
              className={classnames(styles.itemWrapper, { [styles.active]: settings.layout === "vertical" })}
              onClick={() => updateSettings({ layout: "vertical" })}
            >
              <LayoutVertical />
            </div>
            <p className={styles.itemLabel} onClick={() => updateSettings({ layout: "vertical" })}>
              Vertical
            </p>
          </div>
          <div className='flex flex-col items-start gap-0.5'>
            <div
              className={classnames(styles.itemWrapper, { [styles.active]: settings.layout === "collapsed" })}
              onClick={() => updateSettings({ layout: "collapsed" })}
            >
              <LayoutCollapsed />
            </div>
            <p className={styles.itemLabel} onClick={() => updateSettings({ layout: "collapsed" })}>
              Collapsed
            </p>
          </div>
          <div className='flex flex-col items-start gap-0.5'>
            <div
              className={classnames(styles.itemWrapper, { [styles.active]: settings.layout === "horizontal" })}
              onClick={() => updateSettings({ layout: "horizontal" })}
            >
              <LayoutHorizontal />
            </div>
            <p className={styles.itemLabel} onClick={() => updateSettings({ layout: "horizontal" })}>
              Horizontal
            </p>
          </div>
        </div>
      </div>
      <div className='flex flex-col gap-2'>
        <p className='font-medium'>Content</p>
        <div className='flex items-center gap-4'>
          <div className='flex flex-col items-start gap-0.5'>
            <div
              className={classnames(styles.itemWrapper, {
                [styles.active]: settings.contentWidth === "compact"
              })}
              onClick={() =>
                updateSettings({
                  navbarContentWidth: "compact",
                  contentWidth: "compact",
                  footerContentWidth: "compact"
                })
              }
            >
              <ContentCompact />
            </div>
            <p
              className={styles.itemLabel}
              onClick={() =>
                updateSettings({
                  navbarContentWidth: "compact",
                  contentWidth: "compact",
                  footerContentWidth: "compact"
                })
              }
            >
              Compact
            </p>
          </div>
          <div className='flex flex-col items-start gap-0.5'>
            <div
              className={classnames(styles.itemWrapper, { [styles.active]: settings.contentWidth === "wide" })}
              onClick={() =>
                updateSettings({ navbarContentWidth: "wide", contentWidth: "wide", footerContentWidth: "wide" })
              }
            >
              <ContentWide />
            </div>
            <p
              className={styles.itemLabel}
              onClick={() =>
                updateSettings({ navbarContentWidth: "wide", contentWidth: "wide", footerContentWidth: "wide" })
              }
            >
              Wide
            </p>
          </div>
        </div>
      </div>
      {!disableDirection && (
        <div className='flex flex-col gap-2'>
          <p className='font-medium'>Direction</p>
          <div className='flex items-center gap-4'>
            <Link href={getLocalePath(pathName, "en")}>
              <div className='flex flex-col items-start gap-0.5'>
                <div
                  className={classnames(styles.itemWrapper, {
                    [styles.active]: direction === "ltr"
                  })}
                >
                  <DirectionLtr />
                </div>
                <p className={styles.itemLabel}>
                  Left to Right <br />
                  (English)
                </p>
              </div>
            </Link>
            <Link href={getLocalePath(pathName, "ar")}>
              <div className='flex flex-col items-start gap-0.5'>
                <div
                  className={classnames(styles.itemWrapper, {
                    [styles.active]: direction === "rtl"
                  })}
                >
                  <DirectionRtl />
                </div>
                <p className={styles.itemLabel}>
                  Right to Left <br />
                  (Arabic)
                </p>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default LayoutSection;
