import type { FC } from "react";

import { Checkbox, FormControlLabel, TableCell } from "@mui/material";

interface PermissionCellProps {
  cbId: string;
  checked: boolean;
  onChange: () => void;
  sx?: Record<string, any>;
}

const PermissionCell: FC<PermissionCellProps> = ({ cbId, checked, onChange, sx }) => {
  return (
    <TableCell sx={sx}>
      <FormControlLabel
        label={""}
        sx={{ "& .MuiTypography-root": { color: "text.secondary" } }}
        control={
          <Checkbox
            size='small'
            id={cbId}
            onChange={onChange}
            checked={checked}
          />
        }
      />
    </TableCell>
  );
};

export default PermissionCell;
