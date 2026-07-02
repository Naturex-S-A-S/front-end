"use client";

import { useEffect } from "react";

import { usePathname } from "next/navigation";

import Swal from "@/lib/swal";

const SwalRouteHandler = () => {
  const pathname = usePathname();

  useEffect(() => {
    Swal.close();
  }, [pathname]);

  return null;
};

export default SwalRouteHandler;
