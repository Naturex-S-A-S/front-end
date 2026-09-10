"use client";

import NextLink from "next/link";

import { Breadcrumbs as MuiBreadcrumbs, Stack, Typography } from "@mui/material";

import { Icon } from "@iconify/react";

import BackButton from "@/@core/components/back-button";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type Props = {
  items: BreadcrumbItem[];
  showBackButton?: boolean;
};

const CustomBreadcrumbs: React.FC<Props> = ({ items, showBackButton = true }) => {
  if (!items || items.length === 0) return null;

  return (
    <Stack direction='row' alignItems='center' spacing={1}>
      {showBackButton && <BackButton />}
      <MuiBreadcrumbs separator={<Icon icon='mdi:chevron-right' fontSize={16} />} aria-label='breadcrumb'>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          if (isLast || !item.href) {
            return (
              <Typography key={`${item.label}-${index}`} color='text.primary' variant='body2' noWrap>
                {item.label}
              </Typography>
            );
          }

          return (
            <NextLink key={`${item.label}-${index}`} href={item.href} passHref legacyBehavior>
              <Typography variant='body2' component='a' noWrap>
                {item.label}
              </Typography>
            </NextLink>
          );
        })}
      </MuiBreadcrumbs>
    </Stack>
  );
};

export default CustomBreadcrumbs;
