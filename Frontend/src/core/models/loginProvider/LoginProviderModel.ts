import type {ISingleDictItem} from "@tcpos/common-core";
import type { MessageDescriptor} from "react-intl";
import {defineMessages} from "react-intl";

const dict = (<R, T>(f: readonly ISingleDictItem<R, T>[]) => f)([
    {id: 1, descr: "Microsoft"},
] as const);

type IDictMessages = typeof dict[number]['descr'];
type ISingleDictMessageDefinition = {
    [K in IDictMessages]: {id: K}
};

export const LoginProviderModel = (id?: number): string => {
    const item = dict.find(el => el.id === id);
    return item?.descr ?? "";
};

const intlMessages = () => {
    defineMessages<IDictMessages, MessageDescriptor, ISingleDictMessageDefinition>({
        "Microsoft": {id: "Microsoft"},
    });
};

export {dict as LoginProviderDictionary};