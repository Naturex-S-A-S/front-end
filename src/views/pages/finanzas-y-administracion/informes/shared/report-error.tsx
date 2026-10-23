"use client";

import { useRouter } from "next/navigation";

import { Alert, Button } from "@mui/material";

interface Props {
  message: string;
}

export default function ReportError({ message }: Props) {
  const router = useRouter();

  return (
    <Alert
      severity='error'
      action={
        <Button color='inherit' size='small' onClick={() => router.refresh()}>
          Reintentar
        </Button>
      }
    >
      {message}
    </Alert>
  );
}
