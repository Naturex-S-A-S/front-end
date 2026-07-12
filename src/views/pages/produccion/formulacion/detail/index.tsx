import { useState } from "react";

import { Grid } from "@mui/material";

import { Icon } from "@iconify/react";

import CustomCard from "@/@core/components/mui/Card";
import type { IFormulation } from "@/types/pages/formulation";
import Versions from "./versions";
import Products from "./products";
import CustomButton from "@/@core/components/mui/Button";
import AddProduct from "./addProduct";

interface Props {
  formulation: IFormulation;
}

const Detail: React.FC<Props> = ({ formulation }) => {
  const [open, setOpen] = useState(false);

  const toogleDialog = () => {
    setOpen(!open);
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={8}>
        <CustomCard title='Historial de versiones'>
          <Versions data={formulation.versions} formulationId={formulation.id} />
        </CustomCard>
      </Grid>
      <Grid item xs={12} sm={4}>
        <CustomCard
          title='Productos'
          action={
            <CustomButton size='small' startIcon={<Icon icon='mdi:plus' />} onClick={toogleDialog} isLoading={false}>
              Agregar
            </CustomButton>
          }
        >
          <Products products={formulation.productFormulations} formulationId={formulation.id} />
        </CustomCard>
      </Grid>
      <AddProduct open={open} toogleDialog={toogleDialog} formulationId={formulation.id} />
    </Grid>
  );
};

export default Detail;
