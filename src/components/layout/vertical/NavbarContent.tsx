"use client";

import classnames from "classnames";

import type { IAlert } from "@/types/alert";
import NavToggle from "./NavToggle";
import ModeDropdown from "@components/layout/shared/ModeDropdown";
import UserDropdown from "@components/layout/shared/UserDropdown";
import NotificationDropdown from "@components/layout/shared/NotificationDropdown";

import { verticalLayoutClasses } from "@layouts/utils/layoutClasses";

interface Props {
  alerts: IAlert[];
}

const NavbarContent = ({ alerts }: Props) => {
  return (
    <div className={classnames(verticalLayoutClasses.navbarContent, "flex items-center justify-between gap-4 is-full")}>
      <div className='flex items-center gap-4'>
        <NavToggle />
        <ModeDropdown />
      </div>
      <div className='flex items-center'>
        <NotificationDropdown initialData={alerts} />
        <UserDropdown />
      </div>
    </div>
  );
};

export default NavbarContent;
