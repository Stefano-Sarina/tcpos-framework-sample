import type {MessageDescriptor} from 'react-intl';
import {defineMessages} from "react-intl";
import type {ISingleDictItem} from "@tcpos/common-core";

const dict = (<R, T>(f: readonly ISingleDictItem<R, T>[]) => f)([
    {id: 0, descr: "Not available"},
    {id: 1, descr: "Precollect"},
    {id: 2, descr: "Postcollect"}
] as const);

type IDictMessages = typeof dict[number]['descr'];
type ISingleDictMessageDefinition = {
    [K in IDictMessages]: {id: K}
};

export const PrepayModeModel = (id?: number): string => {
    const item = dict.find(el => el.id === id);
    return item?.descr ?? "";
};

const intlMessages = () => {
    defineMessages<IDictMessages, MessageDescriptor, ISingleDictMessageDefinition>({
        "Not available": {id: "Not available"},
        "Precollect": {id: "Precollect"},
        "Postcollect": {id: "Postcollect"},
    });
};

export {dict as PrepayModeDictionary};