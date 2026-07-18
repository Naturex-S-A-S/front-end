"use client";
import { useTransition, type FC } from "react";

import { useRouter } from "next/navigation";

import { RadioGroup, FormControlLabel, Radio } from "@mui/material";

import { Icon } from "@iconify/react";
import toast from "react-hot-toast";

import CustomCard from "@/@core/components/mui/Card";
import { patchFeedstockDefaultProvider } from "@/api/feedstock";
import { patchPackagingDefaultProvider } from "@/api/packaging";

interface Props {
  data: {
    id: number;
    name: string;
    phone: string | null;
  }[];
  itemId: number;
  type: "feedstock" | "packaging";
  currentProviderId?: number;
}

const Providers: FC<Props> = ({ data, itemId, type, currentProviderId }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEmpty = !Array.isArray(data) || data.length === 0;

  const handleChange = async (providerId: number) => {
    if (isPending || providerId === currentProviderId) return;

    startTransition(async () => {
      try {
        if (type === "feedstock") {
          await patchFeedstockDefaultProvider(itemId, { providerId });
        } else {
          await patchPackagingDefaultProvider(itemId, { providerId });
        }

        toast.success("Proveedor actualizado con éxito");
        router.refresh();
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Error al actualizar proveedor");
      }
    });
  };

  return (
    <CustomCard title='Proveedores'>
      {isEmpty && <span>No hay proveedores disponibles</span>}

      <RadioGroup value={currentProviderId ?? ""} onChange={e => handleChange(Number(e.target.value))}>
        {data?.map(provider => (
          <FormControlLabel
            key={provider.id}
            value={provider.id}
            disabled={isPending}
            control={<Radio />}
            label={
              <div className='flex items-center gap-2'>
                <Icon icon='mdi:account' />
                <span className='font-semibold'>{provider.name}</span>
                {provider.phone && (
                  <span className='text-sm text-gray-500 flex items-center gap-1 ml-2'>
                    <Icon icon='mdi:phone' /> {provider.phone}
                  </span>
                )}
              </div>
            }
          />
        ))}
      </RadioGroup>
    </CustomCard>
  );
};

export default Providers;
