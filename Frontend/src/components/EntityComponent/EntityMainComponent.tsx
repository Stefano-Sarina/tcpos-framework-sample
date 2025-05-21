import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Card, CardHeader, Grid} from "@mui/material";
import {useTheme} from "@mui/material/styles";

import type {IComponentForcedRWModeRule, IForcedRWModeLambdaFunction} from "@tcpos/backoffice-core";
import {
    addUiState,
    NextBOPublicRegistrationContainer,
    resetInterfaceBinding,
    setDirtyData,
    setToolbarItemParams
} from "@tcpos/backoffice-core";
import type {
    EntityType,
    IComponentVisibilityRule,
    IEntityAdditionalAttribute,
    IEntityDataObject,
    IEntityDataObjectAdditionalAttributes,
    IEntityDataObjectErrors,
    IInterfaceBuilderConditionalVisibility,
    IInterfaceBuilderDetailViewModel,
    IInterfaceBuilderModel,
    IInterfaceBuilderSubForm,
    IVisibilityFunction,
    IVisibilityLambdaFunction,
    Primitive,
} from "@tcpos/common-core";
import {rwModes} from "@tcpos/common-core";
import "./entityMainComponent.scss";
import type {
    CRUDWrapperRendererProps,
    IConflictList,
    IDataConflictDetail,
    IErrorListItem,
    INextBOActionToolbar
} from "@tcpos/backoffice-components";
import {
    DataConflictStoreEntities,
    EntityTranslationContextProvider,
    NavigationBlocker,
    NextBOActionToolbar,
    NextBOSecondaryToolbar,
    TranslationFormats,
    useAppDispatch,
    useAppSelector
} from "@tcpos/backoffice-components";
import {useIntl} from "react-intl";
import "../../../fonts/iconFont.scss";
import _ from "underscore";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import "./gridActionToolbar.scss";
import {useNavigate} from "react-router-dom";
import {DetailViewComponent} from "./DetailViewComponent";
import type { IUiPermissions } from "./IUiPermissions";
//import {useUpdateSession} from "../hooks/useUpdateSession";

/**
 * create a visibility rule from a conditional visibility model

 * change from
 @example
 //change
 visibilityRules: {
 fieldName: "textSizeMode",
 value: [TextSizeModes.MINMAXLINES]
 }
 }

 //to a function that implement this declarative language
 */
/**
 * @todo @codereview
 * ### Move this to another file, maybe an helper class
 * @author navmar
 */
export const addVisibilityRule = (condition: IInterfaceBuilderConditionalVisibility):
        IVisibilityLambdaFunction<IEntityDataObject[]> => {
    return (entityName: string, entityId: string, data: IEntityDataObject[]) => {
        const row = data.find((el) => el.entityName === entityName && el.entityId === entityId);
        if (!row) {
            return true;
        }
        const currentData = row.data as Record<string, unknown>;
        const datum = currentData[condition.fieldName] as Primitive | IVisibilityFunction<object> | undefined;
        if (datum !== undefined) {
            return condition.value?.indexOf(datum) !== -1;
        } else {
            return true;
        }
    };
};

export const addForcedRWModeRule = (rule: {forceReadonlyMode?: boolean, forceWriteMode?: boolean}):
        IForcedRWModeLambdaFunction<IEntityDataObject[]> => {
    return (entityName: string, entityId: string, data: IEntityDataObject[]) => {
        return rule.forceReadonlyMode ? "read" : (rule.forceWriteMode ? "write" : undefined);
    };
};

/**
 * render the typical webDaily field structure with Tabs -> sections and fields
 * @param props
 * @constructor
 */
export const EntityMainComponent = (props: CRUDWrapperRendererProps) => {

    const navigate = useNavigate();

    const intl = useIntl();

    const theme = useTheme();

    const lang = useAppSelector(state => state.config.languageInfo.lang);

    // Tabs
    const [tabsValue, setTabsValue] = React.useState(0);

    // Error navigation
    const [errorList, setErrorList] = useState<IErrorListItem[]>([]);

    const [visibleRowIndex, setVisibleRowIndex] = useState<{ fieldName: string; rowIndex: number }[]>([]);

    const appDispatch = useAppDispatch();

    useEffect(() => {
        return () => {
            appDispatch(resetInterfaceBinding({objectName: props.entityName, objectId: props.entityId}));
        };
    }, [appDispatch, props.entityId, props.entityName]);

    const [visibilityRules, setVisibilityRules] =
            useState<IComponentVisibilityRule<IEntityDataObject<object, string>[]>[]>([]);

    const [forcedRWModeRules, setForcedRWModeRules] =
            useState<IComponentForcedRWModeRule<IEntityDataObject<object, string>[]>[]>([]);

    const interfaceBinding = useAppSelector((state) => {
        return state.interfaceConfig.componentBinding;
    });

    const userReadOnlyVisibilities = useAppSelector((state) => state.user?.visibilities.readOnlyVisibilities);

    const applicationName = useAppSelector(state => state.interfaceConfig.applicationName);

    const menuPermissions = useAppSelector(state => state.user?.permissions);
    const uiPermissions: IUiPermissions[] | undefined = useAppSelector(state =>
        state.dataObjectSlice.objects.find(
            el => el.objectName === props.entityName && el.objectId === props.entityId
        )?.componentPermissions);
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(addUiState({entityName: props.entityName}));
        dispatch(setDirtyData(false));
    }, [dispatch, props.entityName]);

    const handleChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
        //setGoingToField({newTab: -1, componentId: "", active: false, fieldName: "", entityId: "", entityName: ""});
        setTabsValue(newValue);
    }, []);

    const interfaceConfigDetails = useAppSelector((state) => {
        return state.interfaceConfig.objectDetails?.find(
                (el: IInterfaceBuilderModel) => el.objectName === props.entityName
        );
    });

    const interfaceConfigLoaded = useAppSelector((state) => {
        return state.interfaceConfig.menuLoaded;
    });

    const resolveTabsCustomization = useMemo(() => NextBOPublicRegistrationContainer.isRegisteredTabsCustomization(props.entityName)
            ? NextBOPublicRegistrationContainer.resolveTabsCustomization(props.entityName)
            : undefined, [props.entityName]);

    const resolveToolbarCustomization = useMemo(() => NextBOPublicRegistrationContainer.isRegisteredToolbarCustomization(props.entityName)
            ? NextBOPublicRegistrationContainer.resolveToolbarCustomization(props.entityName)
            : undefined, [props.entityName]);

    const currentGroupsList: IInterfaceBuilderDetailViewModel = useMemo(() => {
        if (interfaceConfigLoaded) {
            let currentGroupsDefaultList: IInterfaceBuilderDetailViewModel;
            if (interfaceConfigLoaded && interfaceConfigDetails) {
                currentGroupsDefaultList = {
                    layoutGroups: interfaceConfigDetails.detailView.layoutGroups,
                    label: interfaceConfigDetails.detailView.label,
                    titleField: interfaceConfigDetails.detailView.titleField,
                    entityName: interfaceConfigDetails.detailView.entityName,
                };
            } else {
                currentGroupsDefaultList = {
                    layoutGroups: [],
                    titleField: "",
                    label: "",
                };
            }
            return {
                ...currentGroupsDefaultList,

                layoutGroups:
                        //resolveTabsCustomization?.(currentGroupsDefaultList.layoutGroups, intl) ??
                        resolveTabsCustomization?.(interfaceConfigDetails?.detailView.layoutGroups ?? [], intl) ??
                        currentGroupsDefaultList.layoutGroups,
            };
        } else {
            return {
                layoutGroups: [],
                titleField: "",
                label: "",
            };
        }
    }, [interfaceConfigLoaded, interfaceConfigDetails, resolveTabsCustomization, intl]);

    const currentToolbarMenu: INextBOActionToolbar = useMemo(() => {
        let currentToolbarDefaultList: INextBOActionToolbar;
        if (interfaceConfigLoaded && interfaceConfigDetails) {
            currentToolbarDefaultList = {
                toolbar: structuredClone(interfaceConfigDetails.toolbar),
            };
        } else {
            currentToolbarDefaultList = {toolbar: []};
        }
        // Default actions
        let index: number = -1;
        const saveGroup = currentToolbarDefaultList.toolbar.find(
                el => {
                    const currentIndex = el.items.findIndex(item => item.actionComponent === '_saveObject');
                    if (currentIndex !== -1) {
                        index = currentIndex;
                    }
                    return currentIndex !== -1;
                }
        );
        if (saveGroup) {
            saveGroup.items[index]!.actionAfter = params => {
                navigate(
                        `/${lang}/entities/` + props.entityName + "/detail/" + String(params.id) + "?mode=R&key=" +
                        Date.now().toString()
                );
            };
        }
        index = -1;
        const deleteGroup = currentToolbarDefaultList.toolbar.find(
                el => {
                    const currentIndex = el.items.findIndex(item => item.actionComponent === '_delete');
                    if (currentIndex !== -1) {
                        index = currentIndex;
                    }
                    return currentIndex !== -1;
                }
        );
        if (deleteGroup) {
            deleteGroup.items[index]!.actionAfter = params => {
                navigate(`/${lang}/entities/${props.entityName}/list/`);
            };
        }
        return {
            ...currentToolbarDefaultList,
            toolbar:
                    resolveToolbarCustomization?.(currentToolbarDefaultList.toolbar, intl) ??
                    currentToolbarDefaultList.toolbar
        };
    }, [resolveToolbarCustomization, interfaceConfigLoaded, intl.locale, lang]);

    useEffect(() => {
        const newVisibilityConditionRules: IComponentVisibilityRule<IEntityDataObject[]>[] = [];
        const newForcedRWModeRules: IComponentForcedRWModeRule<IEntityDataObject[]>[] = [];
        if (currentGroupsList) {
            const currentMainEntity = currentGroupsList.entityName ?? "";
            if (currentGroupsList.layoutGroups) {
                currentGroupsList.layoutGroups.forEach((group) => {
                    const currentGroupEntity: string = group.entityName ?? currentMainEntity;
                    group.sections.forEach((section) => {
                        const currentSectionEntity = section.entityName ?? currentGroupEntity;
                        if (section.visibilityCondition) {
                            newVisibilityConditionRules.push({
                                groupName: group.groupName,
                                sectionName: section.sectionName,
                                func: addVisibilityRule(section.visibilityCondition),
                            });
                        }
                        if (section.forceReadonlyMode || section.forceWriteMode) {
                            newForcedRWModeRules.push({
                                groupName: group.groupName,
                                sectionName: section.sectionName,
                                func: addForcedRWModeRule({
                                    forceReadonlyMode: section.forceReadonlyMode,
                                    forceWriteMode: section.forceWriteMode
                                }),
                            });
                        }
                        if (props.objectController.visibilityConditions) {
                            props.objectController.visibilityConditions
                                    .filter(
                                            (visCond: IComponentVisibilityRule<IEntityDataObject<EntityType[][number]["payload"], EntityType[][number]["name"]>[]>) =>
                                                    visCond?.groupName === group.groupName &&
                                                    visCond?.sectionName === section.sectionName &&
                                                    !visCond.componentName
                                    )
                                    .forEach(
                                            (visCond: IComponentVisibilityRule<IEntityDataObject<EntityType[][number]["payload"], EntityType[][number]["name"]>[]>) => {
                                                newVisibilityConditionRules.push({
                                                    groupName: group.groupName,
                                                    sectionName: section.sectionName,
                                                    func: visCond.func,
                                                });
                                            });
                        }
                        section.components.forEach((f) => {
                            if (f.visibilityCondition) {
                                newVisibilityConditionRules.push({
                                    groupName: group.groupName,
                                    sectionName: section.sectionName,
                                    componentName: f.componentName,
                                    func: addVisibilityRule(f.visibilityCondition),
                                });
                            }
                            if (props.objectController.visibilityConditions) {
                                props.objectController.visibilityConditions
                                        .filter(
                                                (visCond: IComponentVisibilityRule<IEntityDataObject<EntityType[][number]["payload"], EntityType[][number]["name"]>[]>) =>
                                                        visCond?.groupName === group.groupName &&
                                                        visCond?.sectionName === section.sectionName &&
                                                        visCond.componentName === f.componentName &&
                                                        !visCond.subComponentName
                                        )
                                        .forEach((visCond: IComponentVisibilityRule<IEntityDataObject<EntityType[][number]["payload"], EntityType[][number]["name"]>[]>) => {
                                            newVisibilityConditionRules.push({
                                                groupName: group.groupName,
                                                sectionName: section.sectionName,
                                                componentName: f.componentName,
                                                func: visCond.func,
                                            });
                                        });
                            }
                            if (f.forceReadonlyMode || f.forceWriteMode) {
                                newForcedRWModeRules.push({
                                    groupName: group.groupName,
                                    sectionName: section.sectionName,
                                    componentName: f.componentName,
                                    func: addForcedRWModeRule({
                                        forceReadonlyMode: f.forceReadonlyMode,
                                        forceWriteMode: f.forceWriteMode
                                    }),
                                });
                            }
                            if (props.objectController.forcedRWModeConditions) {
                                props.objectController.forcedRWModeConditions
                                        .filter(
                                                (rwCond: IComponentForcedRWModeRule<IEntityDataObject<EntityType[][number]["payload"], EntityType[][number]["name"]>[]>) =>
                                                        rwCond?.groupName === group.groupName &&
                                                        rwCond?.sectionName === section.sectionName &&
                                                        rwCond.componentName === f.componentName
                                        )
                                        .forEach((rwCond: IComponentForcedRWModeRule<IEntityDataObject<EntityType[][number]["payload"], EntityType[][number]["name"]>[]>) => {
                                            newForcedRWModeRules.push({
                                                groupName: group.groupName,
                                                sectionName: section.sectionName,
                                                componentName: f.componentName,
                                                func: rwCond.func,
                                            });
                                        });
                            }
                            if ((f as IInterfaceBuilderSubForm).subFields) {
                                (f as IInterfaceBuilderSubForm).subFields.forEach((sf) => {
                                    if (sf.cellRenderer.visibilityCondition) {
                                        newVisibilityConditionRules.push({
                                            groupName: group.groupName,
                                            sectionName: section.sectionName,
                                            componentName: f.componentName,
                                            subComponentName: sf.cellRenderer.componentName,
                                            func: addVisibilityRule(sf.cellRenderer.visibilityCondition),
                                        });
                                    }
                                    if (props.objectController.visibilityConditions) {
                                        props.objectController.visibilityConditions
                                                .filter(
                                                        (visCond: IComponentVisibilityRule<IEntityDataObject<EntityType[][number]["payload"], EntityType[][number]["name"]>[]>) =>
                                                                visCond?.groupName === group.groupName &&
                                                                visCond?.sectionName === section.sectionName &&
                                                                visCond.componentName === f.componentName &&
                                                                visCond.subComponentName === sf.cellRenderer.componentName
                                                )
                                                .forEach((visCond: IComponentVisibilityRule<IEntityDataObject<EntityType[][number]["payload"], EntityType[][number]["name"]>[]>) => {
                                                    newVisibilityConditionRules.push({
                                                        groupName: group.groupName,
                                                        sectionName: section.sectionName,
                                                        componentName: f.componentName,
                                                        func: visCond.func,
                                                    });
                                                });
                                    }
                                });
                            }
                        });
                    });
                });
                setVisibilityRules(newVisibilityConditionRules);
                setForcedRWModeRules(newForcedRWModeRules);
            }
        }
    }, [
/*
        _.pluck(currentGroupsList.layoutGroups, "groupName").join("_"),
        currentGroupsList.layoutGroups ? _.pluck(currentGroupsList.layoutGroups, "groupName").join("_") : "",
*/
        props.objectController.forcedRWModeConditions, props.objectController.visibilityConditions, currentGroupsList
    ]); // TODO: to improve

    const entityTitle = useAppSelector((state) => {
        if (!props.multiEditing) {
            const currentData = state.dataObjectSlice.objects
                    .find((el) => el.objectName === props.entityName && el.objectId === props.entityId)
                    ?.objectData.find((el: IEntityDataObject) => el.entityName === currentGroupsList.entityName)?.data;
            if (currentData) {
                return ((currentData as Record<string, unknown>).Code ?
                        (currentData as Record<string, unknown>).Code + " - "
                    : "") +
                    String(
                        (currentData as Record<string, unknown>)[currentGroupsList.titleField ?? ""] ?? ""
                    );
            } else {
                return "";
            }
        } else {
            const elemIds = props.entityId.split('|');
            const titleList: string[] = [];
            elemIds.slice(0,3).forEach(rowId => {
                const currentData = state.dataObjectSlice.objects
                        .find((el) =>
                                el.objectName === props.entityName && el.objectId === props.entityId
                        )?.objectData.find((el: IEntityDataObject) =>
                                el.entityName === props.objectController.mainEntity && el.entityId === rowId
                        )?.data;
                if (currentData) {
                    titleList.push(String(
                            (currentData as Record<string, unknown>)[currentGroupsList.titleField ?? ""] ?? ""
                    ));
                }
            });
            const message = intl.formatMessage({
                id: 'detailView.title',
                defaultMessage: "and {numValues} more"
            }, {numValues: elemIds.length - titleList.length});
            return titleList.join(", ") + (elemIds.length > titleList.length ? " " + message : "");
        }
    });

    const entityData = useAppSelector((state) => {
        return state.dataObjectSlice.objects.find((el) => el.objectName === props.entityName && el.objectId === props.entityId)
            ?.objectData;
    });

    const entityDataErrors = useAppSelector((state) => {
        return state.dataObjectSlice.objects.find((el) => el.objectName === props.entityName && el.objectId === props.entityId)
            ?.objectDataErrors;
    });

    const entityDataConflicts = useAppSelector((state) => {
        return state.dataObjectSlice.objects
            .find((el) => el.objectName === props.entityName && el.objectId === props.entityId)
            ?.additionalAttributes?.find((el: IEntityDataObjectAdditionalAttributes) => el.attributeName === DataConflictStoreEntities.Conflicts)?.entities;
    });

    const entityDataRowStatuses = useAppSelector((state) => {
        return state.dataObjectSlice.objects.find((el) => el.objectName === props.entityName && el.objectId === props.entityId)
            ?.objectDataRowStatuses;
    });

    /*
    const updateSession = useUpdateSession();

    useEffect(() => {
        updateSession.onOperation();
    }, [entityData, entityDataRowStatuses, entityDataConflicts, updateSession])
    */

    const conflictList = useRef<IConflictList[]>([]);

    useEffect(() => {
        const newList: IConflictList[] = [];
        if (entityDataConflicts) {
            entityDataConflicts.forEach((ent: IEntityAdditionalAttribute) => {
                ent.entityAttributes.forEach((attr) => {
                    const value = attr.value as IDataConflictDetail;
                    newList.push({
                        entityId: ent.entityId,
                        entityName: ent.entityName,
                        key: value.key,
                        localData: value.localValue,
                        remoteData: value.remoteValue,
                    });
                });
            });
        }
        conflictList.current = newList;
    }, [entityDataConflicts]);

    useEffect(() => {
        const newErrorList: IErrorListItem[] = [];
        if (entityDataErrors) {
            entityDataErrors.forEach((el: IEntityDataObjectErrors) => {
                el.dataErrors.forEach((err) => {
                    const currentBinding = interfaceBinding
                            .find((b) => b.objectName === props.entityName && b.objectId === props.entityId)
                            ?.binding.filter(
                                    (b) =>
                                            b.entityName === el.entityName &&
                                            b.entityId === el.entityId &&
                                            b.fieldName === err.fieldName
                            );
                    if (currentBinding) {
                        currentBinding.forEach((b) => {
                            newErrorList.push({
                                entityName: el.entityName,
                                entityId: el.entityId,
                                fieldName: err.fieldName,
                                label: b.label /*+ (el.entityId !== props.entityId ? " (id: " + el.entityId + ")" : "")*/,
                                groupName: b.groupName,
                                componentId: b.componentId,
                                error: err.error.join(" - "),
                            });
                        });
                    }
                });
            });
        }
        setErrorList(newErrorList);
    }, [entityDataErrors, interfaceBinding]);

    return (
        <NavigationBlocker rwMode={props.rwMode}>
            <EntityTranslationContextProvider
                availableLanguages={[
                    /**
                     * @todo load these in redux and get them from the store
                     */
                    {
                        code: "en",
                        label: "English",
                        iconUrl: "https://placehold.co/24/red/white",
                    },
                    {
                        code: "it",
                        label: "Italian",
                    },
                ]}
                translationFormat={TranslationFormats.FIELD_BASED_TRANSLATIONS}
            >
                <Backdrop sx={{color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1}} open={props.loading}>
                    <CircularProgress color="inherit"/>
                </Backdrop>
                <Grid container
                      spacing={3}
                      sx={{
                          '@keyframes highlight': {
                              "0%": {"background-color": theme.palette.background.default},
                              "50%": {"background-color": "#ffff00"},
                              "75%": {"background-color": "fffde7"},
                              "100%": {"background-color": theme.palette.background.default},
                          }
                      }}
                >
                    <Grid item xs={12}>
                        <form>
                            <Card
                                className={"mainCard"}
                                elevation={0}
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    overflow: "visible",
                                    backgroundColor: theme => theme.palette.background.default,
                                    ">.MuiCardHeader-root": {
                                        backgroundColor: theme => theme.palette.background.default /*"background.paper"*/,
                                        zIndex: "fab",
                                        paddingTop: "8px",
                                        paddingBottom: "8px",
                                    },
                                    // height: 'calc(100vh - 160px)'$
                                    //removed to enable full page scroll
                                }}
                            >
                                <CardHeader
                                    title={
                                        <>
                                            {(currentGroupsList.titleField
                                                    ? entityTitle && entityTitle.trim() !== ""
                                                        ? entityTitle
                                                        : intl.formatMessage({ id: "No name" })
                                                    : "") +
                                                " - " +
                                                (currentGroupsList.label && currentGroupsList.label !== ""
                                                    ? intl.formatMessage({ id: currentGroupsList.label })
                                                    : "") +
                                                " " +
                                                intl.formatMessage({ id: "detail view" })}
                                        </>
                                    }
                                />
                                <NextBOActionToolbar
                                    toolbar={currentToolbarMenu.toolbar ?? []}
                                    objectName={props.entityName}
                                    objectId={props.entityId}
                                    objectController={props.objectController}
                                    viewMode={props.rwMode === rwModes.R ? "detailViewRead" : "detailViewWrite"}
                                    tabsValue={tabsValue}
                                    setTabsValue={setTabsValue}
                                    setParams={useCallback((groupName, itemName, params) => {
                                        appDispatch(
                                            setToolbarItemParams({
                                                objectName: props.entityName,
                                                groupName: groupName,
                                                itemName: itemName,
                                                params: params,
                                            })
                                        );
                                    }, [appDispatch, props.entityName])}
                                    readOnlyPermission={!menuPermissions?.find(
                                        el => el.code.toLowerCase() === props.entityName.toLowerCase() + '-' +
                                                applicationName.toLowerCase() + '-write'
                                    )}
                                    newObjectCreationPermission={!!menuPermissions?.find(
                                                    el => el.code.toLowerCase() === props.entityName.toLowerCase() + '-' +
                                                            applicationName.toLowerCase() + '-write') &&
                                            (
                                                    !menuPermissions?.find(
                                                            el => el.code.toLowerCase() === props.entityName.toLowerCase() + '.new-' +
                                                                    applicationName.toLowerCase() + '-write') ||
                                                    menuPermissions?.find(
                                                            el => el.code.toLowerCase() === props.entityName.toLowerCase() + '.new-' +
                                                                    applicationName.toLowerCase() + '-write')?.permissionValue === 2
                                            )
                                    }
                                    secondaryToolbar={<NextBOSecondaryToolbar
                                        objectName={props.entityName}
                                        objectId={props.entityId}
                                        objectController={props.objectController}
                                        viewMode={props.rwMode === rwModes.R ? "detailViewRead" : "detailViewWrite"}
                                        tabsValue={tabsValue}
                                        setTabsValue={setTabsValue}
                                    />}
                                />

                                <DetailViewComponent
                                        currentGroupsList={currentGroupsList}
                                        entityName={props.entityName}
                                        entityId={props.entityId}
                                        rwMode={props.rwMode}
                                        tabsValue={tabsValue}
                                        onChange={handleChange}
                                        onAddSubRow={props.onAddSubRow}
                                        onDeleteSubRow={props.onDeleteSubRow}
                                        uiPermissions={uiPermissions}
                                        errorList={errorList}
                                        getExternalList={props.getExternalList}
                                        initializeList={props.initializeList}
                                        multiEditing={props.multiEditing}
                                        visibilityRules={visibilityRules}
                                        forcedRWModeRules={forcedRWModeRules}
                                        visibleRowIndex={visibleRowIndex}
                                />
                            </Card>
                        </form>
                    </Grid>
                </Grid>
            </EntityTranslationContextProvider>
        </NavigationBlocker>
    );
};

