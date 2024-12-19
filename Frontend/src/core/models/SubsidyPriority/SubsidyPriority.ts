import type {MessageDescriptor} from 'react-intl';
import {defineMessages} from "react-intl";
import type {ISingleDictItem} from "@tcpos/common-core";

const dict = (<R, T>(f: readonly ISingleDictItem<R, T>[]) => f)([
    {id: 1, descr: "1"},
    {id: 2, descr: "2"},
    {id: 3, descr: "3"},
    {id: 4, descr: "4"},
    {id: 5, descr: "5"}
] as const);

type IDictMessages = typeof dict[number]['descr'];
type ISingleDictMessageDefinition = {
    [K in IDictMessages]: {id: K}
}

export const SubsidyPriorityModel = (id?: number): string => {
    const item = dict.find(el => el.id === id);
    return item?.descr ?? "";
};

const intlMessages = () => {
    defineMessages<IDictMessages, MessageDescriptor, ISingleDictMessageDefinition>({
        "1": {id: "1"},
        "2": {id: "2"},
        "3": {id: "3"},
        "4": {id: "4"},
        "5": {id: "5"},
    });
};

export {dict as SubsidyPriorityDictionary};