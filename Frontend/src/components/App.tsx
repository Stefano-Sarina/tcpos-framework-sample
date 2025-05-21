import type {ReactElement} from "react";
import React, {useEffect, useState} from "react";
import type {IViewConfigModel,} from "@tcpos/backoffice-core";
import {
    ANextBOConfigService,
    NextBOPublicRegistrationContainer,
    loadBaseConfiguration,
    setDirtyData,
    setLoadingStateCompleted,
    store
} from "@tcpos/backoffice-core";
import Routes from "./routes";

import {ConfigProvider} from "./themeComponents/ConfigContext";
import ScrollTop from "./themeComponents/ScrollTop";
import ThemeCustomization from "./themeComponents/ThemeCustomization";
import "./scss/app.scss";
import {AppThemeOverrides} from "./AppThemeOverrides";
/*
import type {FallbackProps} from "react-error-boundary";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle} from "@mui/material";
*/
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import {
    Locales,
    //MenuGenerate,
    RTLLayout,
    StoreProvider, useAppDispatch, useAppSelector,
    NBO_ErrorBoundary,
    NBO_Snackbar
} from "@tcpos/backoffice-components";
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import type {I18n} from "../core/services/intl";
import { MenuGenerate } from "./MenuGenerate";
import {LanguageDictionary} from "../core/businessLogic/languages";



/*
declare module 'notistack' {
    interface VariantOverrides {
        errorWithDetails: {
            detailMsg?: string,
        }
    }
}
*/

/**
 * This is the starting point of the application; it provides all the needed wrappers.
 * The main component provides the following wrappers:
 * - {@link ConfigProvider}
 * - RouterProvider: it uses a _router_ component created by the __createBrowserRouter__ function; the
 * BrowserRouter, from react-router version 6, allows to manage navigation and navigation blocks within the application.
 * - StoreProvider: it creates a context for the store provided by backoffice-core package
 * The other wrappers are provided by the {@link AppInner} component
 * @param children
 * @category Components
 */
export const App = ({children}:{children:ReactElement}): JSX.Element => {

    /**
     * Creation of a BrowserRouter (new data router from react-router version 6)
     */
    const router = createBrowserRouter([
        // match everything with "*"
        {
            path: "*",
            Component: () => {
                return <>{children}</>;
            }
        },
    ]);

    /**
     * Wrap everything in the ConfigProvider and RouterProvider
     */
    return (
            <StoreProvider store={store}>
                <ConfigProvider>
                    <RouterProvider router={router} />
                </ConfigProvider>
            </StoreProvider>
    );
};

/**
 * Inner wrapper component of the application. It provides:
 * - {@link ThemeCustomization} wrapper: it defines the theme configuration
 * - {@link RTLLayout} wrapper: it manages the theme mode ('LTR' or 'RTL')
 * - {@link ThemeOverrides} wrapper: specific UI customization
 * - {@link NBO_Snackbar}: component which provides a snackbar for the whole application
 * - {@link NBO_ErrorBoundary}: application errors management
 * - {@link Locales}: provides localization
 * - {@link ScrollTop} component
 * A Backdrop component provides a waiting state with a CircularProgress icon; then, the {@link MenuGenerate} component
 * provides the menu items to show and, at the end, there is a {@link Routes} component which manages the application routes.
 * @category Components
 */
export const AppInner = () => {

    const appStore = store;
    /**
     * Connection to store actions
     */
    const dispatch = useAppDispatch();

    /**
     * Tracks the state of the application (from the store)
     * - step: application phase
     * - completed: true when the phase is completed
     */
    const loadingState: { step: string, completed: boolean }[] = useAppSelector((state) => {
        return state.loadingState ?? [];
    });

    /**
     * Layout direction (from the store): 'ltr' or 'rtl'
     */
    const themeDirection = useAppSelector(state => state.config.layoutDirection);

    /**
     * Current language (from the store)
     */
    const i18n = useAppSelector(state => state.config.languageInfo.lang);

    /**
     * Check locale loading status (the application can't start before loading is completed)
     */
    const localeLoaded = useAppSelector(state => state.config.localeLoaded);

    //const pluginList = useAppSelector((state) => state.pluginsConfig);

    /**
     * True when the base interface configuration has been loaded
     */
    const [baseInterfaceConfigLoaded, setBaseInterfaceConfigLoaded] = useState<boolean>(false);

    /**
     * Interface configuration
     */
    const [interfaceConfig, setInterfaceConfig] = useState<IViewConfigModel<I18n>>({
        loginConfiguration: {simpleLogin: false, loginWithGoogle: false, loginWithMicrosoft: false, loginWithTcPos: false},
        apiUrl: "", defaultLang: "en-US", menuGroups: [], uiVersion: "", applicationName: ""
    });

    /**
     * Loads the interface configuration from a json file
     * Set dirtyData to false in the store (to avoid "data not saved" warnings)
     */
    useEffect(() => {
        const fetchBaseInterfaceConfig = async () => {
            const myConfig: IViewConfigModel<I18n> = await NextBOPublicRegistrationContainer.resolve(ANextBOConfigService)
                .getInterfaceConfig("/config/", "configViewMenuGroups.json");
            setBaseInterfaceConfigLoaded(true);
            setInterfaceConfig(myConfig);
        };
        fetchBaseInterfaceConfig();
        dispatch(setDirtyData(false));
    }, []);

    /**
     * After the interface configuration has been loaded, set baseInterfaceConfigLoaded to true
     * and stores the configuration; update the loading stat
     */
    useEffect(() => {
        if (baseInterfaceConfigLoaded && interfaceConfig.applicationName !== "") {
            dispatch(loadBaseConfiguration(interfaceConfig));
            dispatch(setLoadingStateCompleted({step: 'jsonConfigFiles'}));
            window.dispatchEvent(new Event("PluginLoaded")); // TODO check plugin management
        }
    }, [/*pluginList,*/ baseInterfaceConfigLoaded, interfaceConfig]);

    return (
        <ThemeCustomization>
            <RTLLayout themeDirection={themeDirection}>
                <AppThemeOverrides>
                    <NBO_Snackbar>
                        <NBO_ErrorBoundary>
                            <Locales i18n={i18n} themeDirection={themeDirection}
                                        langList={Object.keys(LanguageDictionary).map((el) => {return LanguageDictionary[el as I18n].code;})}
                                >
                                <ScrollTop>
                                    <>
                                        <Backdrop
                                            sx={{color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1}}
                                            open={loadingState.find(el => !el.completed) !== undefined}
                                        >
                                            <CircularProgress color="inherit"/>
                                        </Backdrop>
                                        {
                                            localeLoaded && !loadingState.find(el => !el.completed) ?
                                                <>
                                                    <MenuGenerate>
                                                        <Routes/>
                                                    </MenuGenerate>
                                                </>
                                                :
                                                null
                                        }
                                    </>
                                </ScrollTop>
                            </Locales>
                        </NBO_ErrorBoundary>
                    </NBO_Snackbar>
                </AppThemeOverrides>

            </RTLLayout>
        </ThemeCustomization>
    );
};
