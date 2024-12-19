import React, {useEffect} from "react";
import {
    DailyPublicRegistrationContainer,
    setLogged,
    setUIGenericState,
    setVisibilities,
    store,
    ADailyApiClient
} from "@tcpos/backoffice-core";
import {useAppSelector} from "@tcpos/backoffice-components";
import {useNavigate} from "react-router-dom";
import {useIntl} from "react-intl";
import {useParams} from "react-router";
import { PermissionLogic } from "../../core/businessLogic/permissions/PermissionLogic";

enum uiStateEnum {
    startingVersionUpdate,
    versionUpdateStarted,
    noUpdateNeeded
}

const AfterLoginVerification = () => {
    const apiClient = DailyPublicRegistrationContainer.resolve(ADailyApiClient);
    const navigate = useNavigate();
    //const loading = useAppSelector((state) => state.operator.loading);
    const initialized = useAppSelector((state) => state.user.initialized);
    const loggedIn = useAppSelector((state) => state.user.loggedIn);
    const autoRedirectUrl = useAppSelector((state) => state.user.autoRedirect);
    const dispatch = store.dispatch;
    const intl = useIntl();
    const { lang } = useParams();

    const apiUrl = useAppSelector(state => state.interfaceConfig.apiUrl);
    const menuGroups = useAppSelector(state => state.interfaceConfig.menuGroups);
    const interfaceConfig = useAppSelector(state => state.interfaceConfig);
    const senderName = "afterLoginVerificationComponent";
    const uiState = useAppSelector(state =>
        state.appState.uiGenericState.find(el => el.sender === senderName)?.data['state']
    );
    let response: any;
    const pluginList = useAppSelector((state) => state.pluginsConfig);

    useEffect(() => {
        const checkPermissions = async () => {
            response = await apiClient.get(`${apiUrl}/adwebentityversion`, {}, false, true);
            if (!response) {
                //throw new Error('Invalid response to permissions version request.');
            }
            if (response.type === 'Unauthorized') {
                navigate('/login');
            }
            const versionCompare = await PermissionLogic.checkUIPermissionVersion();
            if (versionCompare.status === 'error' || versionCompare.status === 'oldLocalVersion') {
                throw new Error("Error when retrieving permissions version: " + versionCompare.message);
            }
            if (versionCompare.status === 'oldRemoteVersion') {
                dispatch(setUIGenericState({sender: senderName, data: {state: uiStateEnum.startingVersionUpdate}}));
            } else {
                dispatch(setUIGenericState({sender: senderName, data: {state: uiStateEnum.noUpdateNeeded}}));
            }
        };
        checkPermissions();
        const getUserinfo = async () => {
            try {
                response = await apiClient.get('/connect/userinfo', {}, false, true);
                dispatch(setLogged({logged: true, name: response.Subject ?? ""})); // This function also sets initialized = true
            } catch {
                dispatch(setLogged({logged: false})); // This function also sets initialized = true
            }
            try {
                response = await apiClient.get(`${apiUrl}/readonlyvisibilities`, {}, false,     true);
                if (response.fullAccessVisibilities) {
                    dispatch(setVisibilities(response));
                } else {
                    dispatch(setVisibilities({fullAccessVisibilities: [], readOnlyVisibilities: []}));
                }
            } catch {
                dispatch(setVisibilities({fullAccessVisibilities: [], readOnlyVisibilities: []}));
            }
        };
        getUserinfo();
    }, []);

    useEffect(() => {
        const getPermissionTree = async () => {
            return await PermissionLogic.getUIPermissionTree();
        };
        const updatePermissionTree = async () => {
            const permissionTree = await getPermissionTree(); // PermissionLogic.getUIPermissionTree();
            await apiClient.post(`${apiUrl}/FormsEndpoints`, permissionTree);
        };
        if (uiState === uiStateEnum.startingVersionUpdate) {
            dispatch(setUIGenericState({sender: senderName, data: {state: uiStateEnum.versionUpdateStarted}}));
            updatePermissionTree();
        }
    }, [apiClient, apiUrl, dispatch, uiState]);

    useEffect(() => {
        if (initialized && uiState && (
                uiState === uiStateEnum.versionUpdateStarted ||
                uiState === uiStateEnum.noUpdateNeeded
        )) {
            if (loggedIn) {
                if (autoRedirectUrl.url !== "") {
                    navigate({
                        pathname: autoRedirectUrl.url,
                        search: autoRedirectUrl.qstr
                    });
                } else {
                    navigate(`/${lang}/home`);
                }
            } else {
                navigate(`/${lang}/login`);
            }
        }
    }, [autoRedirectUrl.qstr, autoRedirectUrl.url, initialized, lang, loggedIn, navigate, uiState]);

    return <div>{intl.formatMessage({id: "Check identity"})}...</div>;
};

export default AfterLoginVerification;