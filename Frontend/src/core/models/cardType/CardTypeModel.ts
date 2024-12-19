import type {MessageDescriptor} from 'react-intl';
import {defineMessages} from "react-intl";
import type {ISingleDictItem} from "@tcpos/common-core";

const dict = (<R, T>(f: readonly ISingleDictItem<R, T>[]) => f)([
    {id: 1, descr: "Credit"},
    {id: 2, descr: "Prepayment"},
    {id: 3, descr: "Prepayment and credit"},
    {id: 4, descr: "Credit and prepayment"},
    {id: 5, descr: "Identification only"}
] as const);

type IDictMessages = typeof dict[number]['descr'];
type ISingleDictMessageDefinition = {
    [K in IDictMessages]: {id: K}
};

export const CardTypeModel = (id?: number): string => {
    const item = dict.find(el => el.id === id);
    return item?.descr ?? "";
};

const intlMessages = () => {
    defineMessages<IDictMessages, MessageDescriptor, ISingleDictMessageDefinition>({
        "Credit": {id: "Credit"},
        "Prepayment": {id: "Prepayment"},
        "Prepayment and credit": {id: "Prepayment and credit"},
        "Credit and prepayment": {id: "Credit and prepayment"},
        "Identification only": {id: "Identification only"},
    });
};

export {dict as CardTypeDictionary};