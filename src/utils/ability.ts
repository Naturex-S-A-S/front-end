import { AbilityBuilder, Ability } from "@casl/ability";

import type { Actions, IPermissions } from "@/types/next-auth";

export type AppAbility = Ability<[Actions, any]>;

export default function defineAbilityFor(permissions: IPermissions[]) {
    const { can, build } = new AbilityBuilder<AppAbility>(Ability);

    /*
        if (user.role === 'admin') {
            can('manage', 'all'); // Con esto tiene permiso a todo el sistema
        } else {
            can('read', 'all');
        }
    */

    const processNode = (node: IPermissions | any, parentName?: string) => {
        const subject = node.name || parentName || "all";

        if ((node as any).actions) {
            const actions = Object.keys((node as any).actions);

            actions.forEach((action: any) => can(action, subject));

            return;
        }

        if (node.children && Array.isArray(node.children) && node.children.length > 0) {
            node.children.forEach((child: any) => processNode(child, subject));
        }
    };

    if (permissions && permissions.length > 0) {
        permissions.forEach(p => processNode(p));
    }

    return build({
        detectSubjectType: (item: any) => item!.type,
    });
}
