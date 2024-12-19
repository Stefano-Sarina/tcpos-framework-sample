import {convertLanguageCode2Hash} from "./languages";
import type {MessageDescriptor} from 'react-intl';
import {defineMessages} from "react-intl";
import type {I18n} from "../../services/intl/I18n";
import type {LayoutDirection} from "@tcpos/backoffice-core";

/*
type ISingleDictLanguageItem<H = number, K = string> = {
    id: H;
    descr: K;
    code: I18n;
    shortDescription: string;
};
*/

type AllDictLanguageItems<LANG_TYPE extends string, H = number, K = string> = {
    [T in LANG_TYPE]: {id: H, descr: K, code: T, shortDescription: string, defaultDirection: LayoutDirection};
};

const dict = (<R, T>(f: AllDictLanguageItems<I18n, R, T>) => f)({
    "en-US": {id: convertLanguageCode2Hash('en'), descr: "English", code: 'en-US', shortDescription: 'UK', defaultDirection: 'ltr'},
    "de-DE": {id: convertLanguageCode2Hash('de'), descr: "German", code: 'de-DE', shortDescription: 'DE', defaultDirection: 'ltr'},
    "it-IT": {id: convertLanguageCode2Hash('it'), descr: "Italian", code: 'it-IT', shortDescription: 'IT', defaultDirection: 'ltr'},
    //ar: {id: convertLanguageCode2Hash('ar'), descr: "العربية", code: 'ar', shortDescription: 'AR', defaultDirection: 'rtl'},
} as const);

type IDictMessages = typeof dict[I18n]['descr'];
type ISingleDictMessageDefinition = {
    [K in IDictMessages]: {id: K}
};

/*
export const LanguageModel = (id?: number): string => {
    const item = dict.find(el => el.id === id);
    return item?.descr ?? "";
};
*/

const intlMessages = () => {
    defineMessages<IDictMessages, MessageDescriptor, ISingleDictMessageDefinition>({
        "English": {id: "English"},
        "Italian": {id: "Italian"},
        "German": {id: "German"},
        //"العربية": {id: "العربية"},
    });
};

export {dict as LanguageDictionary};

//export const LanguageDictionary1: {code: string, hash: number, description: string, shortDescription: string}[] =
        
   /* [
    {code: 'en', description: 'English', shortDescription: 'UK', hash: convertLanguageCode2Hash('en')},
    {code: 'it', description: 'Italiano', shortDescription: 'IT', hash: convertLanguageCode2Hash('it')},
    {code: 'de', description: 'Deutsch', shortDescription: 'DE', hash: convertLanguageCode2Hash('de')},
];*/
