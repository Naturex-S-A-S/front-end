"use client";

import type { IAlert } from "@/types/alert";

import Navigation from "./Navigation";
import NavbarContent from "./NavbarContent";
import Navbar from "@layouts/components/horizontal/Navbar";
import LayoutHeader from "@layouts/components/horizontal/Header";

import useHorizontalNav from "@menu/hooks/useHorizontalNav";

interface Props {
  alerts: IAlert[];
}

const Header = ({ alerts }: Props) => {
  const { isBreakpointReached } = useHorizontalNav();

  return (
    <>
      <LayoutHeader>
        <Navbar>
          <NavbarContent alerts={alerts} />
        </Navbar>
        {!isBreakpointReached && <Navigation />}
      </LayoutHeader>
      {isBreakpointReached && <Navigation />}
    </>
  );
};

export default Header;
