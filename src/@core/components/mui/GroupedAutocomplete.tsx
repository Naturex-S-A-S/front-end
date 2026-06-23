import { forwardRef, useMemo } from "react";

import Paper from "@mui/material/Paper";
import Autocomplete from "@mui/material/Autocomplete";

const defaultRenderGroup = (params: any) => (
  <li key={params.key}>
    <div
      style={{
        fontWeight: 600,
        fontSize: "0.75rem",
        lineHeight: "1.25rem",
        padding: "4px 16px",
        backgroundColor: "rgb(245, 245, 245)",
        color: "rgb(100, 100, 100)",
        textTransform: "uppercase",
        letterSpacing: "0.05em"
      }}
    >
      {params.group}
    </div>
    <ul style={{ padding: 0 }}>{params.children}</ul>
  </li>
);

interface IGroupedAutocompleteProps {
  groups: Array<any>;
  groupLabelKey?: string;
  groupOptionsKey: string;
  getOptionLabel: (option: any) => string;
  onChange: (event: any, value: any) => void;
  multiple?: boolean;
  value?: any;
  renderGroup?: (params: any) => React.ReactNode;
  renderInput: (params: any) => React.ReactNode;
}

const GroupedAutocomplete = forwardRef((props: IGroupedAutocompleteProps, ref: any) => {
  const { groups, groupLabelKey = "name", groupOptionsKey, ...rest } = props;

  const getKey = (opt: any) => opt?.id ?? opt?.value ?? null;
  const multiple = props.multiple ?? false;
  const value = multiple ? props.value ?? [] : props.value ?? null;

  const flattenGroups = useMemo(() => {
    if (!groups) return [];

    return groups.flatMap((g: any) => {
      const label = g?.[groupLabelKey] ?? "";
      const items = g?.[groupOptionsKey] ?? [];

      return items.map((item: any) => ({ ...item, _group: label }));
    });
  }, [groups, groupLabelKey, groupOptionsKey]);

  const groupByFn = groups ? (option: any) => option?._group ?? "" : undefined;
  const renderGroupFn = groups ? rest.renderGroup || defaultRenderGroup : undefined;

  return (
    <Autocomplete
      getOptionLabel={(option: any) => option?.name || option?.label || ""}
      {...(rest as any)}
      options={flattenGroups}
      {...(groups ? { groupBy: groupByFn } : {})}
      value={value}
      getOptionKey={(option: any) => option?.id || option?.value || ""}
      isOptionEqualToValue={(option: any, value: any) => getKey(option) === getKey(value)}
      PaperComponent={p => <Paper {...p} />}
      ref={ref}
      renderGroup={renderGroupFn}
    />
  );
});

export default GroupedAutocomplete;
