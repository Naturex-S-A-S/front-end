"use client";

import { Alert, Box, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";

import Loader from "@/@core/components/react-spinners";
import { getCurrentPriceAction } from "@/api/costs/actions";
import { formatCurrency } from "@/utils/format";

interface Props {
  productId: string;
}

const CurrentPriceCard = ({ productId }: Props) => {
  const { data: price, isLoading } = useQuery({
    queryKey: ["current-price", productId],
    queryFn: () => getCurrentPriceAction(productId),
    select: result => result.data,
    enabled: !!productId
  });

  if (isLoading) {
    return (
      <Box py={2} display='flex' justifyContent='center'>
        <Loader type='component' />
      </Box>
    );
  }

  if (!price) return null;

  return (
    <Alert
      severity={price.marginWarning ? "warning" : "info"}
      icon={<Icon icon={price.marginWarning ? "mdi:alert-circle-outline" : "mdi:currency-usd"} fontSize={22} />}
      sx={{ "& .MuiAlert-message": { width: "100%" } }}
    >
      <Box display='flex' flexWrap='wrap' gap={2} alignItems='center' justifyContent='space-between'>
        <Box display='flex' gap={4} flexWrap='wrap'>
          <Box>
            <Typography variant='caption' color='text.secondary'>
              Precio Vigente
            </Typography>
            <Typography variant='h6' fontWeight={700}>
              {formatCurrency(price.finalPrice)}
            </Typography>
          </Box>
          <Box>
            <Typography variant='caption' color='text.secondary'>
              Margen
            </Typography>
            <Typography variant='body2' fontWeight={600} color={price.marginWarning ? "warning.main" : "success.main"}>
              {price.utilityPct.toFixed(2)}%
            </Typography>
          </Box>
          <Box>
            <Typography variant='caption' color='text.secondary'>
              Desde
            </Typography>
            <Typography variant='body2'>{moment(price.effectiveFrom).format("DD/MM/YYYY")}</Typography>
          </Box>
          <Box>
            <Typography variant='caption' color='text.secondary'>
              Registrado por
            </Typography>
            <Typography variant='body2'>{price.nameUser?.split(" ")[0] ?? "—"}</Typography>
          </Box>
        </Box>
        {price.marginWarning && (
          <Typography variant='caption' color='warning.dark' fontWeight={600}>
            Margen por debajo del esperado
          </Typography>
        )}
      </Box>
    </Alert>
  );
};

export default CurrentPriceCard;
