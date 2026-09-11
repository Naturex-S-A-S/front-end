import { Box, Chip, Stack, Switch, Tooltip } from "@mui/material";

import Loader from "@/@core/components/react-spinners";
import CustomBreadcrumbs from "@/@core/components/mui/Breadcrumbs";
import type { BreadcrumbItem } from "@/@core/components/mui/Breadcrumbs";
import { formatDate } from "@/utils/format";

type Props = {
  id?: string;
  name: string;
  description?: string;
  createdAt?: string;
  active?: boolean;
  handleActive?: (id: any, name: string, active: boolean, validate?: boolean) => void;
  canUpdate?: boolean;
  isPending?: boolean;
  quantity?: number;
  version?: number;
  actions?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
};

const Header: React.FC<Props> = ({
  id,
  name,
  description,
  handleActive,
  active,
  createdAt,
  canUpdate,
  isPending,
  quantity,
  version,
  actions,
  breadcrumbs
}) => {
  return (
    <Stack direction='column' spacing={2}>
      {breadcrumbs && breadcrumbs.length > 0 && <CustomBreadcrumbs items={breadcrumbs} />}
      <Box display='flex' flexDirection='row' justifyContent='space-between' alignItems='flex-start'>
        <div>
          <h1>
            <span>
              {id ? `#${id} - ` : ""} {name}
            </span>
          </h1>
          {description && <p>{description}</p>}
          {createdAt && <p className='text-textSecondary'>Fecha de creación: {formatDate(createdAt)}</p>}
        </div>
        <div className='flex items-center gap-4'>
          {typeof quantity === "number" && Number.isFinite(quantity) && (
            <Chip
              label={quantity && quantity > 0 ? `${quantity} en stock` : "Sin stock"}
              variant='outlined'
              color={quantity && quantity > 0 ? "success" : "error"}
            />
          )}

          {version && <Chip label={`Versión ${version}`} variant='outlined' color='primary' />}

          {actions && <div className='flex items-center gap-2'>{actions}</div>}

          {active !== undefined &&
            canUpdate &&
            (isPending ? (
              <Loader type='component' />
            ) : (
              <div className='flex items-center gap-2'>
                <Chip color={active ? "success" : "error"} label={active ? "Activo" : "Inactivo"} variant='outlined' />
                <Tooltip title=''>
                  <Switch
                    checked={active}
                    onChange={() => handleActive?.(id, name, active, false)}
                    color={active ? "success" : "error"}
                    {...(active ? { slotProps: { input: { "aria-label": "controlled" } } } : {})}
                  />
                </Tooltip>
              </div>
            ))}
        </div>
      </Box>
    </Stack>
  );
};

export default Header;
