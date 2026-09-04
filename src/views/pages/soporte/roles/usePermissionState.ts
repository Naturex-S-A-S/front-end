import { useEffect, useMemo, useState } from "react";

export const usePermissionState = (roleModules: any[]) => {
  const [selectedCheckbox, setSelectedCheckbox] = useState<string[]>([]);

  const allActionIds = useMemo(() => {
    const ids: string[] = [];

    roleModules?.forEach(role => {
      role.children?.forEach((module: any) => {
        if (module.children && module.children.length > 0) {
          module.children.forEach((item: any) => {
            const actionsObj = item.actions ?? {
              read: false,
              create: false,
              update: false,
              delete: false
            };

            Object.keys(actionsObj).forEach(action => {
              actionsObj[action] && ids.push(`${role.id}-${module.id}-${item.id}-${action}`);
            });
          });
        } else {
          const actionsObj = module.actions ?? {
            read: false,
            create: false,
            update: false,
            delete: false
          };

          Object.keys(actionsObj).forEach(action => {
            actionsObj[action] && ids.push(`${role.id}-${module.id}-${module.id}-${action}`);
          });
        }

        module.actions &&
          Object.keys(module.actions).forEach(action => module.actions[action] && ids.push(`${role.id}-${action}`));
      });
    });

    return ids;
  }, [roleModules]);

  const togglePermission = (id: string) => {
    setSelectedCheckbox(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const resetPermissions = () => {
    setSelectedCheckbox([]);
  };

  useEffect(() => {
    setSelectedCheckbox(allActionIds);
  }, [allActionIds]);

  return { selectedCheckbox, togglePermission, resetPermissions };
};
