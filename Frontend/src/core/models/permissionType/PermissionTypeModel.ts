import type {MessageDescriptor} from 'react-intl';
import {defineMessages} from "react-intl";
import type {ISingleDictItem} from "@tcpos/common-core";

const dict = (<R, T>(f: readonly ISingleDictItem<R, T>[]) => f)([
    {id: 1, descr: "(Not set)"},
    {id: 2, descr: "Deny"},
    {id: 3, descr: "Allow"},
] as const);

type IDictMessages = typeof dict[number]['descr'];
type ISingleDictMessageDefinition = {
    [K in IDictMessages]: {id: K}
};

export const PermissionTypeModel = (id?: number): string => {
    const item = dict.find(el => el.id === id);
    return item?.descr ?? "";
};

const intlMessages = () => {
    defineMessages<IDictMessages, MessageDescriptor, ISingleDictMessageDefinition>({
        "(Not set)": {id: "(Not set)"},
        "Deny": {id: "Deny"},
        "Allow": {id: "Allow"},
    });
};

export {dict as PermissionTypeDictionary};