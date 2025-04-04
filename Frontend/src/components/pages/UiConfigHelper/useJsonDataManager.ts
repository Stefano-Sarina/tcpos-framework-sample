import {useEffect, useState} from 'react';
import type {NodeModel} from "@minoru/react-dnd-treeview";
import type {IJsonTreeData, IOptionalProperties} from "./IJsonTreeData";
import { JsonTreeRenderer} from "./jsonTreeRenderer";
import type {IJsonDataBuild} from "./IJsonDataBuild";
import type {JsonElementsType} from "./JsonElementsType";
import type {IAddElementFunctions} from "./IAddElementFunctions";
import type {IDataSchema} from "./IDataSchema";
import {excludedFieldNames} from "./excludedFieldNames";
import type {JsonTreeActionType} from './IJsonTreeActions';

/**
 * Json data manager hook
 * @param jsonDataActions Function to call the json data actions (identified by an action type)
 * @param initialData Json data initialization (or reset)
 * @param entityName Main entity name
 * @param initialDataSchema Initial data schema
 */
export const useJsonDataManager = (
        jsonDataActions: (actionType: JsonTreeActionType, args: Record<string, unknown>) => void,
        initialData?: { jsonData: NodeModel<IJsonTreeData>[], openNodes: (string | number)[], dataSchema: IDataSchema[] },
        entityName?: string,
        initialDataSchema?: IDataSchema
) => {

    /**
     * Json data state:
     * baseData: each node is a json node; the dependencies are managed by the tree structure
     * treeData: the final tree data to render; it adds to baseData the closing nodes
     * openNodes: the nodes that are open
     * dataSchema: the data schema
     */
    const [jsonData, setJsonData] = useState<IJsonDataBuild>(() => {
        const jsonTreeRenderer = new JsonTreeRenderer(jsonDataActions);
        if (initialData) {
            return {
                baseData: initialData.jsonData,
                treeData: jsonTreeRenderer.finalNodeRendering(initialData),
                openNodes: initialData.openNodes,
                dataSchema: initialData.dataSchema
            };
        } else {
            if (entityName) {
                return jsonTreeRenderer.initializeTreeData(entityName, initialDataSchema ? [initialDataSchema] : []);
            } else {
                return {
                    baseData: [],
                    treeData: [],
                    openNodes: [],
                    dataSchema: []
                }
            }
        }
    });

    /**
     * New object initialization
     * @param entityName
     * @param dataSchema
     */
    const setNewObject = (entityName: string, dataSchema: IDataSchema[]) => {
        setJsonData(jsonTreeRenderer.initializeTreeData(entityName, dataSchema));
        setDataSchema(dataSchema);
    };

    /**
     * Node id being edited
     */
    const [nodeIdBeingEdited, setNodeIdBeingEdited] =
        useState<{ nodeId: string | number, newValue: string | undefined, edit: boolean } | undefined>(undefined);

    /**
     * Data schema TODO: remove
     */
    const [dataSchema, setDataSchema] = useState<IDataSchema[]>([]);

    /**
     * Logic for tree rendering
     */
    const jsonTreeRenderer = new JsonTreeRenderer(jsonDataActions);

    /**
     * Functions used to add a new element to the json data
     */
    const addElementFunctions: IAddElementFunctions = {
        operations: [
            {type: 'Group',
                function: (treeData, id) =>
                    jsonTreeRenderer.addGroupElement(treeData, id)},
            {type: 'Section',
                function: (treeData, id) =>
                    jsonTreeRenderer.addSectionElement(treeData, id)},
            {type: 'Component',
                function: (treeData, id) =>
                    jsonTreeRenderer.addComponentElement(treeData, id)
            },
            {type: 'Property',
                function: (treeData, id, property: IOptionalProperties) =>
                    jsonTreeRenderer.addProperty(treeData, id, property)
            },
        ]
    };

    /**
     * Add data schema TODO
     * @param schema
     */
    const addDataSchema = (schema: IDataSchema) => {
        const newDataSchema = [...dataSchema];
        const existingSchemaIndex = newDataSchema.findIndex(el => el.name === schema.name);
        if (existingSchemaIndex !== -1) {
            newDataSchema.splice(existingSchemaIndex, 1);
        }
        setDataSchema([...dataSchema, schema]);
    };

    /**
     * Updates the json object
     * @param data
     */
    const updateData = (data: { jsonData: NodeModel<IJsonTreeData>[], openNodes: (string | number)[] }) => {
        setJsonData({
            baseData: data.jsonData,
            treeData: jsonTreeRenderer.finalNodeRendering(data),
            openNodes: data.openNodes,
            dataSchema: dataSchema
        });
    };

    /**
     * Updates the tree data property of json data
     * @param openNodes List of open nodes
     */
    const updateTreeData = (openNodes: (string | number)[]) => {
        setJsonData(prevData => ({
            ...prevData,
            treeData: jsonTreeRenderer.finalNodeRendering({ jsonData: prevData.baseData, openNodes }),
            openNodes: openNodes
        }));
    };

    /**
     * Converts the tree data to json
     */
    const convertTreeData2Json = () => {
        return jsonTreeRenderer.convertTreeData2Json(jsonData.treeData);
    };

    /**
     * Node edit management
     */
    const enterEditMode = (nodeId: string | number) => {
        setNodeIdBeingEdited({nodeId, newValue: undefined, edit: true});
    };
    const exitEditMode = (newValue?: string) => {
        if (nodeIdBeingEdited) {
            setNodeIdBeingEdited({nodeId: nodeIdBeingEdited?.nodeId, newValue, edit: false});
        }
    };
    useEffect(() => {
        if (nodeIdBeingEdited) {
            if (nodeIdBeingEdited.edit) {
                updateData({
                    jsonData: jsonTreeRenderer.setEditMode(jsonData.baseData, nodeIdBeingEdited.nodeId),
                    openNodes: jsonData.openNodes
                });
            } else {
                updateData({
                    jsonData: jsonTreeRenderer.unsetEditMode(
                        nodeIdBeingEdited.newValue !== undefined
                        ? jsonTreeRenderer.modifyProperty(
                                jsonData.baseData, nodeIdBeingEdited.nodeId, nodeIdBeingEdited.newValue
                            )
                        : jsonData.baseData
                    ),
                    openNodes: jsonData.openNodes
                })
            }
        }
    }, [nodeIdBeingEdited]);

    /**
     * Adds an element to the json data
     * @param type
     * @param id
     * @param property
     */
    const addElementToJson = (type: JsonElementsType, id: number | string, property?: IOptionalProperties) => {
        if (type === 'Property' && !property) {
            throw new Error('Property type must have property parameter');
        }
        const func = addElementFunctions.operations.find(el =>
            el.type === type)?.function;
        if (!func) {
            throw new Error('Invalid element type');
        }
        const result = func(jsonData.baseData, id, property);
        updateData({
            jsonData: jsonTreeRenderer.updateTreeDataValueLists(result, dataSchema),
            openNodes: [...jsonData.openNodes, ...result.newNodeId]
        });
    };

    /**
     * Adds a component from a field (a field is dragged from the field list into the json tree
     * @param newTreeData Contains a temporary tree with the new node in the correct position
     * @param componentsNodeId Id of the node which receives the new component
     * @param entityName Main entity name
     * @param fieldName Dragged field
     */
    const addComponentFromField = (newTreeData: NodeModel<IJsonTreeData>[], componentsNodeId: number | string,
                                    entityName: string, fieldName: string) => {
        const result = jsonTreeRenderer.addComponentFromField(jsonData.baseData, newTreeData,
            componentsNodeId, entityName, fieldName, dataSchema, false);
        updateData({
            jsonData: jsonTreeRenderer.updateTreeDataValueLists(result, dataSchema),
            openNodes: [...jsonData.openNodes, ...result.newNodeId]
        })
    };

    /**
     * Adds a new subform component
     * @param entity
     * @param id
     * @param addSubFields
     * @param schema
     */
    const addSubForm = (entity:string, id: number | string, addSubFields: boolean, schema: IDataSchema) => {
        const result = jsonTreeRenderer.addSubFormElement(jsonData.baseData, entity, id, addSubFields, schema);
        updateData({
            jsonData: result.treeData,
            openNodes: [...jsonData.openNodes, ...result.newNodeId]
        })
    };

    /**
     * Add apiCallInfo property to a combobox node
     * @param nodeId
     */
/*     const addApiCallInfoProperty = (nodeId: number | string) => {
        const result = jsonTreeRenderer.addApiCallInfoProperty(jsonData.baseData, nodeId);
        updateData({
            jsonData: result.treeData,
            openNodes: [...jsonData.openNodes, ...result.newNodeId]
        });
    }
 */
    /************************************************************************
        Combo box properties
    *************************************************************************/
    /**
     * Add externalDataInfo property to a combobox node
     * @param nodeId
     */
/*     const addExternalDataInfoProperty = (nodeId: number | string) => {
        const result = jsonTreeRenderer.addExternalDataInfoProperty(jsonData.baseData, nodeId);
        updateData({
            jsonData: result.treeData,
            openNodes: [...jsonData.openNodes, ...result.newNodeId]
        });
    }
 */    /**
     * Add externalDataInfo subproperty to an externalDataInfo property node
     * @param nodeId
     * @param property
     */
/*     const addExternalDataInfoSubProperty = (nodeId: number | string, property: 'apiCallInfo' | 'customList') => {
        let result: {treeData: NodeModel<IJsonTreeData>[], newNodeId: (string | number)[]};
        if (property === 'apiCallInfo') {
            result = jsonTreeRenderer.addApiCallInfoProperty(jsonData.baseData, nodeId);
        } else {
            result = jsonTreeRenderer.addCustomListProperty(jsonData.baseData, nodeId);
        }
        updateData({
            jsonData: result.treeData,
            openNodes: [...jsonData.openNodes, ...result.newNodeId]
        });
    }
 */    /**
     * Add a dictionary item to a custom list property
     */
/*     const addCustomListElement = (nodeId: number | string) => {
        const result = jsonTreeRenderer.addCustomListElement(jsonData.baseData, nodeId);
        updateData({
            jsonData: result.treeData,
            openNodes: [...jsonData.openNodes, ...result.newNodeId]
        });
    }
 */
    /**
     * Adds all the not yet used field in the first components node of the json tree
     * @param entityName
     */
    const addMissingFields = (entityName: string) => {
        let newBaseData = [...jsonData.baseData];
        const schemaProperties = dataSchema.find(el => el.name === entityName)?.schema.properties;
        const componentsNode = newBaseData.find(el =>
            el.data && 'key' in el.data && el.data?.key === 'components');
        if (!componentsNode) {
            throw new Error('Components node not found');
        }
        if (!schemaProperties) {
            throw new Error('Schema not found');
        }
        const currentSchema = dataSchema.find(el => el.name === entityName);
        if (!currentSchema) {
            throw new Error('Entity name not found in schema');
        }
        newBaseData = jsonTreeRenderer.addMissingFieldsFromJsonSchema(newBaseData, entityName, dataSchema, excludedFieldNames, true).treeData;
        updateData({
            jsonData: jsonTreeRenderer.updateTreeDataValueLists({treeData: newBaseData, newNodeId: newBaseData.map(el => el.id)},
                dataSchema),
            openNodes: jsonData.openNodes
        })
    };

    const getEntityComponent = (nodeId: number | string) => {
        return jsonTreeRenderer.getEntityName(jsonData.baseData, nodeId);
    };
/*
    const addComponentsFromJsonSchema = (entityName: string, schema: IDataSchema, baseJsonData: NodeModel<IJsonTreeData>[], id: number | string) => {
        const schemaProperties = schema.schema.properties;
        Object.keys(schemaProperties).forEach(property => {
            if (!excludedFieldNames.includes(property)) {
                const nodeExists = baseJsonData.find(el =>
                    el.data && 'key' in el.data && el.data.key === 'fieldName' && el.data.params?.value === property &&
                    jsonTreeRenderer.getEntityName(baseJsonData, el.id) === entityName
                );
                if (!nodeExists) {
                    baseJsonData = jsonTreeRenderer.addComponentFromField(baseJsonData, baseJsonData, id,
                        entityName, property, [schema]).treeData;
                }
            }
        });
        return baseJsonData;
    };
*/

    /**
     * Remove a property from the json data
     * @param nodeId
     */
    const removeProperty = (nodeId: string | number) => {
        updateData({
            jsonData: jsonTreeRenderer.removeProperty(jsonData.baseData, nodeId),
            openNodes: jsonData.openNodes
        });
    }

    /**
     * Removes an array element from the json data
     * @param nodeId
     */
    const removeArrayElement = (nodeId: string | number) => {
        updateData({
            jsonData: jsonTreeRenderer.removeArrayElement(jsonData.baseData, nodeId),
            openNodes: jsonData.openNodes
        });
    }

    /**
     * Reorder the array elements (a node is dragged and dropped in a new position)
     * @param newTreeData
     * @param arrayNodes
     */
    const arrayReorder = (newTreeData: NodeModel<IJsonTreeData>[], arrayNodes: (string | number)[]) => {
        updateData({
            jsonData: jsonTreeRenderer.arrayReorder(jsonData.baseData, newTreeData, arrayNodes),
            openNodes: jsonData.openNodes
        });
    };

    const getNodeName = (nodeId: number | string) => {
        return jsonTreeRenderer.getNodePath(jsonData.baseData, nodeId) + "_0";
    };

    /**
     * Validation of resulting json
     * @param jsonObject
     */
    const validateJson = (jsonObject: any) => {
        return jsonTreeRenderer.jsonValidation(jsonObject);
    };

    const createJson = (jsonObject: any) => {
        const newJson = jsonTreeRenderer.buildTreeData(jsonObject);
        updateData({
            jsonData: newJson,
            openNodes: jsonData.openNodes
        });
    };

    return {
        jsonData,
        dataSchema,
        entityName,
        nodeIdBeingEdited,
        setNewObject,
        createJson,
        updateData,
        updateTreeData,
        convertTreeData2Json,
        enterEditMode,
        exitEditMode,
        addElementToJson,
        removeProperty,
        removeArrayElement,
        arrayReorder,
        addComponentFromField,
        addMissingFields,
        addDataSchema,
        addSubForm,
        getEntityComponent,
        getNodeName,
        validateJson
    };
};