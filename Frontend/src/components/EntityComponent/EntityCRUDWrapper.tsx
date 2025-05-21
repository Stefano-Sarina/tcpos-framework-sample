import React, {useEffect, useMemo, useRef, useState} from "react";
import {
    NextBOPublicRegistrationContainer, setLists,
    setMultipleObject,
    setNewObject,
    updateListData, setSingleList
} from "@tcpos/backoffice-core";
import type {AERObjectController} from "@tcpos/backoffice-core";
import type {CRUDWrapperProps} from "@tcpos/backoffice-components";
import {RawCRUDWrapper, useAppDispatch, useAppSelector} from "@tcpos/backoffice-components";
import {
    DataConflictAutoMergesStates,
    DataConflictStoreEntities,
} from "../interfaceLogics/dataConflicts/DataConflictStates";
import {EntityMainComponent} from "./EntityMainComponent";
import {enqueueSnackbar} from "notistack";
import {useIntl} from "react-intl";
import type {
    EntityType,
    IEntityDataMainObject,
    IEntityDataObjectAdditionalAttributes,
    IEntityExternalList
} from "@tcpos/common-core";
import {rwModes} from "@tcpos/common-core";
import {useNavigate, useParams} from "react-router-dom";
import {v4 as uuidv4} from "uuid";
import {PermissionLogic} from "../../core/businessLogic/permissions/PermissionLogic";

/**
 * the standard wrapper to bind app entity fields to the context
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

    // multiEditingId used in case of multiple editing
    const [multiEditing, setMultiEditing] = useState<boolean>(false);

    const interfaceConfig = useAppSelector(state =>
            state.interfaceConfig.objectDetails?.find(el => el.objectName === objectName));
    const applicationName = useAppSelector(state => state.interfaceConfig.applicationName);

    const intl = useIntl();
    if (!NextBOPublicRegistrationContainer.isBound( "objectControllers", objectName)) {
        throw (intl.formatMessage({id: `No registration found for '${objectName}' object controller`}));
    }

    const operatorPermissions = useAppSelector(state => state.user.permissions);

    const objectControllerRegistration = useMemo(() => {
        return NextBOPublicRegistrationContainer.isBound( "objectControllers", objectName)
            ? NextBOPublicRegistrationContainer.resolveEntry("objectControllers",  objectName).controller
            : undefined;
    }, [objectName]);

    const objectController = useMemo(() => {
        if (objectControllerRegistration) {
            return NextBOPublicRegistrationContainer.resolveConstructor(objectControllerRegistration) as AERObjectController<any, any>;
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

    useEffect(() => {
        if (interfaceConfig) {
            objectController.init(objectId, objectName, interfaceConfig);
        }
    }, [objectId, objectName, interfaceConfig]);

    const navigate = useNavigate();

    const Renderer = useMemo(() => {
        /**
         * test if a custom page is defined TODO add custom page registration
         */
        return standardRenderer ?? EntityMainComponent;
/*
        const CustomPage = DailyPublicRegistrationContainer.isBound(objectName + "CustomPage")
                && dailyIocContainer.resolve<React.FC>(objectName + "CustomPage");
        return !CustomPage
                ? (standardRenderer ?? EntityMainComponent)
                : () => <div><CustomPage/></div>;
*/
    }, [objectName, ver]);


    const activateLoading = (activate: boolean) => {
        setLoading(activate);
    };

    const [objectGuid, setObjectGuid] = useState<string>('');

    useEffect(() => {
        if (objectController) {
            const getData = async () => {
                setLoading(true);
                if (objectId.indexOf('|') === -1) {
                    // Single (normal) editing
                    const newObject = Number(objectId) >= 0
                            ? await objectController.getObject(objectName, objectId, false, true) as IEntityDataMainObject<EntityType[]>
                            : await objectController.newObject(objectName, '-1', true);
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
                        newObject.componentPermissions = await PermissionLogic.getPermissions(applicationName, objectController,
                                operatorPermissions);
                        const newGuid: string = uuidv4();
                        setObjectGuid(newGuid);
                        newObject.guid = newGuid;
                        dispatch(setNewObject(newObject));
                        setReadOnly(userReadOnlyVisibilities.indexOf(
                                Number(((newObject.objectData[0].data ?? {}) as Record<string, unknown>).VisibilityCriteriaId ?? -1)) !== -1);
                    } else {
                        throw new Error('Error when creating object.');
                    }
                } else {
                    const newObject =
                            await objectController.getObject(objectName, objectId, true, rwMode === rwModes.R);
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
                    const externalList = newObject.lists;
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
    }, [objectName, objectId, rwMode, intl.locale, ver, objectController, operatorPermissions, lang]);

    /**
     *  Triggered after the object data is loaded in the store. Used to download lists asynchronously
     */
    useEffect(() => {
/*
        if (objectId && entityDataContext?.objectId === objectId && rwMode === rwModes.W) {
            (async () => {
                const externalDataList = objectController.externalData;
                for (const el of (externalDataList ?? [])) {
                    const newData = await objectController.listInitialization(el.listFieldName, 50);
                    const newList: IEntityExternalList = {
                        data: newData.data,
                        name: el.listFieldName,
                        dataBinding: [],
                        dynamicReload: newData.dynamicReload,
                    }
                    dispatch(setSingleList({list: newList, objectName, objectId, embedInPreviousEdit: true}));
                }
            })();
        }
*/
    }, []);

    const readPermission = useAppSelector(state =>
        state.dataObjectSlice.objects.find(el =>
                el.objectName === objectName && el.objectId === objectId)?.componentPermissions?.find(el =>
                    el.componentName === "MainObject" && el.access === 'Read'
        )
    );
    const writePermission = useAppSelector(state =>
        state.dataObjectSlice.objects.find(el =>
                el.objectName === objectName && el.objectId === objectId)?.componentPermissions?.find(el =>
                    el.componentName === "MainObject" && el.access === 'Write'
        )
    );

    const getExternalList = async (componentId: string, listName: string) => {
        if (entityDataContext && rwMode === rwModes.W) {
            const currentList = entityDataContext.lists.find(el => el.name === listName);
            if (currentList) {
                if (currentList.dynamicReload === 'yes') {
                    if (!currentList.dataBinding?.find(el => el.componentId === componentId)) {
                        dispatch(updateListData({
                            objectId: objectId,
                            objectName: objectName,
                            listName: listName,
                            componentId: componentId,
                            data: currentList.data ?? []
                        }));
                    }
                }
            }
        }
    };

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
        getExternalList={getExternalList}
    />;
}, (prevProps, nextProps) =>
        prevProps.objectId === nextProps.objectId && prevProps.objectName === nextProps.objectName
        && prevProps.rwMode === nextProps.rwMode);

EntityCRUDWrapper.displayName = 'EntityCRUDWrapper';