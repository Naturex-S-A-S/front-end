import Button from "@mui/material/Button";

import type { ChildrenType } from "@core/types";

import LayoutWrapper from "@layouts/LayoutWrapper";
import VerticalLayout from "@layouts/VerticalLayout";
import HorizontalLayout from "@layouts/HorizontalLayout";

import Providers from "@components/Providers";
import Navigation from "@components/layout/vertical/Navigation";
import Header from "@components/layout/horizontal/Header";
import Navbar from "@components/layout/vertical/Navbar";
import VerticalFooter from "@components/layout/vertical/Footer";
import HorizontalFooter from "@components/layout/horizontal/Footer";
import ScrollToTop from "@core/components/scroll-to-top";
import SwalRouteHandler from "@/components/SwalRouteHandler";

import { getMode, getSystemMode } from "@core/utils/serverHelpers";
import { getAlertsUserServer } from "@/api/alert/server";

const Layout = async ({ children }: ChildrenType) => {
  const direction = "ltr";
  const mode = getMode();
  const systemMode = getSystemMode();
  const alerts = await getAlertsUserServer();

  return (
    <Providers direction={direction}>
      <LayoutWrapper
        systemMode={systemMode}
        verticalLayout={
          <VerticalLayout
            navigation={<Navigation mode={mode} systemMode={systemMode} />}
            navbar={<Navbar alerts={alerts} />}
            footer={<VerticalFooter />}
          >
            {children}
          </VerticalLayout>
        }
        horizontalLayout={
          <HorizontalLayout header={<Header alerts={alerts} />} footer={<HorizontalFooter />}>
            {children}
          </HorizontalLayout>
        }
      />
      <SwalRouteHandler />
      <ScrollToTop className='mui-fixed'>
        <Button variant='contained' className='is-10 bs-10 rounded-full p-0 min-is-0 flex items-center justify-center'>
          <i className='tabler-arrow-up' />
        </Button>
      </ScrollToTop>
    </Providers>
  );
};

export default Layout;
