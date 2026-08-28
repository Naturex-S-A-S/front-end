"use client";

import { Box, Card, CardContent, Chip, Grid, Typography } from "@mui/material";
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
      <Box py={4} display='flex' justifyContent='center'>
        <Loader type='component' />
      </Box>
    );
  }

  if (!price) return null;

  const hasWarning = price.marginWarning;

  return (
    <Card
      elevation={0}
      sx={{
        borderLeft: 4,
        borderColor: hasWarning ? "warning.main" : "success.main",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
        }
      }}
    >
      <CardContent sx={{ py: 3, px: 4 }}>
        <Box display='flex' alignItems='center' gap={1.5} mb={3}>
          <Icon
            icon={hasWarning ? "mdi:alert-circle" : "mdi:cash-check"}
            fontSize={22}
            color={hasWarning ? "#ed6c02" : "#2e7d32"}
          />
          <Typography variant='h5' fontWeight={500}>
            Precio Vigente
          </Typography>
          {hasWarning && (
            <Chip
              label='Margen bajo'
              size='small'
              color='warning'
              sx={{ height: 20, fontSize: "0.7rem", fontWeight: 600 }}
            />
          )}
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant='h5' color='text.secondary' display='block' mb={0.5}>
                Precio
              </Typography>
              <Typography variant='h5' fontWeight={700} color='text.primary'>
                {formatCurrency(price.finalPrice)}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant='h5' color='text.secondary' display='block' mb={0.5}>
                Utilidad
              </Typography>
              <Typography variant='h6' fontWeight={600} color={hasWarning ? "warning.main" : "success.main"}>
                {price.utilityPct.toFixed(2)}%
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant='h5' color='text.secondary' display='block' mb={0.5}>
                Vigente desde
              </Typography>
              <Typography variant='body1' fontWeight={500}>
                {moment(price.effectiveFrom).format("DD/MM/YYYY")}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box>
              <Typography variant='h5' color='text.secondary' display='block' mb={0.5}>
                Registrado por
              </Typography>
              <Typography variant='body1' fontWeight={500}>
                {price.nameUser?.split(" ")[0] ?? "—"}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {hasWarning && (
          <Box mt={3} p={1.5} borderRadius={1} display='flex' alignItems='center' gap={1}>
            <Icon icon='mdi:information-outline' fontSize={18} color='warning.dark' />
            <Typography variant='h6' color='warning.dark' fontWeight={500}>
              El margen se encuentra por debajo del esperado
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default CurrentPriceCard;
