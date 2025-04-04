import React, {useEffect, useState} from "react";
import {
    ABaseApiController,
    DailyPublicRegistrationContainer,
    loadInterfaceBuilder
} from "@tcpos/backoffice-core";
import type {IApiError} from "@tcpos/backoffice-core";
import {rwModes} from "@tcpos/common-core";
import type {ITreeData, IWDConfirmDialogProps} from "@tcpos/backoffice-components";
import {
    EntityTranslationContextProvider,
    TranslationFormats,
    useAppDispatch,
    useDailyNavigateToField,
    WD_ConfirmDialog,
    WD_TreeContainer
} from "@tcpos/backoffice-components";
import {useIntl} from "react-intl";
import {Box, Card, CardContent, CardHeader, Grid, Typography} from "@mui/material";
import "../../../components/EntityComponent/entityMainComponent.scss";
import {useTheme} from "@mui/material/styles";
import type {DropOptions, NodeModel} from "@minoru/react-dnd-treeview";
import "./jsonRenderer.scss";
import {CustomNodeText} from "./CustomNodeText";
import _ from "underscore";
import { NodeSubType, NodeType} from "./IJsonTreeData";
import type {IJsonTreeData} from "./IJsonTreeData";
import {CustomNodeAction} from "./CustomNodeAction";
import {Placeholder} from "./Placeholder";
import {useJsonDataManager} from "./useJsonDataManager";
import {SetEntityDialog} from "./SetEntityDialog";
import type {ISetEntityDialogProps} from "./ISetEntityDialogProps";
import type {PageLayoutType} from "./PageLayoutType";
import {ViewModeSplitButton} from "./ViewModeSplitButton";
import {ComponentsViewSplitButton} from "./ComponentsViewSplitButton";
import type {IComponentsView} from "./IComponentsView";
import {NewButton} from "./NewButton";
import {ExternalPreview} from "./ExternalPreview";
import {AddMissingFieldsButton} from "./AddMissingFieldsButton";
import {excludedFieldNames} from "./excludedFieldNames";
import {DownloadJsonButton} from "./DownloadJsonButton";
import {UiSimulatorFieldList} from "./UiSimulatorFieldList";
import type {IJsonTreeActions, JsonTreeActionType} from "./IJsonTreeActions";
import {UIPreviewComponentWrapper} from "./UIPreviewComponentWrapper";
import {UploadJsonButton} from "./UploadJsonButton";
import {ImportJsonDialog} from "./ImportJsonDialog";

export const JsonRenderer = () => {

    const theme = useTheme();
    const intl = useIntl();
    const dispatch = useAppDispatch();

    /**
     * The container width is used to calculate the width of the preview component simulating the screen size
     */
    const [containerWidth, setContainerWidth] = useState<number>(0);

    /**
     * Preview object name
     */
    const [objectName, setObjectName] = useState<string | undefined>(undefined);

    /**
     * Preview tabs value
     */
    const [tabsValue, setTabsValue] = React.useState(0);
    const handleTabsValueChange = (value: number) => {
        setTabsValue(value);
    }

    /**
     * Json conversion error
     */
    const [jsonError, setJsonError] = useState<string>("");

    /**
     * Layout mode
     */
    const [layoutModel, setLayoutModel] = useState<PageLayoutType>("Horizontal");
    const onViewModeChange = (viewMode: PageLayoutType) => {
        setLayoutModel(viewMode);
    }

    /**
     * Views: Json can be visible or not; preview can be visible or not and, if visible, can be in an external window
     */
    const [componentVisibilities, setComponentVisibilities] =
            useState<IComponentsView>({design: true, preview: true});
    const onViewChange = (visibilities: IComponentsView) => {
        setComponentVisibilities(visibilities);
    }
    const [openExternal, setOpenExternal] = useState<boolean>(false);
    const [isPreviewVisibleInMainWindow, setIsPreviewVisibleInMainWindow] = useState<boolean>(true);
    useEffect(() => {
        setIsPreviewVisibleInMainWindow(componentVisibilities.preview && !openExternal);
    }, [componentVisibilities, openExternal]);
    const onExternalWindowClose = () => {
        setOpenExternal(false);
    };

    /**
     * Container width observer
     */
    useEffect(() => {
        const container = document.getElementById('json-renderer-container');
        if (container) {
            const resizeObserver = new ResizeObserver(entries => {
                for (let entry of entries) {
                    setContainerWidth(entry.contentRect.width);
                }
            });
            resizeObserver.observe(container);
            return () => {
                resizeObserver.unobserve(container);
            };
        }
    }, []);

    /**
     * Entity list
     */
    const [entityList, setEntityList] = useState<string[]>([]);
    const snakeToPascal = (snakeCase: string) => {
        return snakeCase
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join('');
    };
    const getEntityList = async () => {
        const apiController = DailyPublicRegistrationContainer.resolve(ABaseApiController);
        if (!apiController) {
            throw new Error('API controller not found');
        }
        const apiResponse = await apiController.dataListLoad("Permission", [
            {id: 1, parentId: 0, mode: "AND", type: "filterGroup"},
            {id: 2, parentId: 1, field: 'PermissionType', values: [0], type: "filter", operator: "Number.equals"},
            {id: 3, parentId: 1, field: 'PermissionName', values: ['-api-get'], type: "filter", operator: "String.endsWith"},
        ], [], ['PermissionName'], undefined, undefined, undefined, true);
        if (apiResponse && !(apiResponse as IApiError).status) {
            setEntityList((apiResponse as Record<string, any>[]).map(el => el.PermissionName.replace('-api-get', '') /*snakeToPascal(el.Entity)*/));
        } else {
            throw new Error('Entity list not found');
        }
    };
    useEffect(() => {
        getEntityList();
    }, []);

    /**
     * Json import
     */
    const [openJsonImportDialog, setOpenJsonImportDialog] = useState<boolean>(false);
    const [importedJson, setImportedJson] = useState<string>(""); // The json imported from the dialog
    const [importedJsonError, setImportedJsonError] = useState<string>(""); // The json imported from the dialog
    const onImportedJsonChanged = (json: string) => {
        if (json !== "") {
            try {
                const parsedJson = JSON.parse(json);
                if (parsedJson) {
                    const error = jsonDataManager.validateJson(parsedJson);
                    if (error !== "") {
                        setImportedJsonError(error);
                    } else {
                        setImportedJsonError("");
                    }
                }
            } catch (err) {
                setImportedJsonError("Wrong json - " + err);
            }
        }
        setImportedJson(json);
    };
    const onJsonImportOk = () => {
        setOpenJsonImportDialog(false);
        uploadJson(importedJson);
    };
    const onJsonImportCancel = () => {
        setOpenJsonImportDialog(false);
    };

    /**
     * Json tree actions
     */
    const [jsonTreeActions, setJsonTreeActions] = useState<IJsonTreeActions>({
        action: undefined,
        params: undefined,
        active: false
    });
    /**
     * This function is executed when an action is called by the json tree. It sets a state variable which in turn triggers the action.
     * This must be done because it is not possible to call the action directly from the tree component, as it would use a not updated
     * version of the json data due to the memoization.
     * @param actionType The action type
     * @param args The arguments of the action
     */
    const handleJsonDataManagerAction = (actionType: JsonTreeActionType, args: Record<string, unknown>) => {
        setJsonTreeActions({action: actionType, params: args, active: true});
    }
    /**
     * Json data manager hook
     */
    const jsonDataManager = useJsonDataManager(handleJsonDataManagerAction);
    /**
     * Json tree actions triggered when jsonTreeActions.active is true
     */
    useEffect(() => {
        if (jsonTreeActions.active) {
            switch (jsonTreeActions.action) {
                case 'addGroup':
                    jsonDataManager.addElementToJson('Group', jsonTreeActions.params.nodeId);
                    break;
                case 'addSection':
                    jsonDataManager.addElementToJson('Section', jsonTreeActions.params.nodeId);
                    break;
                case 'addComponent':
                    jsonDataManager.addElementToJson('Component', jsonTreeActions.params.nodeId);
                    break;
                case 'addProperty':
                    jsonDataManager.addElementToJson('Property', jsonTreeActions.params.nodeId, jsonTreeActions.params);
                    break;
                case 'removeArrayElement':
                    jsonDataManager.removeArrayElement(jsonTreeActions.params.nodeId);
                    break;
                case 'removeProperty':
                    jsonDataManager.removeProperty(jsonTreeActions.params.nodeId);
                    break;
                case 'reorderArray':
                    jsonDataManager.arrayReorder(jsonTreeActions.params.newTreeData, jsonTreeActions.params.arrayNodes);
                    break;
                case 'onTextChange':
                    jsonDataManager.exitEditMode(jsonTreeActions.params.value);
                    break;
                case 'onChangeEditMode':
                    if (jsonDataManager.jsonData.treeData.length > 0) { // This condition is necessary to avoid the first render (which causes a race condition)
                        if (jsonTreeActions.params.params.edit) { // The tree entered in edit mode
                            jsonDataManager.enterEditMode(Number(jsonTreeActions.params.id));
                        } else { // The tree exited from edit mode
                            jsonDataManager.exitEditMode(jsonTreeActions.params.value);
                        }
                    }
                    break;
                case 'addComponentFromField':
                    jsonDataManager.addComponentFromField(jsonTreeActions.params.newTreeData, jsonTreeActions.params.componentsNodeId,
                            jsonTreeActions.params.entityName, jsonTreeActions.params.fieldName);
                    break;
                case 'addSubForm':
                    setEntityDialogProps({
                        open: true,
                        message: "",
                        error: "",
                        nodeId: jsonTreeActions.params.nodeId,
                        label: intl.formatMessage({id: "Entity name"}),
                        subFormEntity: true,
                        title: intl.formatMessage({id: "Add subform component"}),
                        entityList: entityList
                    });
                    break;
                case 'locateComponent':
                    locateComponent(jsonTreeActions.params.nodeId);
                    break;
                default:
                    break;
            }
            setJsonTreeActions({action: undefined, params: undefined, active: false});
        }
    }, [jsonTreeActions, jsonDataManager]);

    const navigateToField = useDailyNavigateToField(
            objectName ?? "", "0", tabsValue, handleTabsValueChange, false
    );

    /**
     * Locate a component
     */
    const locateComponent = (nodeId: number | string) => {
        const entity = jsonDataManager.getEntityComponent(nodeId);
        const componentName = jsonDataManager.getNodeName(nodeId);
        const componentType = jsonDataManager.jsonData.treeData
                .filter(el => el.parent === nodeId)
                .find(el => 'key' in el && el.key === 'componentType');
        if (componentType && 'value' in componentType && componentType.value === "wdSubForm") {
            let parent = jsonDataManager.jsonData.treeData.find(el => el.id === nodeId)?.parent;
            let parentNode = jsonDataManager.jsonData.treeData.find(el => el.id === parent);
            while (parentNode && parentNode.id !== 0 && parentNode.data?.nodeSubType !== "layoutGroups") {
                if (parentNode.data?.nodeSubType === "layoutGroupElement") {
                    setTabsValue(parentNode.data && 'key' in parentNode.data ? (parentNode.data as any).key : "");
                    return;
                }
                parentNode = jsonDataManager.jsonData.treeData.find(el => el.id === parentNode?.parent);
            }
        }
        const fieldNameNodeData = jsonDataManager.jsonData.baseData.filter(
                el => el.parent === nodeId
        )?.find(
                node => node.data && 'key' in node.data && node.data?.key === 'fieldName'
        )?.data;
        if (componentName && fieldNameNodeData && 'value' in fieldNameNodeData) {
            const fieldName = fieldNameNodeData.value;
            if (entity && componentName && fieldName) {
                navigateToField.dailyNavigateToField({entityName: entity, entityId: "0", fieldName: String(fieldName),
                    componentId: String(componentName)});
            }
        }
    }

    /**
     * Json tree
     */
    const [triggerOpenNodes, setTriggerOpenNodes] = useState<boolean>(false);
    const canDrop = (treeData: NodeModel<IJsonTreeData>[], dragSource?: NodeModel<IJsonTreeData> | NodeModel<ITreeData>,
                     dropTarget?: NodeModel<IJsonTreeData>) => {
        if (dragSource && dropTarget) {
            const currentSourceParent =
                    treeData.find(el => el.id === dragSource.parent);
            const currentSourceTag = String(dragSource.data?.params?.tag ?? "");
            return (currentSourceParent?.data && 'key' in currentSourceParent?.data &&
                            dropTarget?.data && 'key' in dropTarget?.data &&
                            currentSourceParent?.data?.key === dropTarget?.data?.key) ||
                    (currentSourceTag === 'fieldList' && dropTarget?.data && 'key' in dropTarget?.data &&
                            dropTarget?.data.key === 'components');
        }
    };
    const handleDrop = (sourceId: string, targetId: string, newTreeData?: NodeModel<IJsonTreeData>[], options?: DropOptions<IJsonTreeData>) => {
        if (sourceId.substring(0, "Schema".length) === 'Schema' && newTreeData) {
            const sourceNode = fieldTree.find(node => node.id === sourceId);
            const targetNode = jsonDataManager.jsonData.treeData.find(el =>
                    el.id === Number(targetId));
            if (sourceNode && sourceNode?.data?.params?.entity && sourceNode?.data?.params?.property && targetNode?.id) {
                jsonDataManager.addComponentFromField(newTreeData, targetNode.id,
                        String(sourceNode.data.params.entity), String(sourceNode.data.params.property));
            }
        } else if (newTreeData) {
            const sourceNode = jsonDataManager.jsonData.treeData.find(el =>
                    el.id === Number(targetId));
            const targetNode = jsonDataManager.jsonData.treeData.find(el =>
                    el.id === Number(sourceId));
            if (sourceNode && targetNode) {
                handleJsonDataManagerAction('reorderArray', {
                    newTreeData: newTreeData,
                    arrayNodes: _.uniq([sourceNode.id, targetNode.parent])
                });
            }
        }
    };

    /**
     * Json data
     */
    const [json, setJson] = useState<any>({});

    /**
     * Keeps track of open nodes in the json tree
     */
    const onChangeOpen = (newOpenIds: (number | string)[]) => {
        jsonDataManager.updateTreeData(newOpenIds);
    };

    /**
     * Loads the json schema for the requested entity
     * @param entityName
     */
    const getDataSchemaFromAPI = async (entityName: string) => {
        const apiController = DailyPublicRegistrationContainer.resolve(ABaseApiController);
        if (!apiController) {
            throw new Error('API controller not found');
        }
        const apiResponse = await apiController.getDataSchema(entityName, "Retrieve");
        if (apiResponse && !(apiResponse as any).status) {
            return (JSON.parse(String(apiResponse)) as Record<string, unknown>).schema;
        } else {
            throw new Error('Entity not found');
        }
    };

    /**
     * Entity dialog: on ok, the json schema is loaded from the API
     */
    const [entityDialogProps, setEntityDialogProps] =
            useState<Omit<ISetEntityDialogProps, 'onOk' | 'onCancel' | 'onTextChanged'>>({
                open: false, title: "", message: "", label: "", nodeId: 0, error: "", subFormEntity: false, entityList: entityList});
    const newEntity = () => {
        setEntityDialogProps({
            open: true,
            title: intl.formatMessage({id: "Entity name"}),
            message: `${intl.formatMessage({id: "Insert an entity (db table) name"})}`,
            label: "",
            nodeId: 0,
            error: "",
            subFormEntity: false,
            entityList: entityList
        });
    };
    const onEntityDialogCancel = () => {
        setEntityDialogProps({...entityDialogProps, open: false});
    };
    const onEntityDialogOk = async (entity: string, id?: number | string, addSubFields?: boolean) => {
        if (!id && entityDialogProps.subFormEntity) {
            setEntityDialogProps({...entityDialogProps, open: false});
            throw new Error('Node id not found');
        }
        try {
            const convApiResponse = await getDataSchemaFromAPI(entity);
            if (convApiResponse) {
                if (!entityDialogProps.subFormEntity) {
                    // Main entity for page
                    setObjectName(entity);
                    jsonDataManager.setNewObject(entity, [{name: entity, schema: convApiResponse}]);
                } else {
                    // Subform component entity
                    jsonDataManager.addSubForm(entity, id!, !!addSubFields, {name: entity, schema: convApiResponse});
                }
                setEntityDialogProps({...entityDialogProps, open: false});
            } else {
                setEntityDialogProps({...entityDialogProps, error: `${intl.formatMessage({id: "Json schema error"})}`});
            }
        } catch (err) {
            console.log(err);
            setEntityDialogProps({...entityDialogProps, error: `${intl.formatMessage({id: "Json schema error"})}: ${err}`});
        }
    };
    const onEntityDialogTextChanged = () => {
        setEntityDialogProps(prevProps => ({...prevProps, error: ""}));
    };

    const [dialogProps, setDialogProps] = useState<IWDConfirmDialogProps>({
        title: "", message: "", open: false, actions: []
    });

    /**
     * Updates the json data for the preview
     */
    useEffect(() => {
        const newJson = jsonDataManager.convertTreeData2Json();
        if (!_.isEqual(json, newJson)) {
            const error = jsonDataManager.validateJson(newJson);
            setJsonError(error);
            if (error === "") {
                setJson(newJson);
                dispatch(loadInterfaceBuilder({
                    objectName: objectName ?? "",
                    defaultGridView: {
                        editInline: false,
                        label: "",
                        layout: [],
                        quickOps: []
                    },
                    toolbar: [],
                    entityName: objectName ?? "",
                    detailView: newJson.detailView ?? {

                    }
                }));
            } else {
                setJson(null);
                console.log(error)
            }
        }
    }, [jsonDataManager.jsonData.treeData]);

    /**
     * Field list
     */
    const [usedFields, setUsedFields] =
            useState<{ numberUsed: number, numberNotUsed: number } | undefined>(undefined);
    useEffect(() => {
        const usedFields = jsonDataManager.jsonData.baseData.filter(
                node => node.data && 'key' in node.data && node.data?.key === "fieldName" &&
                        jsonDataManager.getEntityComponent(node.id) === objectName
        ).map(node => node.data && 'value' in node.data ? node.data?.value : "");
        setFieldTree(fieldTree => fieldTree.map(node => {
            return {
                ...node,
                data: {
                    ...node.data,
                    icon: usedFields.includes(node.text) ? 'check' : undefined,
                    iconColor: usedFields.includes(node.text) ? 'success' : undefined,
                    params: {...(node.data?.params ?? {}), used: usedFields.includes(node.text)}
                },
            }
        }));
    }, [jsonDataManager.jsonData]);
    const [fieldTree, setFieldTree] = useState<NodeModel<ITreeData>[]>([]);
    useEffect(() => {
        setUsedFields({
            numberUsed: fieldTree.filter(el =>
                    el.data?.params?.tag === 'fieldList' && el.data?.params?.used
            ).length,
            numberNotUsed: fieldTree.filter(el =>
                    el.data?.params?.tag === 'fieldList' && !el.data?.params?.used
            ).length
        });
    }, [fieldTree]);
    useEffect(() => {
        let globalIndex = jsonDataManager.dataSchema.length;
        const newFieldTree: NodeModel<ITreeData>[] = [];
        jsonDataManager.dataSchema.forEach((el, index) => {
            const node: NodeModel<ITreeData> = {
                id: "Schema" + (index + 1),
                parent: 0,
                text: el.name,
                droppable: true,
            }
            newFieldTree.push(node);
            Object.keys(el.schema.properties).filter(key => !excludedFieldNames.includes(key)).forEach(key => {
                globalIndex++;
                const subNode: NodeModel<ITreeData> = {
                    id: "Schema" + (globalIndex + 1),
                    parent: "Schema" + (index + 1),
                    text: key,
                    droppable: false,
                    data: {
                        params: {entity: el.name, property: key, tag: 'fieldList'}
                    },
                };
                newFieldTree.push(subNode);
            });
        });
        setFieldTree(newFieldTree);
    }, [jsonDataManager.dataSchema]);
    const addMissingFields = () => {
        if (objectName) {
            jsonDataManager.addMissingFields(objectName);
        }
    };

    /**
     * Downloads the generated json
     */
    const downloadJson = () => {
        const hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:attachment/text,' + encodeURI(JSON.stringify(json, null, 2));
        hiddenElement.target = '_blank';
        hiddenElement.download = `${objectName ?? 'noName'}.json`;
        hiddenElement.click();
    };

    const uploadJson = (json: string) => {
        jsonDataManager.createJson(JSON.parse(json));
    };

    const [documentObject, setDocumentObject] = useState<Document>(document);

    useEffect(() => {
        setDocumentObject(document);
    }, [jsonDataManager.jsonData]);

    return <EntityTranslationContextProvider
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
        <ImportJsonDialog open={openJsonImportDialog} json={importedJson} onJsonChanged={onImportedJsonChanged}
                          onOk={onJsonImportOk} onCancel={onJsonImportCancel} error={importedJsonError} />
        <WD_ConfirmDialog
                title={dialogProps.title}
                message={dialogProps.message}
                open={dialogProps.open}
                actions={dialogProps.actions}
        />
        <SetEntityDialog {...entityDialogProps}
                         onOk={onEntityDialogOk}
                         onCancel={onEntityDialogCancel}
                         onTextChanged={onEntityDialogTextChanged}
        />
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Card>
                    <CardHeader
                            title={intl.formatMessage({id: `UI Simulator ${objectName ? `: ${objectName}` : ''}`})}
                            action={
                                <Box sx={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                                    <NewButton onEvent={newEntity}/>
                                    <AddMissingFieldsButton onEvent={addMissingFields}/>
                                    <DownloadJsonButton onEvent={downloadJson}/>
                                    <UploadJsonButton onEvent={() => setOpenJsonImportDialog(true)}/>
                                    <ComponentsViewSplitButton onViewChange={onViewChange} disabled={openExternal}/>
                                    <ViewModeSplitButton onViewModeChange={onViewModeChange}/>
                                </Box>
                            }
                    />
                    <CardContent>
                        <Box>
                            <Grid container spacing={6} alignItems={'stretch'}>
                                <Grid item xs={12} md={12} display={'flex'} flex={1}
                                      sx={{height: '100%', marginTop: '-36px'}}>
                                    <Box sx={{margin: '16px 16px 16px 16px'}} width={'100%'}
                                         height={'calc(100vh - 280px)'}>
                                        <Grid container spacing={3}
                                              alignItems={layoutModel === 'Horizontal' ? 'stretch' : 'flex-start'}
                                              flexDirection={layoutModel === 'Horizontal' ? 'row' : 'column'}
                                              id={'json-renderer-container'}
                                        >
                                            <Grid item
                                                  xs={12 / (layoutModel === 'Horizontal' && isPreviewVisibleInMainWindow ? 2 : 1)}
                                                  md={12 / (layoutModel === 'Horizontal' && isPreviewVisibleInMainWindow ? 2 : 1)}
                                                  display={'flex'}
                                                  sx={{
                                                      stretch: layoutModel === 'Horizontal' ? {height: '100%'} : undefined,
                                                      width: layoutModel === 'Vertical' ? '100%' : undefined,
                                                      display: componentVisibilities.design || !isPreviewVisibleInMainWindow ? 'flex' : 'none'
                                                  }}
                                            >
                                                <Box sx={{
                                                    display: 'flex',
                                                    flex: 1,
                                                    flexDirection: layoutModel === 'Horizontal' ? 'column' : 'row',
                                                    height: (layoutModel === 'Horizontal'
                                                            ? 'calc(100vh - 280px)'
                                                            : `calc((100vh - 280px) / ${isPreviewVisibleInMainWindow ? 2 : 1})`),
                                                    minHeight: (layoutModel === 'Horizontal' ? '100%' : '300px'),
                                                    overflow: 'auto'
                                                }}>
                                                    <Box sx={{
                                                        border: '1px solid', borderColor: theme.palette.primary.light,
                                                        flex: 1,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        overflow: 'auto'
                                                    }}>
                                                        <UiSimulatorFieldList
                                                                usedFields={usedFields}
                                                                treeData={fieldTree}
                                                                element={monitorProps => (<div></div>)}
                                                        />
                                                    </Box>
                                                    <Box sx={{
                                                        border: '1px solid', borderColor: theme.palette.primary.light,
                                                        flex: 2,
                                                        overflow: 'auto',
                                                        mt: layoutModel === 'Vertical' ? 0 : 1,
                                                        ml: layoutModel === 'Vertical' ? 1 : 0,
                                                    }}>
                                                        <Typography variant={'body1'} sx={{fontFamily: 'Monospace'}}>
                                                            <WD_TreeContainer
                                                                    treeData={jsonDataManager.jsonData.treeData}
                                                                    initialOpen={jsonDataManager.jsonData.openNodes.length === 0
                                                                            ? "all"
                                                                            : jsonDataManager.jsonData.openNodes.map(el => Number(el))}
                                                                    componentName={'jsonTree'}
                                                                    bindingGuid={''}
                                                                    groupName={''}
                                                                    label={''}
                                                                    rwMode={rwModes.W}
                                                                    insertDroppableFirst={false}
                                                                    openNodes={jsonDataManager.jsonData.openNodes}
                                                                    closeNodes={[]}
                                                                    triggerOpenNodes={false}
                                                                    triggerCloseNodes={false}
                                                                    triggerOpenAllNodes={false}
                                                                    triggerCloseAllNodes={false}
                                                                    triggerResetOpenNodes={triggerOpenNodes}
                                                                    treeClasses={{
                                                                        root: "json-renderer-tree",
                                                                        listItem: "json-renderer-tree"
                                                                    }}
                                                                    nodeTextRenderer={CustomNodeText}
                                                                    nodeActionsAfterTextRenderer={CustomNodeAction}
                                                                    onChangeOpen={onChangeOpen}
                                                                    customCanDrag={(node) =>
                                                                            node?.data?.nodeType === NodeType.ArrayElement}
                                                                    onDrop={handleDrop}
                                                                    canDrop={(currentTree,
                                                                              {dragSource, dropTarget}) =>
                                                                            canDrop(currentTree, dragSource, dropTarget)}
                                                                    placeholderRender={(node, {depth}) => (
                                                                            <Placeholder node={node} depth={depth}/>
                                                                    )}
                                                                    dragPreviewRender={(monitorProps => (
                                                                            <div>{monitorProps.item.data && 'key' in monitorProps.item.data ?
                                                                                    monitorProps.item.data.key :
                                                                                    monitorProps.item.text}</div>
                                                                    ))}
                                                            />
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                            <Grid item
                                                  xs={12 / (layoutModel === 'Horizontal' && componentVisibilities.design ? 2 : 1)}
                                                  md={12 / (layoutModel === 'Horizontal' && componentVisibilities.design ? 2 : 1)}
                                                  display={'flex'} flex={1}
                                                  sx={{
                                                      stretch: layoutModel === 'Horizontal' ? {height: '100%'} : undefined,
                                                      width: layoutModel === 'Vertical' ? '100%' : undefined,
                                                      display: isPreviewVisibleInMainWindow ? 'flex' : 'none'
                                                  }}
                                            >
                                                <Box sx={{
                                                    border: '1px solid', borderColor: theme.palette.primary.light,
                                                    height: (layoutModel === 'Horizontal'
                                                            ? 'calc(100vh - 280px)'
                                                            : `calc((100vh - 280px) / ${componentVisibilities.design ? 2 : 1})`),
                                                    minHeight: (layoutModel === 'Horizontal' ? '100%' : '300px'),
                                                    overflow: 'auto', backgroundColor: theme.palette.background.paper,
                                                    ml: 0, mt: 0, width: '100%'
                                                }}>
                                                    <UIPreviewComponentWrapper
                                                            json={json}
                                                            containerWidth={containerWidth / (layoutModel === 'Horizontal' ? 2 : 1)}
                                                            isInMainWindow={true}
                                                            onOpenInNewWindowClick={() => setOpenExternal(true)}
                                                            tabsValue={tabsValue}
                                                            handleTabsValueChange={handleTabsValueChange}
                                                            error={jsonError}
                                                    />
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                    </CardContent>

                </Card>
            </Grid>
        </Grid>
        <ExternalPreview
                onClose={onExternalWindowClose}
                open={openExternal}
                styleData={jsonDataManager.jsonData.baseData}
        >
            {openExternal ?
                    <UIPreviewComponentWrapper
                            json={json}
                            classes={{
                                gridItem: 'grid-item',
                                detailView: {gridContainer: 'main-component-preview'}
                            }}
                            isInMainWindow={false}
                            objectName={objectName}
                            tabsValue={tabsValue}
                            handleTabsValueChange={handleTabsValueChange}
                            error={jsonError}
                    />
                    : null}

        </ExternalPreview>
        <div style={{display: 'none'}}>
            <UIPreviewComponentWrapper
                    json={json}
                    classes={{
                        gridItem: 'grid-item',
                        detailView: {gridContainer: 'main-component-preview'}
                    }}
                    isInMainWindow={false}
                    objectName={objectName}
                    tabsValue={tabsValue}
                    handleTabsValueChange={handleTabsValueChange}
                    error={jsonError}
            />
        </div>
    </EntityTranslationContextProvider>;
}