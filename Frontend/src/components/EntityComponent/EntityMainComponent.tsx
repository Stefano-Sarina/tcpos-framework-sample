import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Box, Card, CardHeader, Grid, Tab, Tabs, Tooltip} from "@mui/material";
import {
    addUiState,
    DailyPublicRegistrationContainer,
    resetInterfaceBinding,
    setToolbarItemParams
} from "@tcpos/backoffice-core";
import type {
    EntityType,
    IComponentVisibilityRule,
    IEntityAdditionalAttribute,
    IEntityDataFieldObjectIds,
    IEntityDataObject,
    IEntityDataObjectAdditionalAttributes,
    IEntityDataObjectErrors,
    IEntityDataObjectIds,
    IEntityMainObjectIds,
    IFieldViewModel,
    IInterfaceBuilderComponent,
    IInterfaceBuilderConditionalVisibility,
    IInterfaceBuilderDetailViewModel,
    IInterfaceBuilderModel,
    IInterfaceBuilderSubForm,
    ITranslatableField,
    IVisibilityFunction,
    IVisibilityLambdaFunction,
    Primitive,
} from "@tcpos/common-core";
import {isITranslatableField, rwModes} from "@tcpos/common-core";
import "./entityMainComponent.scss";
import {
    WD_Section,
    DailyBaseComponent,
    TCIcon,
    DailyActionToolbar,
    EntityTranslationContextProvider,
    TranslationFormats,
    DailySecondaryToolbar,
    NavigationBlocker,
    DataConflictStoreEntities,
    type IErrorListItem,
    type IConflictList, EntityComponentChildren, useAppDispatch, useAppSelector,
    useLocaleConfig,
} from "@tcpos/backoffice-components";
import {useIntl} from "react-intl";
import "../../../fonts/iconFont.scss";
import {styled, useTheme} from "@mui/material/styles";
import _ from "underscore";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import type {CRUDWrapperRendererProps, IInitializeDynamicList, IWDBoundComponentCommonProperties,
    IWithVisibilityRules, IDataConflictDetail, IDailyActionToolbar, IWDSubRowProps} from "@tcpos/backoffice-components";
import "./gridActionToolbar.scss";
import {useNavigate} from "react-router-dom";
import {useParams} from "react-router";
import type {I18n} from "../../core/services/intl";
import useConfig from "../themeComponents/useConfig";

// TabPanel
interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel = (props: TabPanelProps) => {
    const {children, value, index} = props;

    return <Box sx={{p: 3, overflowY: "auto", display: value === index ? "block" : "none"}}>{children}</Box>;
};
const a11yProps = (index: number) => {
    return {
        id: `simple-tab-${index}`,
        "aria-controls": `simple-tabpanel-${index}`,
    };
};

interface StyledTabProps {
    label: React.ReactNode;
}

/*
export interface IConflictListItem {
    field: string;
    label: string;
    error: string;
    componentName: string | undefined;
    groupName?: string;
    rowId?: string;
    rowIndex?: number;
}
*/

export interface IHiddenComponentsList {
    groupName?: string;
    sectionName?: string;
    componentName?: string;
}

const StyledTab = styled((props: StyledTabProps) => <Tab {...props} />)(({theme}) => ({
    ".tab-with-error": {
        color: theme.palette.error.main,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    ".tab-with-error-no-color": {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    ".icon-tab-error": {
        color: theme.palette.error.main,
    },
}));

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

/**
 * render the typical webDaily field structure with Tabs -> sections and fields
 * @param props
 * @constructor
 */
export const EntityMainComponent = (props: CRUDWrapperRendererProps) => {

    const navigate = useNavigate();

    const intl = useIntl();

    const themeConfig = useConfig();

    const applicationName = useAppSelector(state => state.interfaceConfig.applicationName);

    /*
    const localeConfig = useLocaleConfig();
    const {lang} = useParams();
    useEffect(() => {
        localeConfig.changeLanguage(lang as I18n);
    }, [lang]);
    */

    // Tab list
    //const [currentTabList, setCurrentTabList] = useState<{ name: string, label: string }[]>([]);

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

    // Conditional visibilities TODO remove visibilities
    /*
    const [hiddenComponents, setHiddenComponents] =
        useState<IHiddenComponentsList[]>([]);
*/
    const [visibilityRules, setVisibilityRules] =
            useState<IComponentVisibilityRule<IEntityDataObject<object, string>[]>[]>([]);
    /*
    const visibilities: { componentName: string, visible: boolean }[] = useAppSelector((state) => {
        return state.uiState.find(el => el.entityName === props.entityName)?.visibilities ?? [];
    });
*/
    const interfaceBinding = useAppSelector((state) => {
        return state.interfaceConfig.componentBinding;
    });

    const userReadOnlyVisibilities = useAppSelector((state) => state.user?.visibilities.readOnlyVisibilities);

    const menuPermissions = useAppSelector(state => state.user?.permissions);
    const uiPermissions = useAppSelector(state =>
            state.dataObjectSlice.objects.find(
                    el => el.objectName === props.entityName && el.objectId === props.entityId
            )?.componentPermissions);
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(addUiState({entityName: props.entityName}));
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

    const gotoField = () => {
    };

    const resolveTabsCustomization = DailyPublicRegistrationContainer.isRegisteredTabsCustomization(props.entityName)
            ? DailyPublicRegistrationContainer.resolveTabsCustomization(props.entityName)
            : undefined;

    const resolveToolbarCustomization = DailyPublicRegistrationContainer.isRegisteredToolbarCustomization(props.entityName)
            ? DailyPublicRegistrationContainer.resolveToolbarCustomization(props.entityName)
            : undefined;

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
    }, [resolveTabsCustomization, interfaceConfigLoaded]);

    const currentToolbarMenu: IDailyActionToolbar = useMemo(() => {
        let currentToolbarDefaultList: IDailyActionToolbar;
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
                        `/${intl.locale}/entities/` + props.entityName + "/detail/" + String(params.id) + "?mode=R&key=" +
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
                navigate(`/${intl.locale}/entities/${props.entityName}/list/`);
            };
        }
        return {
            ...currentToolbarDefaultList,
            toolbar:
                    resolveToolbarCustomization?.(currentToolbarDefaultList.toolbar, intl) ??
                    currentToolbarDefaultList.toolbar
        };
    }, [resolveToolbarCustomization, interfaceConfigLoaded, intl.locale]);

    /*
    const addVisibilityCondition = (condition: IConditionalVisibilityModel) => { // TODO remove
        return (data: Record<string, any>) => {
            if (data) {
                return condition.value?.indexOf(data[condition.fieldName ?? ""]) !== -1;
            } else {
                return true;
            }
        };
    };
*/

    useEffect(() => {
        const newVisibilityConditionRules: IComponentVisibilityRule<IEntityDataObject[]>[] = [];
        if (currentGroupsList) {
            const currentMainEntity = currentGroupsList.entityName ?? "";
            if (currentGroupsList.layoutGroups) {
                currentGroupsList.layoutGroups.forEach((group) => {
                    const currentGroupEntity: string = group.entityName ?? currentMainEntity;
                    group.sections.forEach((section) => {
                        //const currentSectionEntity = section.entityName ?? currentGroupEntity;
                        if (section.visibilityCondition) {
                            newVisibilityConditionRules.push({
                                groupName: group.groupName,
                                sectionName: section.sectionName,
                                func: addVisibilityRule(section.visibilityCondition),
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
            }
        }
    }, [
        _.pluck(currentGroupsList.layoutGroups, "groupName").join("_"),
        currentGroupsList.layoutGroups ? _.pluck(currentGroupsList.layoutGroups, "groupName").join("_") : "",
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
    /*
        const entityTitle = useEntityDataContext((state) => {
            if (!props.multiEditing) {
                const currentData = state.objects
                        .find((el) => el.objectName === props.entityName && el.objectId === props.entityId)
                        ?.objectData.find((el: IEntityDataObject) => el.entityName === currentGroupsList.entityName)?.data;
                if (currentData) {
                    return String(
                            (currentData as Record<string, unknown>)[currentGroupsList.titleField ?? ""] ?? ""
                    );
                } else {
                    return "";
                }
            } else {
                const elemIds = props.entityId.split('|');
                const titleList: string[] = [];
                elemIds.slice(0,3).forEach(rowId => {
                    const currentData = state.objects
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
    */

    const entityData = useAppSelector((state) => {
        return state.dataObjectSlice.objects.find((el) => el.objectName === props.entityName && el.objectId === props.entityId)
                ?.objectData;
    });
    /*
        const entityData = useEntityDataContext((state) => {
            return state.objects.find((el) => el.objectName === props.entityName && el.objectId === props.entityId)
                    ?.objectData;
        });
    */

    const entityDataErrors = useAppSelector((state) => {
        return state.dataObjectSlice.objects.find((el) => el.objectName === props.entityName && el.objectId === props.entityId)
                ?.objectDataErrors;
    });
    /*
        const entityDataErrors = useEntityDataContext((state) => {
            return state.objects.find((el) => el.objectName === props.entityName && el.objectId === props.entityId)
                    ?.objectDataErrors;
        });
    */

    const entityDataConflicts = useAppSelector((state) => {
        return state.dataObjectSlice.objects
                .find((el) => el.objectName === props.entityName && el.objectId === props.entityId)
                ?.additionalAttributes?.find((el: IEntityDataObjectAdditionalAttributes) => el.attributeName === DataConflictStoreEntities.Conflicts)?.entities;
    });
    /*
        const entityDataConflicts = useEntityDataContext((state) => {
            return state.objects
                    .find((el) => el.objectName === props.entityName && el.objectId === props.entityId)
                    ?.additionalAttributes?.find((el: IEntityDataObjectAdditionalAttributes) => el.attributeName === DataConflictStoreEntities.Conflicts)?.entities;
        });
    */

    const entityDataRowStatuses = useAppSelector((state) => {
        return state.dataObjectSlice.objects.find((el) => el.objectName === props.entityName && el.objectId === props.entityId)
                ?.objectDataRowStatuses;
    });
    /*
        const entityDataRowStatuses = useEntityDataContext((state) => {
            return state.objects.find((el) => el.objectName === props.entityName && el.objectId === props.entityId)
                    ?.objectDataRowStatuses;
        });
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

    const sectionElements = useMemo(() => {
        if (currentGroupsList.layoutGroups) {
            return currentGroupsList.layoutGroups //.filter(group => !!uiPermissions?.find(el =>
                    //el.componentName === props.entityName + '.' + group.groupName &&
                    //el.access !== "NoAccess"))
                    .map((group, index) => {
                        let tabPanel: React.ReactElement<IWDBoundComponentCommonProperties>;
                        if (!group.customComponent) {
                            tabPanel = (
                                    <Grid container spacing={3}>
                                        {group.sections.map((section, sectionIndex) => {
                                            let currentRwMode: rwModes = props.rwMode;
                                            const currentPermission = true // uiPermissions?.filter(el =>
                                                    //el.componentName === props.entityName + "." + group.groupName + "." + section.sectionName
                                            //);
                                            let assignedPermission = "";
                                            if (currentPermission) {
                                                assignedPermission = "Write" //currentPermission.find(el => el.access === 'Write')
                                                        //? "Write"
                                                        //: (currentPermission.find(el => el.access === 'Read')
                                                        //        ? "Read"
                                                        //        : (currentPermission.find(el => el.access === 'NoAccess')
                                                        //                ? "NoAccess" : ""));
                                                if (props.rwMode === rwModes.W && assignedPermission === 'Read') {
                                                    currentRwMode = rwModes.R;
                                                }
                                            }
                                            return (assignedPermission !== "NoAccess" &&
                                                    <WD_Section
                                                            fieldName={""}
                                                            componentType={"wdSection"}
                                                            objectName={props.entityName}
                                                            objectId={props.entityId}
                                                            entityName={
                                                                    section.entityName ?? group.entityName ?? currentGroupsList.entityName ?? ""
                                                            }
                                                            entityId={props.entityId}
                                                            componentName={group.groupName + "." + section.sectionName}
                                                            label={section.label ? intl.formatMessage({id: section.label}) : ""}
                                                            rwMode={currentRwMode}
                                                            xs={section.xs}
                                                            sm={section.sm}
                                                            md={section.md}
                                                            lg={section.lg}
                                                            xl={section.xl}
                                                            key={"Section" + index + "_" + sectionIndex}
                                                            visibilityRules={_(visibilityRules).filter(
                                                                    (el) =>
                                                                            el.groupName === group.groupName &&
                                                                            el.sectionName === section.sectionName &&
                                                                            !el.componentName
                                                            )}
                                                            groupName={group.groupName}
                                                    >
                                                        <EntityComponentChildren
                                                            objectName={props.entityName}
                                                            objectId={props.entityId}
                                                            entityName={
                                                                    section.entityName ?? group.entityName ?? currentGroupsList.entityName ?? ""
                                                            }
                                                            entityId={props.entityId}
                                                            rwMode={currentRwMode}
                                                            onAddSubRow={props.onAddSubRow}
                                                            onDeleteSubRow={props.onDeleteSubRow}
                                                            components={section.components}
                                                            sectionIndex={sectionIndex}
                                                            index={index}
                                                            visibleRowIndex={visibleRowIndex}
                                                            parentName={group.groupName + "." + section.sectionName}
                                                            visibilityRules={visibilityRules.filter(
                                                                    (el) =>
                                                                            el.groupName === group.groupName &&
                                                                            el.sectionName === section.sectionName &&
                                                                            !!el.componentName
                                                            )}
                                                            groupName={group.groupName}
                                                            multiEditing={props.multiEditing}
                                                            initializeList={props.initializeList}
                                                            customComponents={section.components.filter(comp =>
                                                                                comp.customComponent && comp.customComponent !== "")
                                                                    .map(comp => {return  {
                                                                        customComponentName: comp.customComponent ?? "",
                                                                        renderer: DailyPublicRegistrationContainer.resolveEntry("uiCustomComponents", comp.customComponent).component
                                                                    };}) }
                                                            themeMode={themeConfig.mode}
                                                        />
                                                    </WD_Section>
                                            );})}
                                    </Grid>
                            );
                        } else {
                            const Comp = DailyPublicRegistrationContainer.resolveEntry("uiComponents", group.customComponent).component;
                            if (Comp) {
                                tabPanel = (
                                        <Comp
                                                objectName={props.entityName}
                                                rwMode={props.rwMode}
                                                objectId={props.entityId}
                                                entityName={group.entityName ?? currentGroupsList.entityName ?? ""}
                                                entityId={props.entityId}
                                                componentName={group.groupName}
                                                label={""}
                                        />
                                );
                            } else {
                                tabPanel = <></>;
                            }
                        }
                        return (
                                <TabPanel key={"TabPanel" + index} index={index} value={tabsValue}>
                                    {tabPanel}
                                </TabPanel>
                        );
                    });
        }
    }, [
        currentGroupsList.layoutGroups,
        currentGroupsList.layoutGroups,
        props.entityName,
        props.entityId,
        props.rwMode,
        visibleRowIndex,
        tabsValue,
        intl.locale,
        visibilityRules,
        props.multiEditing,
        uiPermissions
    ]);

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
                    <Grid container spacing={3}>
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
                                        /*
                                                                    secondary={
                                                                        !props.loading ? (
                                                                            <DetailHeaderToolbar
                                                                                mode={props.rwMode ?? rwModes.R}
                                                                                actions={currentGroupsList.headerActions}
                                                                                errorList={errorList}
                                                                                onErrorListClick={gotoField}
                                                                                conflictList={conflictList.current}
                                                                                saveEnabled={
                                                                                    userReadOnlyVisibilities.indexOf(
                                                                                        Number(
                                                                                            entityData?.find(
                                                                                                (el) =>
                                                                                                    el.entityName === props.objectController.mainEntity &&
                                                                                                    el.entityId === props.objectController.mainId
                                                                                            )?.data.VisibilityCriteriaId ?? -1
                                                                                        )
                                                                                    ) === -1
                                                                                }
                                                                            />
                                                                        ) : null
                                                                    }
                                        */
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
                                                    {/*<Chip sx={{marginLeft: '10px'}}
                                            color={props.rwMode === rwModes.R ? "error" : "success"}
                                            label={
                                                <>
                                                    {(props.rwMode === rwModes.R ?
                                                            <DoNotDisturbIcon fontSize={'inherit'}/> :
                                                            <CheckCircleIcon fontSize={'inherit'}/>)}
                                                    {' '}
                                                    {(props.rwMode === rwModes.R ? "View" : "Edit") + " mode"}
                                                </>
                                            }
                                            size="small" variant="light"/>*/}
                                                </>
                                            }
                                    />
                                    <DailyActionToolbar
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
                                                    el => el.code.toLowerCase() === props.entityName.toLowerCase() +
                                                            '-' + applicationName.toLowerCase() + '-write'
                                            )}
                                            secondaryToolbar={<DailySecondaryToolbar
                                                    objectName={props.entityName}
                                                    objectId={props.entityId}
                                                    objectController={props.objectController}
                                                    viewMode={props.rwMode === rwModes.R ? "detailViewRead" : "detailViewWrite"}
                                                    tabsValue={tabsValue}
                                                    setTabsValue={setTabsValue}
                                            />}
                                    />

                                    <Grid
                                            container
                                            sx={{
                                                overflowY: "auto",
                                                boxShadow: 3,
                                                marginLeft: "20px",
                                                marginTop: "15px",
                                                marginBottom: "15px",
                                                width: "calc(100% - 39px)",
                                                minHeight: 0,
                                                height: "100%",
                                                paddingTop: 0,
                                                paddingBottom: 0,
                                            }}
                                            className={props.rwMode === rwModes.R ? "main-component-readonly" : "main-component"}
                                            alignItems={"center"}
                                    >
                                        <Box sx={{width: "100%", height: "100%", display: "flex", flexDirection: "column"}}>
                                            <Box
                                                    sx={{
                                                        borderBottom: 1,
                                                        borderColor: "divider",
                                                        position: "sticky",
                                                        top: "142px",
                                                        zIndex: 1200,
                                                        backgroundColor: (theme) =>
                                                                theme.palette.mode === "dark" ? "#101010" : "#fff",
                                                    }}
                                            >
                                                <Tabs
                                                        value={tabsValue}
                                                        onChange={handleChange}
                                                        orientation={"horizontal"}
                                                        variant={"scrollable"}
                                                >
                                                    {currentGroupsList.layoutGroups.map((group, index) => (
                                                            uiPermissions?.find(el =>
                                                                    el.componentName.toLowerCase() === (props.entityName + '.' + group.groupName).toLowerCase() &&
                                                                    el.access !== "NoAccess") ? (
                                                                            <StyledTab
                                                                                    key={"tab" + index}
                                                                                    label={
                                                                                        props.rwMode === rwModes.W &&
                                                                                        errorList.find((e) => e.groupName === group.groupName) ? (
                                                                                                <Tooltip
                                                                                                        title={intl.formatMessage({
                                                                                                            id: "This section contains errors",
                                                                                                        })}
                                                                                                >
                                                                                                    <Box className={"tab-with-error"}>
                                                                                                        {group.label
                                                                                                                ? group.labelTranslated
                                                                                                                        ? group.label
                                                                                                                        : intl.formatMessage({id: group.label})
                                                                                                                : ""}
                                                                                                        <TCIcon
                                                                                                                iconCode={"tci-alert-outline"}
                                                                                                                variant={"body1"}
                                                                                                                sx={{
                                                                                                                    fontSize: "1rem",
                                                                                                                    marginLeft: "5px",
                                                                                                                }}
                                                                                                        />
                                                                                                    </Box>
                                                                                                </Tooltip>
                                                                                        ) : group.label ? (
                                                                                                group.labelTranslated ? (
                                                                                                        group.label
                                                                                                ) : (
                                                                                                        intl.formatMessage({id: group.label})
                                                                                                )
                                                                                        ) : (
                                                                                                ""
                                                                                        )
                                                                                    }
                                                                                    {...a11yProps(index)}
                                                                            />
                                                                    )
                                                                    : null
                                                    ))}
                                                </Tabs>
                                            </Box>
                                            {sectionElements}
                                        </Box>
                                        {/*</Box>*/}
                                    </Grid>
                                </Card>
                            </form>
                        </Grid>
                    </Grid>
                </EntityTranslationContextProvider>
            </NavigationBlocker>
    );
};

