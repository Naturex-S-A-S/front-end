import type { FC } from "react";
import { Fragment } from "react";

import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip } from "@mui/material";

import type { Theme } from "@mui/material/styles";

import { Icon } from "@iconify/react";

import Loader from "@/@core/components/react-spinners";
import PermissionCell from "./PermissionCell";

interface PermissionTableProps {
  roleModules: any[];
  selectedCheckbox: string[];
  togglePermission: (id: string) => void;
  isLoadingQuery?: boolean;
}

const COLUMN_HEADERS = ["Leer", "Crear", "Editar", "Eliminar"];

const PermissionTable: FC<PermissionTableProps> = ({ roleModules, selectedCheckbox, togglePermission, isLoadingQuery }) => {
  return (
    <TableContainer>
      <Table size='small'>
        <TableHead>
          <TableRow>
            <TableCell sx={{ pl: "5px !important" }}>
              <Box
                sx={{
                  display: "flex",
                  whiteSpace: "nowrap",
                  alignItems: "center",
                  textTransform: "capitalize",
                  "& svg": { ml: 1, cursor: "pointer" },
                  color: theme => theme.palette.text.secondary,
                  fontSize: theme => theme.typography.h6.fontSize
                }}
              >
                Módulos
                <Tooltip placement='top' title='Permitir o denegar todos los permisos'>
                  <Box sx={{ display: "flex" }}>
                    <Icon icon='tabler:info-circle' fontSize='1.25rem' />
                  </Box>
                </Tooltip>
              </Box>
            </TableCell>
            {COLUMN_HEADERS.map(header => (
              <TableCell key={header}>
                <Box
                  sx={{
                    textTransform: "capitalize",
                    color: theme => theme.palette.text.secondary,
                    fontSize: theme => theme.typography.h6.fontSize
                  }}
                >
                  {header}
                </Box>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {isLoadingQuery && (
            <TableRow>
              <TableCell colSpan={5}>
                <Loader type='component' />
              </TableCell>
            </TableRow>
          )}

          {roleModules?.map((role, rIndex) => (
            <Fragment key={role.id ?? rIndex}>
              <TableRow>
                <TableCell
                  colSpan={5}
                  sx={{
                    pl: "5px !important",
                    fontWeight: 700,
                    backgroundColor: theme => theme.palette.action.hover,
                    textTransform: "capitalize"
                  }}
                >
                  {role.name}
                </TableCell>
              </TableRow>

              {role.children?.map((module: any) => (
                <Fragment key={`${role.id}-${module.id}`}>
                  {!module.children || module.children.length === 0 ? (
                    <TableRow key={`${role.id}-${module.id}-${module.id}`}>
                      <TableCell
                        sx={{
                          pl: "20px !important",
                          fontWeight: 600,
                          backgroundColor: theme => theme.palette.action.selected,
                          textTransform: "capitalize"
                        }}
                      >
                        {module.name}
                      </TableCell>

                      {(() => {
                        const actionsObj = module.actions ?? {
                          read: false,
                          create: false,
                          update: false,
                          delete: false
                        };

                        return Object.keys(actionsObj).map((action: string) => {
                          const cbId = `${role.id}-${module.id}-${module.id}-${action}`;

                          return (
                            <PermissionCell
                              key={cbId}
                              cbId={cbId}
                              checked={selectedCheckbox.includes(cbId)}
                              onChange={() => togglePermission(cbId)}
                              sx={{ backgroundColor: (theme: Theme) => theme.palette.action.selected }}
                            />
                          );
                        });
                      })()}
                    </TableRow>
                  ) : (
                    <>
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          sx={{
                            pl: "20px !important",
                            fontWeight: 600,
                            backgroundColor: theme => theme.palette.action.selected,
                            textTransform: "capitalize"
                          }}
                        >
                          {module.name}
                        </TableCell>
                      </TableRow>

                      {module.children?.map((item: any) => {
                        const actionsObj = item.actions ?? {
                          read: false,
                          create: false,
                          update: false,
                          delete: false
                        };

                        return (
                          <TableRow key={`${role.id}-${module.id}-${item.id}`}>
                            <TableCell
                              sx={{
                                pl: "40px !important",
                                backgroundColor: (theme: Theme) => theme.palette.action.hover,
                                fontWeight: 500,
                                whiteSpace: "nowrap"
                              }}
                            >
                              {item.name}
                            </TableCell>

                            {Object.keys(actionsObj).map((action: string) => {
                              const cbId = `${role.id}-${module.id}-${item.id}-${action}`;

                              return (
                                <PermissionCell
                                  key={cbId}
                                  cbId={cbId}
                                  checked={selectedCheckbox.includes(cbId)}
                                  onChange={() => togglePermission(cbId)}
                                  sx={{ backgroundColor: (theme: Theme) => theme.palette.action.hover }}
                                />
                              );
                            })}
                          </TableRow>
                        );
                      })}
                    </>
                  )}
                </Fragment>
              ))}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PermissionTable;
