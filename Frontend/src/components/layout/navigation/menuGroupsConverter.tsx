import React from "react";
import type {IMenuGroupModel} from '@tcpos/backoffice-core';
import {FormattedMessage} from "react-intl";

export interface IMenuConverter {
    id: string,
    title: string,
    type: string,
    children: {id: string, title: string, type: string, url: string, icon: string, breadcrumbs: boolean}[]
}

export const MenuGroupsConverter = (menuGroups: Record<string, any>): {items: IMenuConverter[]} => {
    return {
        items: menuGroups.menuGroups.map((group: IMenuGroupModel) => {
            return {
                id: group.id,
                title: <FormattedMessage id={group.label} />,
                type: 'group',
                children: group.entities.map(item => {
                    return {
                        id: item.entityId,
                        title: <FormattedMessage id={item.label} />,
                        type: 'item',
                        url: item.url ?? '/entities/' + item.entityId + "/list",
                        icon: String(item.icon),
                        breadcrumbs: false
                    };
                })
            };
        })
    };
};