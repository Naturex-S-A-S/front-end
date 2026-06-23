"use client";

import { useOptimistic } from "react";

import { Chip, Switch, Tooltip } from "@mui/material";
import toast from "react-hot-toast";

import { useAbility } from "@/hooks/casl/useAbility";
import { ABILITY_SUBJECT, ABILITY_FIELDS, ABILITY_ACTIONS } from "@/utils/constant";
import { togglePackagingActive } from "@/api/packaging/actions";

type Props = {
  id: string;
  active: boolean;
};

export default function HeaderToggle({ id, active }: Props) {
  const ability = useAbility();
  const canUpdate = ability.can(ABILITY_ACTIONS.UPDATE as any, ABILITY_SUBJECT.PACKAGING, ABILITY_FIELDS.LISTADO);
  const [optimisticActive, addOptimisticActive] = useOptimistic(active, (_, next: boolean) => next);

  const handleToggle = async () => {
    const nextActive = !optimisticActive;

    addOptimisticActive(nextActive);
    const result = await togglePackagingActive(id, nextActive);

    if (!result.success) {
      toast.error(result.error || "Error al actualizar el material de empaque");
    }
  };

  if (!canUpdate) {
    return (
      <Chip
        color={optimisticActive ? "success" : "error"}
        label={optimisticActive ? "Activo" : "Inactivo"}
        size='medium'
      />
    );
  }

  return (
    <div className='flex items-center gap-2'>
      <Chip
        color={optimisticActive ? "success" : "error"}
        label={optimisticActive ? "Activo" : "Inactivo"}
        size='medium'
      />
      <Tooltip title=''>
        <Switch
          checked={optimisticActive}
          onChange={handleToggle}
          color={optimisticActive ? "success" : "error"}
          {...(optimisticActive ? { slotProps: { input: { "aria-label": "controlled" } } } : {})}
        />
      </Tooltip>
    </div>
  );
}
