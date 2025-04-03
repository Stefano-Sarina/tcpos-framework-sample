import React, {useEffect, useMemo, useState} from "react";
import {Box, Card, CardHeader, Grid, Tabs, Tooltip, useMediaQuery} from "@mui/material";
import {
    EntityComponentChildren,
    TCIcon,
    WD_Section
} from "@tcpos/backoffice-components";
import type {IInitializeDynamicList, IWDBoundComponentCommonProperties} from "@tcpos/backoffice-components";
import type {IErrorListItem} from "@tcpos/backoffice-components";
import { rwModes} from "@tcpos/common-core";
import type {IComponentVisibilityRule} from "@tcpos/common-core";
import type {IEntityDataObject} from "@tcpos/common-core";
import type {IInterfaceBuilderDetailViewModel} from "@tcpos/common-core";
import {useIntl} from "react-intl";
import type {IUiPermissions} from "./IUIPermissions";
import {DetailViewStyledTab} from "./DetailViewStyledTab";
import _ from "underscore";
import {DailyPublicRegistrationContainer} from "@tcpos/backoffice-core";
import useConfig from "../themeComponents/useConfig";
import {useTheme} from "@mui/material/styles";
import type {SxProps} from "@mui/system";

interface IDetailViewComponentProps {
    /**
     * List of groups (tabs)
     */
    currentGroupsList: IInterfaceBuilderDetailViewModel,

    /**
     * Name of the object
     */
    entityName: string,

    /**
     * Id of the object
     */
    entityId: string,

    /**
     * Page mode
     */
    rwMode: rwModes,

    /**
     * Selected tab index
     */
    tabsValue: number,

    /**
     * Function triggered when the selected tab changes
     * @param event
     * @param newValue
     */
    onChange: (event: React.SyntheticEvent, newValue: number) => void

    /**
     * Method triggered when a sub row is added (normally, in a sub form component)
     * @param entityName Entity (table) name
     */
    onAddSubRow (entityName: string) : void

    /**
     * Method triggered when a sub row is deleted (normally, in a sub form component)
     * @param entityName Entity (table) name
     * @param entityId
     */
    onDeleteSubRow (entityName: string, entityId: string) :void
    
    /**
     * Permission list on UI components
     */
    uiPermissions: IUiPermissions[] | undefined

    /**
     * Error list
     */
    errorList: IErrorListItem[]
    
    /**
     * List initialization for combo boxes with dynamic list
     * @param params
     */
    initializeList?: (params: IInitializeDynamicList) => void;

    /**
     * Method to get an external list and save it in the store
     * @param componentId unique component id in the DOM
     * @param listName unique name of list
     */
    getExternalList?: (componentId: string, listName: string) => Promise<void>

    /**
     * Visibility rule list
     */
    visibilityRules?: IComponentVisibilityRule<IEntityDataObject<object, string>[]>[]

    /**
     * True if in multiediting mode
     */
    multiEditing?: boolean

    /**
     * For subform components: index of the first visible row
     */
    visibleRowIndex?: {fieldName: string, rowIndex: number}[]

    /**
     * "sticky" value of the top of the tabs
     */
    stickyTop?: number

    /**
     * Width to consider for media query
     */
    containerWidth?: number

    classes?: {
        gridContainer?: string
    }
}

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

export const DetailViewComponent = (props: IDetailViewComponentProps) => {
    
    const intl = useIntl();
    const themeConfig = useConfig();
    const theme = useTheme();

    const [currentWidth, setCurrentWidth] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl' | undefined>(undefined);

    useEffect(() => {
        if (props.containerWidth) {
            if (props.containerWidth < theme.breakpoints.values.sm) {
                setCurrentWidth('xs');
            } else if (props.containerWidth < theme.breakpoints.values.md) {
                setCurrentWidth('sm');
            } else if (props.containerWidth < theme.breakpoints.values.lg) {
                setCurrentWidth('md');
            } else {
                setCurrentWidth('lg');
            }
        }
    }, [props.containerWidth]);

    const sectionElements = useMemo(() => {
        if (props.currentGroupsList.layoutGroups) {
            return props.currentGroupsList.layoutGroups.filter(group => !!props.uiPermissions?.find(el =>
                    el.componentName === props.entityName + '.' + group.groupName &&
                    el.access !== "NoAccess"))
                    .map((group, index) => {
                        let tabPanel: React.ReactElement<IWDBoundComponentCommonProperties>;
                        if (!group.customComponent) {
                            tabPanel = (
                                    <Grid container spacing={3}>
                                        {group.sections.map((section, sectionIndex) => {
                                            let currentRwMode: rwModes = props.rwMode;
                                            const currentPermission = props.uiPermissions?.filter(el =>
                                                    el.componentName === props.entityName + "." + group.groupName + "." + section.sectionName
                                            );
                                            let assignedPermission = "";
                                            if (currentPermission) {
                                                assignedPermission = currentPermission.find(el => el.access === 'Write')
                                                        ? "Write"
                                                        : (currentPermission.find(el => el.access === 'Read')
                                                                ? "Read"
                                                                : (currentPermission.find(el => el.access === 'NoAccess')
                                                                        ? "NoAccess" : ""));
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
                                                                    section.entityName ?? group.entityName ?? props.currentGroupsList.entityName ?? ""
                                                            }
                                                            entityId={props.entityId}
                                                            componentName={group.groupName + "." + section.sectionName}
                                                            label={section.label ? intl.formatMessage({id: section.label}) : ""}
                                                            rwMode={currentRwMode}
                                                            xs={currentWidth ? section[currentWidth] : section.xs}
                                                            sm={currentWidth ? section[currentWidth] : section.sm}
                                                            md={currentWidth ? section[currentWidth] : section.md}
                                                            lg={currentWidth ? section[currentWidth] : section.lg}
                                                            xl={currentWidth ? section[currentWidth] : section.xl}
                                                            key={"Section" + index + "_" + sectionIndex}
                                                            visibilityRules={_(props.visibilityRules ?? []).filter(
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
                                                                        section.entityName ?? group.entityName ?? props.currentGroupsList.entityName ?? ""
                                                                }
                                                                entityId={props.entityId}
                                                                rwMode={currentRwMode}
                                                                onAddSubRow={props.onAddSubRow}
                                                                onDeleteSubRow={props.onDeleteSubRow}
                                                                components={section.components.map(comp => ({
                                                                    ...comp,
                                                                    xs: currentWidth ? comp[currentWidth] : comp.xs,
                                                                    sm: currentWidth ? comp[currentWidth] : comp.sm,
                                                                    md: currentWidth ? comp[currentWidth] : comp.md,
                                                                    lg: currentWidth ? comp[currentWidth] : comp.lg,
                                                                    xl: currentWidth ? comp[currentWidth] : comp.xl,
                                                                }))}
                                                                sectionIndex={sectionIndex}
                                                                index={index}
                                                                visibleRowIndex={props.visibleRowIndex ?? []}
                                                                parentName={group.groupName + "." + section.sectionName}
                                                                visibilityRules={(props.visibilityRules ?? []).filter(
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
                                                                getExternalList={props.getExternalList}
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
                                                entityName={group.entityName ?? props.currentGroupsList.entityName ?? ""}
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
                                <TabPanel key={"TabPanel" + index} index={index} value={props.tabsValue}>
                                    {tabPanel}
                                </TabPanel>
                        );
                    });
        }
    }, [
        props.currentGroupsList.layoutGroups,
        props.currentGroupsList.layoutGroups,
        props.entityName,
        props.entityId,
        props.rwMode,
        props.visibleRowIndex,
        props.tabsValue,
        intl.locale,
        props.visibilityRules,
        props.multiEditing,
        props.uiPermissions,
            currentWidth
    ]);

    return <Grid
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
            className={(props.rwMode === rwModes.R ? "main-component-readonly" : "main-component") +
                    (props.classes?.gridContainer ? " " + props.classes.gridContainer : "")
            }
            alignItems={"center"}
    >
        <Box sx={{width: "100%", height: "100%", display: "flex", flexDirection: "column"}}>
            <Box
                    sx={{
                        borderBottom: 1,
                        borderColor: "divider",
                        position: "sticky",
                        top: props.stickyTop !== undefined ? props.stickyTop : "142px",
                        zIndex: 1200,
                        backgroundColor: (theme) =>
                                theme.palette.mode === "dark" ? "#101010" : "#fff",
                    }}
            >
                <Tabs
                        value={props.tabsValue}
                        onChange={props.onChange}
                        orientation={"horizontal"}
                        variant={"scrollable"}
                >
                    {props.currentGroupsList.layoutGroups.map((group, index) => (
                            props.uiPermissions?.find(el =>
                                    el.componentName.toLowerCase() === (props.entityName + '.' + group.groupName).toLowerCase() &&
                                    el.access !== "NoAccess") ? (
                                            <DetailViewStyledTab
                                                    key={"tab" + index}
                                                    label={
                                                        props.rwMode === rwModes.W &&
                                                        props.errorList.find((e) => e.groupName === group.groupName) ? (
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
    </Grid>;
}