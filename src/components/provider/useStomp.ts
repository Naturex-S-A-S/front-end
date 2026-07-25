"use client";

import { useContext } from "react";

import { StompContext } from "./StompProvider";

export function useStomp() {
  const ctx = useContext(StompContext);

  if (!ctx) {
    throw new Error("useStomp debe usarse dentro de un <StompProvider>");
  }

  return ctx;
}