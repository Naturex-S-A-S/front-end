"use client";

import { useEffect } from "react";

import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";

const DashboardError = ({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        p: 4
      }}
    >
      <Alert
        severity='error'
        sx={{ maxWidth: 500 }}
        action={
          <Button color='inherit' size='small' onClick={reset}>
            Reintentar
          </Button>
        }
      >
        <Typography variant='h6' gutterBottom>
          Error en el panel
        </Typography>
        <Typography variant='body2'>
          Ha ocurrido un error al cargar esta sección. Por favor, intente nuevamente.
        </Typography>
      </Alert>
    </Box>
  );
};

export default DashboardError;
