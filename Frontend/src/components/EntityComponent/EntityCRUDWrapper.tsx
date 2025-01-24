import React, {useEffect, useMemo, useState} from "react";
import type {AERObjectController} from "@tcpos/backoffice-core";
import {
    DailyPublicRegistrationContainer,
    setMultipleObject,
    setNewObject,
} from "@tcpos/backoffice-core";
import {RawCRUDWrapper, useAppDispatch, useAppSelector} from "@tcpos/backoffice-components";
import type {CRUDWrapperProps} from "@tcpos/backoffice-components";
import {
    DataConflictAutoMergesStates,
    DataConflictStoreEntities,
} from "../interfaceLogics/dataConflicts/DataConflictStates";
import {EntityMainComponent} from "./EntityMainComponent";
import {enqueueSnackbar} from "notistack";
import {useIntl} from "react-intl";
import {
    type EntityType,
    type IEntityDataMainObject,
    type IEntityDataObjectAdditionalAttributes,
    rwModes
} from "@tcpos/common-core";
import {useNavigate, useParams} from "react-router-dom";
import { PermissionLogic } from "../../core/businessLogic/permissions/PermissionLogic";

/**
 * the standard wrapper to bind webdaily entity fields to the context
 * @param entityName
 * @param objectId
 * @param rwMode
 * @constructor
 */
export const EntityCRUDWrapper = React.memo(({objectName, objectId, rwMode, ver, standardRenderer}: CRUDWrapperProps) => {
    const {entityName, lang} = useParams();
    const dispatch = useAppDispatch();
    // entityDataContext used in case of single editing
    const entityDataContext = useAppSelector(state =>
        state.dataObjectSlice.objects.find(el => el.objectName === objectName && el.objectId === objectId));
    const applicationName = useAppSelector(state => state.interfaceConfig.applicationName);
    const apiUrl = useAppSelector(state => state.interfaceConfig.apiUrl);

    // multiEditingId used in case of multiple editing
    const [multiEditing, setMultiEditing] = useState<boolean>(false);

    const intl = useIntl();
    if (!DailyPublicRegistrationContainer.isBound( "objectControllers", objectName)) {
        throw (intl.formatMessage({id: `No registration found for '${objectName}' object controller`}));
    }

/*
    const objectController1 = useMemo(() => {
        return DailyPublicRegistrationContainer.isBound(objectName + "ObjectController")
            ? DailyPublicRegistrationContainer.resolveObjectController(objectName)
            : undefined;
    }, [objectName]);
*/
    const objectControllerRegistration = useMemo(() => {
        return DailyPublicRegistrationContainer.isBound( "objectControllers", objectName)
            ? DailyPublicRegistrationContainer.resolveEntry("objectControllers",  objectName).controller
            : undefined;
    }, [objectName]);

    const objectController = useMemo(() => {
        if (objectControllerRegistration) {
            return DailyPublicRegistrationContainer.resolveConstructor(objectControllerRegistration) as AERObjectController<any, any>;
        } else {
            return undefined;
        }
    }, [objectName, objectControllerRegistration]);

    const userReadOnlyVisibilities = useAppSelector((state) =>
        state.user?.visibilities.readOnlyVisibilities);

    const [validatorLoaded, setValidatorLoaded] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [readOnly, setReadOnly] = useState<boolean>(false);

    if (!objectController) {
        throw 'Error: no data controller found for this entity';
    }
    const navigate = useNavigate();

/*
    const accessPermission = useAppSelector(state =>
        state.dataObjectSlice.objects.find(el => el.objectName === objectName && el.objectId === objectId)?.componentPermissions?.find(el =>
            el.componentName === "MainObject"
        )
    );

    useEffect(() => {
        if (accessPermission?.access === 'Read' && rwMode === rwModes.W) {
            navigate(`/${lang}/entities/${objectName}/detail/${objectId}?mode=R`);
        }
    }, [accessPermission]);
*/




/*
    useEffect(() => {
        const getUiPermission = async () => {
            const uiPermissions = await objectController.getPermissions( 'webdaily', objectName);
            dispatch(setPermissions(uiPermissions.map(el => ({code: el.componentName, type: el.access}))));

        };
        getUiPermission();
    }, []);
*/


    const Renderer = useMemo(() => {
        /**
         * test if a custom page is defined TODO add custom page registration
         */
        return standardRenderer ?? EntityMainComponent;
/*
        const CustomPage = DailyPublicRegistrationContainer.isBound(objectName + "CustomPage") && dailyIocContainer.resolve<React.FC>(objectName + "CustomPage");
        return !CustomPage
                ? (standardRenderer ?? EntityMainComponent)
                : () => <div><CustomPage/></div>;
*/
    }, [objectName, ver]);


    const activateLoading = (activate: boolean) => {
        setLoading(activate);
    };

    useEffect(() => {
        if (objectController) {
            const getData = async () => {
                setLoading(true);
                if (objectId.indexOf('|') === -1) {
                    // Single (normal) editing
                    const newObject = Number(objectId) > 0
                            ? await objectController.getObject(objectName, objectId) as IEntityDataMainObject<EntityType[]>
                            : await objectController.newObject(objectName, '-1');
                    if (newObject) {
                        if (entityDataContext) {
                            // If this is a reload after a save operation with automatic conflicts fixing,
                            //  change the state from AutoMergesSaved to AutoMergesReload
                            const currentAdditionalAttributes: IEntityDataObjectAdditionalAttributes[] | undefined =
                                    entityDataContext.additionalAttributes;
                            newObject.additionalAttributes = structuredClone(currentAdditionalAttributes);
                            const autoMergeState =
                                    newObject.additionalAttributes?.find(
                                            el => el.attributeName === DataConflictStoreEntities.AutoMergesState
                                    )?.entities.find(el => el.entityName === '_general')?.entityAttributes.find(
                                            el => !el.fieldName
                                    );
                            if (autoMergeState && autoMergeState.value === DataConflictAutoMergesStates.AutoMergesSaved) {
                                autoMergeState.value = DataConflictAutoMergesStates.AutoMergesReload;
                            } else if (autoMergeState && autoMergeState.value === DataConflictAutoMergesStates.AutoMergesReload) {
                                // If the autoMergeState equals DataConflictAutoMergesStates.AutoMergesReload, the data was
                                // already reloaded, so the AutoMerge data must be deleted
                                const index1 = newObject.additionalAttributes?.findIndex(
                                        el => el.attributeName === DataConflictStoreEntities.AutoMergesState
                                );
                                if(index1 !== undefined) {
                                    newObject.additionalAttributes?.splice(index1, 1);
                                }
                                const index2 = newObject.additionalAttributes?.findIndex(
                                        el => el.attributeName === 'AUTO_MERGES'
                                );
                                if(index2 !== undefined) {
                                    newObject.additionalAttributes?.splice(index2, 1);
                                }
                            }
                        }
                        newObject.rwMode = rwMode;
                        newObject.componentPermissions = await PermissionLogic.getPermissions(applicationName.toLowerCase(), objectName,
                                objectController.objectDescription ?? objectName);
                        dispatch(setNewObject(newObject));
                        setReadOnly(userReadOnlyVisibilities.indexOf(
                                Number(((newObject.objectData[0].data ?? {}) as Record<string, unknown>).VisibilityCriteriaId ?? -1)) !== -1);
                    } else {
                        throw new Error('Error when creating object.');
                    }
                } else {
                    const newObject =
                            await objectController.getObject(objectName, objectId, true);
                    let editPermissions = true;
                    newObject.objectData.forEach(currentObject => {
                        if (userReadOnlyVisibilities.indexOf(
                                Number(((currentObject.data ?? {}) as Record<string, unknown>).VisibilityCriteriaId ?? -1)
                        ) !== -1) {
                            editPermissions = false;
                        }
                    });
                    if (!editPermissions) {
                        enqueueSnackbar(intl.formatMessage({id: "Error"}) + ": " +
                                intl.formatMessage(
                                        {id: 'No permissions to edit'}
                                ),
                                {
                                    variant: 'warning',
                                    persist: true
                                }
                        );
                    }
                    setReadOnly(!editPermissions);
                    const multiEditKey = Date.now();
                    dispatch(setMultipleObject(newObject));
                    setMultiEditing(true);
                }
                setLoading(false);
            };

            getData();

            const getValidators = async () => {
                const errorMessages = await objectController.getValidators();
                if (errorMessages.length) {
                    enqueueSnackbar(intl.formatMessage({id: "Error"}) + ': ' +
                            intl.formatMessage(
                                    {id: 'The following data structures are missing in the configuration files: '}
                            ) +
                            errorMessages.join(', '), {
                        variant: 'warning',
                        persist: true
                    });
                }
                setValidatorLoaded(true);
            };
            getValidators();

        }
    }, [objectName, objectId, rwMode, intl.locale, objectController, ver]);

    const readPermission = useAppSelector(state =>
        state.dataObjectSlice.objects.find(el => el.objectName === objectName && el.objectId === objectId)?.componentPermissions?.find(el =>
            el.componentName === "MainObject" && el.access === 'Read'
        )
    );
    const writePermission = useAppSelector(state =>
        state.dataObjectSlice.objects.find(el => el.objectName === objectName && el.objectId === objectId)?.componentPermissions?.find(el =>
            el.componentName === "MainObject" && el.access === 'Write'
        )
    );

    return <RawCRUDWrapper
        loading={!validatorLoaded || loading}
        activateLoading={activateLoading}
        objectName={objectName}
        rwMode={
            ((rwMode === rwModes.W && writePermission) ||   (rwMode === rwModes.R && readPermission))
            ? rwMode : (rwMode === rwModes.W && readPermission ? rwModes.R : rwMode)
        }
        objectId={objectId}
        objectController={objectController}
        readOnly={readOnly}
        Renderer={Renderer}
        multiEditing={multiEditing}
    />;
});

EntityCRUDWrapper.displayName = 'EntityCRUDWrapper';