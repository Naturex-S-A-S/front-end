import type { IAlert } from "@/types/alert";
import LayoutNavbar from "@layouts/components/vertical/Navbar";
import NavbarContent from "./NavbarContent";

interface Props {
  alerts: IAlert[];
}

const Navbar = ({ alerts }: Props) => {
  return (
    <LayoutNavbar>
      <NavbarContent alerts={alerts} />
    </LayoutNavbar>
  );
};

export default Navbar;
