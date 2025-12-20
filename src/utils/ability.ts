import { AbilityBuilder, Ability } from "@casl/ability";

import type { Actions, IPermissions } from "@/types/next-auth";

export type AppAbility = Ability<[Actions, any]>;

export default function defineAbilityFor(permissions: IPermissions[], role: string): AppAbility {
    const { can, build } = new AbilityBuilder<AppAbility>(Ability);

    if (role === 'admin') {
        can('manage', 'all');
    }

    const processNode = (node: IPermissions | any, parentSubject?: string) => {
        const nodeName = node.name ?? ''

        const subject = nodeName || 'all'

        if ((node as any).actions) {
            const enabledActions = Object.keys((node as any).actions).filter((a: string) => (node as any).actions[a])

            if (enabledActions.length === 0) return

            if (parentSubject) {
                can(enabledActions as Actions[], parentSubject, nodeName)

                return
            }

            can(enabledActions as Actions[], nodeName)

            return
        }

        if (node.children && Array.isArray(node.children) && node.children.length > 0) {
            node.children.forEach((child: any) => processNode(child, subject))
        }
    };

    if (permissions && permissions.length > 0) {
        permissions.forEach(p => processNode(p));
    }

    return build({
        detectSubjectType: (item: any) => item!.type,
    });
}
