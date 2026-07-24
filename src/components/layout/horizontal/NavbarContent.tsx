"use client";

import classnames from "classnames";

import type { IAlert } from "@/types/alert";
import NavToggle from "./NavToggle";
import Logo from "@components/layout/shared/Logo";
import ModeDropdown from "@components/layout/shared/ModeDropdown";
import UserDropdown from "@components/layout/shared/UserDropdown";
import NotificationDropdown from "../shared/NotificationDropdown";

import useHorizontalNav from "@menu/hooks/useHorizontalNav";

import { horizontalLayoutClasses } from "@layouts/utils/layoutClasses";

interface Props {
  alerts: IAlert[];
}

const NavbarContent = ({ alerts }: Props) => {
  const { isBreakpointReached } = useHorizontalNav();

  return (
    <div
      className={classnames(horizontalLayoutClasses.navbarContent, "flex items-center justify-between gap-4 is-full")}
    >
      <div className='flex items-center gap-4'>
        <NavToggle />
        {!isBreakpointReached && <Logo />}
      </div>
      <div className='flex items-center'>
        <ModeDropdown />
        <NotificationDropdown initialData={alerts} />
        <UserDropdown />
      </div>
    </div>
  );
};

export default NavbarContent;
