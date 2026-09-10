"use client";

import { Grid, Stack, Typography } from "@mui/material";
import { Icon } from "@iconify/react";

import CustomCard from "./Card";

interface MetricItem {
  icon: string;
  label: string;
  value: string | number;
  gridItemProps?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
}

interface MetricCardGroupProps {
  items: MetricItem[];
  gridItemProps?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
}

const MetricCardGroup: React.FC<MetricCardGroupProps> = ({ items, gridItemProps }) => {
  const { xs = 12, sm = 6, md = 3, lg } = gridItemProps ?? {};

  return (
    <Grid container spacing={4}>
      {items.map((item, index) => {
        const { xs: iXs = xs, sm: iSm = sm, md: iMd = md, lg: iLg = lg } = item.gridItemProps ?? {};

        return (
          <Grid item key={index} xs={iXs} sm={iSm} md={iMd} lg={iLg}>
            <CustomCard className='h-full flex justify-center items-center'>
              <Stack spacing={1.5} textAlign='center'>
                <Stack direction='row' spacing={1} alignItems='center' justifyContent='center'>
                  <Icon icon={item.icon} fontSize={20} className='text-gray-500' />
                  <Typography variant='body2' color='text.secondary'>
                    {item.label}
                  </Typography>
                </Stack>
                <Typography variant='h3' fontWeight={700} color='primary.main'>
                  {item.value}
                </Typography>
              </Stack>
            </CustomCard>
          </Grid>
        )
      })}
    </Grid>
  );
};

export default MetricCardGroup;
