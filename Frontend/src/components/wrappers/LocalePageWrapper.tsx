import React, {type PropsWithChildren, useEffect} from "react";
import {useParams} from "react-router";
import {useAppSelector, useSelectLang, useLocaleConfig} from "@tcpos/backoffice-components";
import {useNavigate} from "react-router-dom";
import {LanguageDictionary} from "../../core/businessLogic/languages";
import type {I18n} from "../../core/services/intl";

export const LocalePageWrapper = (props: PropsWithChildren) => {
    const { lang } = useParams();
    const localeLoaded = useAppSelector(state => state.config.localeLoaded);
    const i18n = useAppSelector(state => state.config.languageInfo.lang); //current configuration
    const {selectNewLang} = useSelectLang();
    const localeConfig = useLocaleConfig();
    const navigate = useNavigate();

    useEffect(() => {
        if (localeLoaded) {
            if (lang && lang !== i18n) {
                const newSelectedLang = selectNewLang(
                    Object.keys(LanguageDictionary).map((el) => {return LanguageDictionary[el as I18n].code;}),
                    lang, navigator.language.substring(0,2));
                localeConfig.changeLanguage(newSelectedLang, LanguageDictionary[newSelectedLang as I18n].defaultDirection);
            } else if (!lang) {
                const newSelectedLang = selectNewLang(
                    Object.keys(LanguageDictionary).map((el) => {return LanguageDictionary[el as I18n].code;}),
                    i18n, navigator.language.substring(0,2));
                navigate(`/${newSelectedLang}/home`);
            }
        }
    }, [lang, localeLoaded]);

    return <>
        {props.children}
    </>;
};