import type {NodeModel} from "@minoru/react-dnd-treeview";
import type {IJsonTreeData, IJsonTreeDataArrayElement, IOptionalProperties} from "./IJsonTreeData";
import {NodeSubType, NodeType} from "./IJsonTreeData";
import {JsonConverter} from "./jsonConverter";
import type {DailyToolbarPaletteType} from "@tcpos/common-core";
import type {OverridableStringUnion} from "@mui/types";
import type {Variant} from "@mui/material/styles/createTypography";
import type {TypographyPropsVariantOverrides} from "@mui/material";
import type {ITreeAction} from "@tcpos/backoffice-components";
import type {IJsonDataBuild} from "./IJsonDataBuild";
import type {IDataSchema} from "./IDataSchema";
import type {ITreeElementProperties} from "./ITreeElementProperties";
import type {JsonTreeActionType} from "./IJsonTreeActions";
import {excludedFieldNames} from "./excludedFieldNames";

/**
 * This class contains the logics to render the JSON tree
 */
export class JsonTreeRenderer extends JsonConverter {
    /**
     * Generic action to be executed: each action calls this method specifying the action type and the parameters
     * @private
     */
    private genericAction: (actionType: JsonTreeActionType, args: Record<string, unknown>) => void;

    constructor(genericAction: (actionType: JsonTreeActionType, args: Record<string, unknown>) => void) {
        super();
        this.genericAction = genericAction;
    }

    /**
     * Add an element to the array
     * @param treeData The tree data
     * @param id The id of the array node containing the element
     * @param properties The properties of the new element (additional tree nodes depending on the main array element node)
     * @param insertPosition If set, the new element is inserted in the specified position
     * @param mainNodeSubType Sets the subtype of the array element. SubTypes are used to assign the available functions to the element
     */
    addArrayElement(treeData: NodeModel<IJsonTreeData>[], id: number | string, properties: ITreeElementProperties[],
                    insertPosition?: number, mainNodeSubType?: NodeSubType):
                                            {treeData: NodeModel<IJsonTreeData>[], newNodeId: (number | string)[]} {
        const arrayNode = treeData.find(el => el.id === id);
        if (!arrayNode) {
            return {treeData: treeData, newNodeId: []};
        }
        const newElementId = treeData.filter(el =>
                el.parent === id && el.data?.nodeType === NodeType.ArrayElement).length;
        const newNodeId = Math.max(...treeData.map(el => Number(el.id))) + 1;
        const newNodes: NodeModel<IJsonTreeData>[] = [];
        let nextNodeId = newNodeId;
        newNodes.push({
            id: newNodeId,
            parent: id,
            droppable: true,
            text: newElementId + ":",
            data: {
                typographyProps: {variant: 'body1'},
                text2TypographyProps: {variant: 'h6'},
                nodeType: NodeType.ArrayElement,
                key: newElementId,
                optionalSubProperties: properties.filter(el => !el.defaultAdd)
                    .map(el => ({key: el.key, defaultValue: el.defaultValue ?? ""})),
                nodeSubType: mainNodeSubType
            }
        });
        properties.filter(el => el.defaultAdd).forEach((el) => {
            if (!el.propertyIsArray && !el.propertyIsObject) {
                nextNodeId++;
                newNodes.push({
                    id: nextNodeId,
                    parent: newNodeId,
                    droppable: false,
                    text: el.key + ":",
                    data: {
                        typographyProps: {
                            variant: 'body1' as OverridableStringUnion<Variant | "inherit", TypographyPropsVariantOverrides>
                        },
                        text2: String(el.defaultValue ?? "").replace('{index}', String(nextNodeId)),
                        editable: el.key !== 'entityName',
                        removable: !!el.removable,
                        nodeType: NodeType.Leaf,
                        key: el.key,
                        value: String(el.defaultValue ?? "").replace('{index}', String(nextNodeId)),
                    }
                });
            } else if (el.propertyIsArray) {
                nextNodeId++;
                newNodes.push({
                    id: nextNodeId,
                    parent: newNodeId,
                    droppable: true,
                    text: el.key + ":",
                    data: {
                        typographyProps: {variant: 'body1'},
                        text2: "",
                        text2TypographyProps: {variant: 'h6'},
                        nodeType: NodeType.Array,
                        key: el.key,
                    }
                });
            } else { // propertyIsObject = true
                nextNodeId++;
                newNodes.push({
                    id: nextNodeId,
                    parent: newNodeId,
                    droppable: false,
                    text: el.key + ":",
                    data: {
                        typographyProps: {
                            variant: 'body1' as OverridableStringUnion<Variant | "inherit", TypographyPropsVariantOverrides>
                        },
                        text2: "{",
                        removable: !!el.removable,
                        nodeType: NodeType.Object,
                        key: el.key,
                    }
                });
            }
        });
        if (insertPosition !== undefined) {
            // Insert the new nodes in the correct position

            // List of nodes that are children of the array node
            const arrayNodes = treeData.filter(node => node.parent === id);
            // Node id where the new nodes will be inserted
            let nodeIdInsertPosition: string | number;
            // Node position where the new nodes will be inserted
            let nodePosition: number;
            if (insertPosition < arrayNodes.length) {
                // If the insert position is less than the length of the array nodes (the new nodes are inner into the array),
                // the new nodes will be inserted before the node in the insert position
                nodeIdInsertPosition = arrayNodes[insertPosition].id;
                nodePosition = treeData.findIndex(node => node.id === nodeIdInsertPosition);
            } else {
                // If the insert position is greater than the length of the array nodes (the new nodes are outer the array),
                // the new nodes will be inserted after the last array node
                if (arrayNodes.length > 0) {
                    const lastArrayNodePosition = treeData.findIndex(node =>
                        node.id === arrayNodes[arrayNodes.length - 1].id);
                    nodePosition = lastArrayNodePosition + 1;
                } else {
                    // First component added to the array
                    nodePosition = treeData.findIndex(node => node.id === id) + 1;
                }
            }

            treeData.splice(nodePosition, 0, ...this.addTreeDataParams(newNodes, arrayNode.data?.nodeSubType));
            treeData.filter(node => node.parent === id)
                .forEach((node, index) => {
                    const currentNode = treeData.find(
                        el => el.id === node.id) as NodeModel<IJsonTreeDataArrayElement>;
                    currentNode!.text = index + ":";
                    currentNode!.data!.key = index;
                });
        } else {
            treeData = [...treeData, ...this.addTreeDataParams(newNodes, arrayNode.data?.nodeSubType)];
        }

        return {
            treeData: treeData, //[...treeData, ...this.addTreeDataParams(newNodes, arrayNode.data?.nodeSubType)],
            newNodeId: newNodes.map(el => el.id)
        };
    }

    /**
     * Adds a group element to the tree
     * @param treeData The tree data
     * @param id The id of the parent node
     * @param value The name of the group element
     */
    addGroupElement(treeData: NodeModel<IJsonTreeData>[], id: number | string, value?: string):
                                    {treeData: NodeModel<IJsonTreeData>[], newNodeId: (number | string)[]} {
        const result = this.addArrayElement(treeData, id, [
                {key: 'groupName', defaultValue: value ?? 'New_Group', propertyIsArray: false, defaultAdd: true},
                {key: 'label', defaultValue: value ?? 'New_Group_Label', propertyIsArray: false, defaultAdd: true},
                {key: 'sections', propertyIsArray: true, defaultAdd: true},
            ]);

        return {
            treeData: result.treeData,
            newNodeId: result.newNodeId
        };
    }

    /**
     * Adds a section element to the tree
     * @param treeData The tree data
     * @param id The id of the parent node
     * @param value The name of the section element
     */
    addSectionElement(treeData: NodeModel<IJsonTreeData>[], id: number | string, value?: string):
                                    {treeData: NodeModel<IJsonTreeData>[], newNodeId: (number | string)[]} {
        const result = this.addArrayElement(treeData, id, [
            {key: 'sectionName', defaultValue: value ?? 'New_Section{index}', propertyIsArray: false, defaultAdd: true},
            {key: 'label', defaultValue: value ?? 'New Section Label {index}', propertyIsArray: false, defaultAdd: true},
            {key: 'components', propertyIsArray: true, defaultAdd: true},
            {key: 'xs', defaultAdd: true, defaultValue: 12},
            {key: 'sm', defaultValue: 12, removable: true},
            {key: 'md', defaultValue: 12, removable: true},
            {key: 'lg', defaultValue: 12, removable: true},
            {key: 'xl', defaultValue: 12, removable: true},
        ], undefined, NodeSubType.LayoutGroupSectionElement);
        return {
            treeData: result.treeData,
            newNodeId: result.newNodeId
        };
    }

    /**
     * Adds a component element to the tree
     * @param treeData The tree data
     * @param id The id of the parent node
     */
    addComponentElement(treeData: NodeModel<IJsonTreeData>[], id: number | string):
                                    {treeData: NodeModel<IJsonTreeData>[], newNodeId: (number | string)[]} {
        let result = this.addArrayElement(treeData, id, [
            {key: 'componentName', defaultValue: 'New_Component{index}', propertyIsArray: false, defaultAdd: true},
            {key: 'componentType', defaultValue: 'wdStringTextField', propertyIsArray: false, defaultAdd: true},
            {key: 'fieldName', defaultValue: 'Field_Name', propertyIsArray: false, defaultAdd: true, removable: true},
            {key: 'label', defaultValue: 'Component label {index}', propertyIsArray: false, defaultAdd: true},
            {key: 'xs', defaultAdd: true, defaultValue: 12},
            {key: 'sm', defaultValue: 12, removable: true},
            {key: 'md', defaultValue: 12, removable: true},
            {key: 'lg', defaultValue: 12, removable: true},
            {key: 'xl', defaultValue: 12, removable: true},
            {key: 'gridView', defaultValue: '', propertyIsObject: true, defaultAdd: true },
        ], undefined, NodeSubType.LayoutGroupSectionElementComponent);
        const gridViewNode = result.treeData.find(el =>
            el.data && 'key' in el.data && el.data?.key === 'gridView' && result.newNodeId.includes(el.id));
        if (gridViewNode) {
            gridViewNode.droppable = true;
            result = this.addGridViewProperties(result.treeData, gridViewNode.id);
        }

        return {
            treeData: result.treeData,
            newNodeId: result.newNodeId
        };
    }

    addGridViewProperties(treeData: NodeModel<IJsonTreeData>[], id: number | string): 
                                    {treeData: NodeModel<IJsonTreeData>[], newNodeId: (number | string)[]} {
        const result = {treeData: [...treeData], newNodeId: [] as (number | string)[]};
        [
            {key: 'defaultVisible', defaultValue: 'true', defaultAdd: true},
            {key: 'textAlignment', defaultValue: 'left', defaultAdd: false},
            {key: 'position', defaultValue: '1', defaultAdd: false},
            {key: 'width', defaultValue: '200', defaultAdd: false},
            {key: 'minWidth', defaultValue: '150', defaultAdd: false},
            {key: 'filterable', defaultValue: 'true', defaultAdd: false},
        ].forEach(p => {
            const gridViewNode = treeData.find(node => node.id === id);
            if (gridViewNode) {
                gridViewNode.droppable = true;
                const newPropertyLeaf = this.addProperty(result.treeData,
                    id, {key: p.key, defaultValue: p.defaultValue, override: false,
                        notRemovable: true});
                result.treeData = newPropertyLeaf.treeData;
                result.newNodeId = [...result.newNodeId, ...newPropertyLeaf.newNodeId];    
            }
        });
        return result;
    }

    /**
     * Extract the decimal places from a field definition in the json schema
     * @param num The number to extract the decimal places from (example; 0.001 -> 3)
     */
    getDecimalPlaces(num: number) {
        const numStr = num.toString();
        if (numStr.includes('.')) {
            return numStr.split('.')[1].length;
        } else {
            return 0;
        }
    }

    /**
     * Assigns a default component type based on the property type
     * @param property The property to extract the component type from
     */
    getComponentTypeFromPropertyType(property: Record<string, unknown>): {componentType: string, params?: Record<string, unknown>} | undefined {
        const propertyType = property.type;
        if (!propertyType) {
            return undefined;
        }

        let mainPropertyType: string = "";
        if (Array.isArray(propertyType)) {
            mainPropertyType = propertyType.find(el => el !== "null") ?? "";
        } else {
            mainPropertyType = String(propertyType);
        }
        if (mainPropertyType === "") {
            return undefined;
        }

        switch (mainPropertyType) {
            case 'string':
                return {componentType: 'wdStringTextField'};
            case 'integer':
                return {componentType: 'wdNumberTextField'};
            case 'boolean':
                return {componentType: 'wdCheckbox'};
            case 'number':
                return {componentType: 'wdNumberTextField',
                        params: property.multipleOf
                            ? {decimalplaces: this.getDecimalPlaces(Number(property.multipleOf))}
                            : undefined
                };
        }
        return undefined;
    }

    /**
     * Add a component from a field definition in the json schema
     * @param treeData Current json tree
     * @param newTreeData New json tree (containing the new component in the correct position
     * @param componentsNodeid The id of the components node
     * @param entityName The name of the main entity
     * @param fieldName The name of the field
     * @param dataSchema The json schema
     * @param subFormComponent If the component is in a subform
     */
    addComponentFromField(treeData: NodeModel<IJsonTreeData>[], newTreeData: NodeModel<IJsonTreeData>[],
                          componentsNodeid: number | string, entityName: string, fieldName: string, dataSchema: IDataSchema[],
                          subFormComponent: boolean):
                                    {treeData: NodeModel<IJsonTreeData>[], newNodeId: (number | string)[]} {
        const property = dataSchema.find(el => el.name === entityName)?.schema.properties[fieldName];
        if (!property) {
            return {treeData: treeData, newNodeId: []};
        }
        const componentType = this.getComponentTypeFromPropertyType(property);
        if (componentType) {
            const newComponentsArray = newTreeData.filter(node =>
                node.parent === componentsNodeid && node.data?.nodeType !== NodeType.CloseNode);
            let insertPosition = newComponentsArray.findIndex(
                el => el.data?.params?.tag === 'fieldList'
            );
            if (insertPosition === -1) {
                insertPosition = treeData.length;
            }
            let result:  {treeData: NodeModel<IJsonTreeData>[], newNodeId: (number | string)[]};
            if (subFormComponent) {
                result = this.addArrayElement(treeData, componentsNodeid, [
                    {key: 'colId', defaultValue: fieldName, propertyIsArray: false, defaultAdd: true},
                    {key: 'sortable', defaultValue: false, propertyIsArray: false, defaultAdd: true},
                    {key: 'filter', defaultValue: false, propertyIsArray: false, defaultAdd: true},
                    {key: 'flex', defaultValue: 1, propertyIsArray: false, defaultAdd: true},
                    {key: 'minWidth', defaultValue: 300, propertyIsArray: false, defaultAdd: true},
                    {key: 'lockPinned', defaultValue: false, propertyIsArray: false, defaultAdd: true},
                    {key: 'cellRenderer', defaultValue: 300, propertyIsArray: false, propertyIsObject: true, defaultAdd: true},
                ], insertPosition);
                const cellRendererNode = result.treeData.find(el =>
                    el.data && 'key' in el.data && el.data?.key === 'cellRenderer' && result.newNodeId.includes(el.id));
                if (cellRendererNode) {
                    cellRendererNode.droppable = true;
                    [{key: 'componentName', defaultValue: fieldName}, {key: 'componentType', defaultValue: componentType.componentType},
                        {key: 'label', defaultValue: fieldName}].forEach(p => {
                            const newPropertyLeaf = this.addProperty(result.treeData,
                                cellRendererNode.id, {key: p.key, defaultValue: p.defaultValue, override: false,
                                    notRemovable: true});
                            result.treeData = newPropertyLeaf.treeData;
                            result.newNodeId = [...result.newNodeId, ...newPropertyLeaf.newNodeId];
                    });
                }
            } else {
                result = this.addArrayElement(treeData, componentsNodeid, [
                    {key: 'componentName', defaultValue: fieldName, propertyIsArray: false, defaultAdd: true},
                    {key: 'componentType', defaultValue: componentType.componentType, propertyIsArray: false, defaultAdd: true},
                    {key: 'fieldName', defaultValue: fieldName, propertyIsArray: false, defaultAdd: true, removable: true},
                    {key: 'label', defaultValue: fieldName, propertyIsArray: false, defaultAdd: true},
                    {key: 'xs', defaultValue: 12, defaultAdd: true},
                    {key: 'sm', defaultValue: 12, removable: true},
                    {key: 'md', defaultValue: 12, removable: true},
                    {key: 'lg', defaultValue: 12, removable: true},
                    {key: 'xl', defaultValue: 12, removable: true},
                    {key: 'gridView', defaultValue: '', removable: true, propertyIsObject: true},
                ], insertPosition, NodeSubType.LayoutGroupSectionElementComponent);
            }
            return {
                treeData: result.treeData,
                newNodeId: result.newNodeId
            };
        } else {
            //throw new Error('Invalid property type');
            console.log(`Invalid property type for property ${property}`);
            return {
                treeData: treeData,
                newNodeId: []
            };
        }
    }

    addMissingFieldsFromJsonSchema(treeData: NodeModel<IJsonTreeData>[], entityName: string, dataSchema: IDataSchema[],
                                   excludedFieldNames: string[], mainEntity: boolean, parentNodeId?: number | string, subFormComponent?: boolean):
                                    {treeData: NodeModel<IJsonTreeData>[], newNodeId: (number | string)[]} {
        let parentNode: NodeModel<IJsonTreeData> | undefined = undefined;
        if (mainEntity) {
            parentNode = treeData.find(el => el.data && 'key' in el.data && el.data?.key === 'components');
        } else if (parentNodeId) {
            parentNode = treeData.find(el => el.id === parentNodeId);
        }
        if (!parentNode) {
            throw new Error('Parent node not found');
        }
        const properties = dataSchema.find(el => el.name === entityName)?.schema.properties;
        if (!properties) {
            return {treeData: treeData, newNodeId: []};
        }

        let newNodeId: (string | number)[] = [];
        Object.keys(properties).forEach(property => {
            if (!excludedFieldNames.map(el => el.toLowerCase()).includes(property.toLowerCase())) {
                const nodeExists = treeData.find(el =>
                    el.data && 'key' in el.data && el.data.key === 'fieldName' && el.data.params?.value === property &&
                    this.getEntityName(treeData, el.id) === entityName
                );
                if (!nodeExists) {
                    const newCompAdded = this.addComponentFromField(
                        treeData, treeData, parentNode.id, entityName, property, dataSchema, !!subFormComponent);
                    treeData = newCompAdded.treeData;
                    newNodeId = [...newNodeId, ...newCompAdded.newNodeId];
                }
            }
        });


        return {treeData: treeData, newNodeId: newNodeId};
    }

    /**
     * Add a property to the tree
     * @param treeData Current tree data
     * @param id The id of the parent node
     * @param property The property to add
     * @param isObject True if the property is an object
     * @param isArray True if the property is an array
     * @param subProperties The subproperties of the property
     */
    addProperty(treeData: NodeModel<IJsonTreeData>[], id: number | string, property: IOptionalProperties,
                isObject?: boolean, isArray?: boolean, subProperties?: IOptionalProperties[]):
                                    {treeData: NodeModel<IJsonTreeData>[], newNodeId: (number | string)[]} {
        const arrayNode = treeData.find(el => el.id === id);
        if (!arrayNode) {
            return {treeData: treeData, newNodeId: []};
        }
        const existingNodeIndex = treeData.findIndex(el =>
            el.parent === id && el.data && ('key' in el.data) && el.data.key === property.key);
        if (existingNodeIndex !== -1) {
            if (property.override) {
                treeData.splice(existingNodeIndex, 1);
            } else {
                return {treeData: treeData, newNodeId: []};
            }
        }
        const newNodeId = Math.max(...treeData.map(el => Number(el.id))) + 1;
        const newNode: NodeModel<IJsonTreeData> =
            (!isObject && !isArray) ? {
                id: newNodeId,
                parent: id,
                droppable: false,
                text: property.key + ":",
                data: {
                    typographyProps: {variant: 'body1'},
                    text2: String(property.defaultValue).replace('{index}', String(newNodeId)),
                    text2TypographyProps: {variant: 'h6'},
                    editable: property.key !== 'entityName',
                    nodeType: NodeType.Leaf,
                    key: property.key,
                    value: String(property.defaultValue).replace('{index}', String(newNodeId)),
                    removable: !property.notRemovable
                }
            }
            : (isObject ? {
                        id: newNodeId,
                        parent: id,
                        droppable: true,
                        text: property.key + ":",
                        data: {
                            typographyProps: {
                                variant: 'body1' as OverridableStringUnion<Variant | "inherit", TypographyPropsVariantOverrides>
                            },
                            text2: "{",
                            removable: !property.notRemovable,
                            nodeType: NodeType.Object,
                            key: property.key,
                            optionalSubProperties: subProperties ?? []
                        }
                    }
             : { // isArray = true
                            id: newNodeId,
                            parent: id,
                            droppable: true,
                            text: property.key + ":",
                            data: {
                                typographyProps: {variant: 'body1'},
                                text2: "",
                                removable: !property.notRemovable,
                                text2TypographyProps: {variant: 'h6'},
                                nodeType: NodeType.Array,
                                key: property.key,
                            }
                    });
        let resultTreeData = [...treeData, ...this.addTreeDataParams([newNode], undefined)];
        if (property.key === 'gridView') {
            resultTreeData = this.addGridViewProperties(resultTreeData, newNode.id).treeData;
        }
        return {
            treeData: resultTreeData,
            newNodeId: [id, newNode.id]
        };
    }

    addExternalDataInfoProperty(treeData: NodeModel<IJsonTreeData>[], id: number | string) {
        const arrayNode = treeData.find(el => el.id === id);
        if (!arrayNode) {
            return {treeData: treeData, newNodeId: []};
        }
        const existingNodeIndex = treeData.findIndex(el =>
            el.parent === id && el.data && ('key' in el.data) && el.data.key === 'externalDataInfo');
        if (existingNodeIndex !== -1) {
            return {treeData: treeData, newNodeId: []};
        }
        return this.addProperty(treeData, id, {key: 'externalDataInfo', defaultValue: '' }, true, false);
    }

    addApiCallInfoProperty(treeData: NodeModel<IJsonTreeData>[], id: number | string) {
        const arrayNode = treeData.find(el => el.id === id);
        if (!arrayNode) {
            return {treeData: treeData, newNodeId: []};
        }
        const existingNodeIndex = treeData.findIndex(el =>
            el.parent === id && el.data && ('key' in el.data) && el.data.key === 'apiCallInfo');
        if (existingNodeIndex !== -1) {
            return {treeData: treeData, newNodeId: []};
        }
        let result:  {treeData: NodeModel<IJsonTreeData>[], newNodeId: (number | string)[]};
        result = this.addProperty(treeData, id, {key: 'apiCallInfo', defaultValue: ''}, true, false);
        const apiCallInfoNode = result.treeData.find(el =>
            el.data && 'key' in el.data && el.data?.key === 'apiCallInfo' && result.newNodeId.includes(el.id));
        if (apiCallInfoNode) {
            apiCallInfoNode.droppable = true;
            [   {key: 'apiSuffix', defaultValue: 'insert_endpoint'},
                {key: 'descriptionField', defaultValue: 'field name'},
                {key: 'foreignIdField', defaultValue: 'Id'}].forEach(p => {
                const newPropertyLeaf = this.addProperty(result.treeData,
                    apiCallInfoNode.id, {key: p.key, defaultValue: p.defaultValue, override: false,
                        notRemovable: true});
                result.treeData = newPropertyLeaf.treeData;
                result.newNodeId = [...result.newNodeId, ...newPropertyLeaf.newNodeId];
            });
        }
        return {
            treeData: result.treeData,
            newNodeId: result.newNodeId
        };
    }

    addCustomListProperty(treeData: NodeModel<IJsonTreeData>[], id: number | string) {
        const arrayNode = treeData.find(el => el.id === id);
        if (!arrayNode) {
            return {treeData: treeData, newNodeId: []};
        }
        const existingNodeIndex = treeData.findIndex(el =>
            el.parent === id && el.data && ('key' in el.data) && el.data.key === 'customList');
        if (existingNodeIndex !== -1) {
            treeData.splice(existingNodeIndex, 1);
        }
        let result:  {treeData: NodeModel<IJsonTreeData>[], newNodeId: (number | string)[]};
        result = this.addProperty(treeData, id, {key: 'customList', defaultValue: '', notRemovable: false, override: false },
            false, true);
        return {
            treeData: result.treeData,
            newNodeId: result.newNodeId
        };
    }

    addCustomListElement(treeData: NodeModel<IJsonTreeData>[], id: number | string, value?: string):
                                    {treeData: NodeModel<IJsonTreeData>[], newNodeId: (number | string)[]} {
        const result = this.addArrayElement(treeData, id, [
            {key: 'value', defaultValue: value ?? 'New_Value', propertyIsArray: false, defaultAdd: true, removable: false},
            {key: 'label', defaultValue: value ?? 'New_Label', propertyIsArray: false, defaultAdd: true, removable: false},
        ]);
        return {
            treeData: result.treeData,
            newNodeId: result.newNodeId
        };
    }

    /**
     * Add a subform element to the tree
     * @param treeData
     * @param entity
     * @param id
     * @param addSubFields
     * @param schema
     */
    addSubFormElement(treeData: NodeModel<IJsonTreeData>[], entity: string, id: number | string, addSubFields: boolean,
                      schema: IDataSchema): {treeData: NodeModel<IJsonTreeData>[], newNodeId: (number | string)[]} {
        const result = this.addArrayElement(treeData, id, [
            {key: 'componentName', defaultValue: 'SubForm{index}' + entity, propertyIsArray: false, defaultAdd: true, removable: false},
            {key: 'componentType', defaultValue: 'wdSubForm', propertyIsArray: false, defaultAdd: true, removable: false},
            {key: 'entityName', defaultValue: entity, propertyIsArray: false, defaultAdd: true, removable: false},
            {key: 'fieldName', defaultValue: "refFieldName", propertyIsArray: false, defaultAdd: true, removable: false},
            {key: 'label', defaultValue: entity, propertyIsArray: false, defaultAdd: true, removable: false},
            {key: 'minHeight', defaultValue: '300px', propertyIsArray: false, defaultAdd: true, removable: false},
            {key: 'pagination', defaultValue: false, propertyIsArray: false, defaultAdd: true, removable: false},
            {key: 'xs', defaultAdd: true, defaultValue: 12, removable: false},
            {key: 'sm', defaultValue: 12, removable: true},
            {key: 'md', defaultValue: 12, removable: true},
            {key: 'lg', defaultValue: 12, removable: true},
            {key: 'xl', defaultValue: 12, removable: true},
            {key: 'subFields', propertyIsArray: true, removable: false, defaultAdd: true}
        ], undefined, NodeSubType.LayoutGroupSectionElementComponent);
        if (addSubFields) {
            const subFieldsNode = result.treeData.find(el =>
                el.data && 'key' in el.data && el.data.key === 'subFields' && result.newNodeId.includes(el.id));
            if (subFieldsNode) {
                const subFieldData = this.addMissingFieldsFromJsonSchema(result.treeData, entity, [schema],
                    excludedFieldNames, false, subFieldsNode.id, true)
                result.treeData = subFieldData.treeData;
                result.newNodeId = [...result.newNodeId, ...subFieldData.newNodeId];
            }
        }
        return {
            treeData: this.updateTreeDataValueLists(result, [schema]),
            newNodeId: result.newNodeId
        };

    }

    /**
     * Remove a property from the tree
     * @param treeData The tree data
     * @param id The id of the property to remove
     */
    removeProperty(treeData: NodeModel<IJsonTreeData>[], id: number | string): NodeModel<IJsonTreeData>[] {
        return treeData.filter(el => el.id !== id && el.parent !== id);
    }

    /**
     * Remove recursively the sub elements of an array from the tree
     * @param treeData The tree data
     * @param id The id of the array element to remove
     */
    private removeArrayElementSubNode(treeData: NodeModel<IJsonTreeData>[], id: number | string):
                                    NodeModel<IJsonTreeData>[] {
        let newTreeData = [...treeData];
        treeData.filter(el => el.parent === id).forEach(node => {
            newTreeData = this.removeArrayElementSubNode(newTreeData, node.id);
        });
        const index = newTreeData.findIndex(el => el.id === id);
        if (index !== -1) {
            newTreeData.splice(index, 1);
        }
        return newTreeData;
    }

    /**
     * Remove an array element from the tree
     * @param treeData
     * @param id
     */
    removeArrayElement(treeData: NodeModel<IJsonTreeData>[], id: number | string): NodeModel<IJsonTreeData>[] {
        const currentNode = treeData.find(el => el.id === id);
        if (currentNode) {
            const parentNodeId = currentNode.parent;
            //const newTreeData = treeData.filter(node => node.id !== id);
            const newTreeData = this.removeArrayElementSubNode(treeData, id);

            const arrayElements = newTreeData.filter(el => el.parent === parentNodeId
                && el.data?.nodeType === NodeType.ArrayElement);
            arrayElements.forEach((el, index) => {
                const currentArrayElement = newTreeData.find(node =>
                    node.id === el.id && node.data?.nodeType === NodeType.ArrayElement) as NodeModel<IJsonTreeDataArrayElement>;
                if (currentArrayElement) {
                    currentArrayElement.data!.key = index;
                    currentArrayElement.text = index + ":";
                }
            });
            return newTreeData;
        } else {
            return treeData;
        }
    }

    /**
     * Final rendering of the tree (with the addition of closing nodes
     * @param data Base json data
     */
    finalNodeRendering(data: {jsonData: NodeModel<IJsonTreeData>[], openNodes: (string | number)[]}): NodeModel<IJsonTreeData>[] {
        let nextNodeId = Math.max(...data.jsonData.map(el => Number(el.id)));
        const newNodes: NodeModel<IJsonTreeData>[] = [...data.jsonData];
        // Group elements
        const objectTypes: NodeType[] = [NodeType.ArrayElement, NodeType.Object];
        const arrayTypes: NodeType[] = [NodeType.Array];
        const groupElementTypes: NodeType[] = [...objectTypes, ...arrayTypes];

        const hiddenChildren: (number | string)[] = [];

        data.jsonData.filter(node => node.data && groupElementTypes.includes(node.data.nodeType))
            .forEach(node => {
                const symbols = objectTypes.includes(node.data!.nodeType) ? ['{', '}'] : ['[', ']'];
                const currentNode = newNodes.find(el => el.id === node.id);
                const currentNodeIndex = newNodes.findIndex(el => el.id === node.id);
                if (data.openNodes.indexOf(node.id) === -1) {
                    currentNode!.data!.text2 = symbols[0] +
                        (newNodes.filter(el => el.parent === node.id).length > 0 ? " ... " : "") +
                        symbols[1];
                    hiddenChildren.push(node.id);
                } else {
                    currentNode!.data!.text2 = symbols[0];
                    nextNodeId++;
                    if (hiddenChildren.indexOf(node.parent) === -1) {
                        newNodes.splice(currentNodeIndex + 1, 0, {
                            id: nextNodeId,
                            parent: node.parent,
                            droppable: false,
                            text: symbols[1],
                            data: {
                                typographyProps: {variant: 'body1'},
                                nodeType: NodeType.CloseNode,
                                mainNodeId: node.id,
                                mainNodeParent: node.parent,
                            }
                        });
                    } else {
                        hiddenChildren.push(node.id);
                    }
                }
        });

        return newNodes;
    }

    /**
     * Json initialization
     * @param objectName
     */
    setInitialObjectJson = (objectName: string) => {
        return {
            objectName: objectName,
            toolbar: [],
            detailView: {
                titleField: "NAME_OF_THE_FIELD_TO_BE_USED_AS_TITLE",
                label: objectName,
                entityName: objectName,
                layoutGroups: []
            }
        };
    }

    /**
     * Tree data initialization
     * @param objectName
     * @param dataSchema
     */
    initializeTreeData = (objectName: string, dataSchema: IDataSchema[]): IJsonDataBuild => {
        let baseData =
            this.assignSubTypes(this.createTreeData(this.setInitialObjectJson(objectName), dataSchema));
        const layoutGroupsNode = baseData.find(
            el => el.data && 'key' in el.data && el.data?.key === 'layoutGroups'
        );
        baseData = this.addGroupElement(baseData, layoutGroupsNode!.id, "Main").treeData;
        const sectionsNode = baseData.find(
            el => el.data && 'key' in el.data && el.data?.key === 'sections'
        );
        baseData = this.addSectionElement(baseData, sectionsNode!.id, "Main_section{index}").treeData;
        const openNodes = baseData.filter(el =>
            el.data?.nodeType !== NodeType.CloseNode && el.data?.nodeSubType !== 'toolbar'
        ).map(el => el.id);
        return {
            baseData: baseData,
            treeData: this.finalNodeRendering({jsonData: baseData, openNodes}),
            openNodes: openNodes,
            dataSchema: dataSchema
        };
    }

    /**
     * Build the tree data
     * @param jsonObject The json object
     * @param dataSchema The json schema
     */
    createTreeData = (jsonObject: Object, dataSchema?: IDataSchema[]): NodeModel<IJsonTreeData>[] => {
        return this.addTreeDataParams(this.buildTreeData(jsonObject), undefined);
    }

    /**
     * Sets the tree so that only one node is in editing mode
     * @param treeData The tree data
     * @param editedNode The id of the node being edited
     */
    setEditMode = (treeData: NodeModel<IJsonTreeData>[], editedNode: string | number) => {
        return treeData.map(node => {
            const newNode: NodeModel<IJsonTreeData> = {...node};
            if (newNode.data) {
                const blocked = editedNode !== undefined;
                if (blocked) {
                    newNode.data.actions = [];
                    if (editedNode !== newNode.id) {
                        newNode.data.blocked_update = blocked;
                        newNode.data.customActions = [];
                    }
                    if (node.data?.nodeType === NodeType.Leaf && node.id === editedNode) {
                        node.data.nodeTextCustomStyle = {flex: 1}
                    }
                }
            }
            return newNode;
        });
    }

    /**
     * Modify a property of a node
     * @param treeData The tree data
     * @param nodeId The id of the node
     * @param newValue The new value of the property
     */
    modifyProperty = (treeData: NodeModel<IJsonTreeData>[], nodeId: number | string, newValue: string) => {
        const currentNode = treeData.find(el => el.id === nodeId);
        const parentNode = treeData.find(el => currentNode?.parent === el.id);
        let componentTypeModified = false;
        let optionalProperties: IOptionalProperties[] = [
            {key: 'fieldName', defaultValue: 'Field_Name'},
            {key: 'xs', defaultValue: 12},
            {key: 'sm', defaultValue: 12},
            {key: 'md', defaultValue: 12},
            {key: 'lg', defaultValue: 12},
            {key: 'xl', defaultValue: 12},
        ];
        if (currentNode && currentNode.data?.nodeType === NodeType.Leaf && currentNode.data.key === 'componentType' && parentNode) {
            componentTypeModified = true;
            switch (newValue) {
                case  "wdNumberTextField":
                    optionalProperties.push({key: "decimalplaces", defaultValue: 0});
                    break;
                case "wdTextArea":
                    optionalProperties.push({key: "linesNumber", defaultValue: 4});
                    break;
                case "wdCombobox":
                    optionalProperties = [...optionalProperties,
                        {key: "multiSelect", defaultValue: 'false'},
                    ];
                    break;
            }
        }

        return this.addTreeDataParams(treeData.map(node => {
            if (node.id === nodeId && node.data?.nodeType === NodeType.Leaf) {
                return {
                    ...node, data: {
                        ...node.data, text2: newValue, value: newValue, nodeTextCustomStyle: undefined,
                        blocked_update: false
                    }
                };
            } else if (componentTypeModified && node.id === parentNode!.id && node.data?.nodeType === NodeType.ArrayElement) {
                return {
                    ...node, data: {
                        ...node.data, optionalSubProperties: optionalProperties
                    }
                }
            } else {
                return node;
            }
        }));
    }

    /**
     * Updates the tree so that no node is in editing mode
     * @param treeData
     */
    unsetEditMode = (treeData: NodeModel<IJsonTreeData>[]) => {
        return this.addTreeDataParams(treeData.map(node => {
            const newNode: NodeModel<IJsonTreeData> = {...node};
            if (newNode.data) {
                newNode.data.blocked_update = false;
                if (node.data?.nodeType === NodeType.Leaf) {
                    node.data.nodeTextCustomStyle = undefined;
                } else {
                    return node;
                }
            }
            return newNode;
        }));
    }

    /**
     * Generic function to define a standard action
     * @param icon Button icon
     * @param color Button color
     * @param label Button label
     * @param action Function to execute
     * @param position Button position (start or end)
     * @param tooltip Button tooltip (not used)
     * @param params Params passed to the function
     */
    defineStandardAction = (icon: string, color: DailyToolbarPaletteType, label: string,
                            action:  (nodeId: (number | string), params?: any) => void,
                            position?: 'start' | 'end', tooltip?: string, params?: any): ITreeAction => {
        return {
            icon: icon,
            color: color,
            label: label,
            tooltip: tooltip,
            action: action,
            position: position ?? 'end',
            params: params
        };
    }

    /**
     * Change the order of the elements of an array in the json
     * @param treeData
     * @param newTreeData
     * @param arrayNodes
     */
    arrayReorder = (treeData: NodeModel<IJsonTreeData>[], newTreeData: NodeModel<IJsonTreeData>[], arrayNodes: (number | string)[]) => {
        const resultTreeData = treeData.filter(node =>
            node.data?.nodeType !== NodeType.CloseNode);
        newTreeData = newTreeData.filter(node => node.data?.nodeType !== NodeType.CloseNode);
        let index: number;
        arrayNodes.forEach(node => {
            index = -1;
            const arrayElements = newTreeData.filter((el) => el.parent === node);
            // Remove the array elements
            arrayElements.forEach((el) => {
                const currentElementIndex = resultTreeData.findIndex(subNode =>
                    subNode.id === el.id && subNode.data && subNode.data?.nodeType === NodeType.ArrayElement);
                if (currentElementIndex !== -1) {
                    resultTreeData.splice(currentElementIndex, 1);
                }
            });
            // Insert the array elements in the correct order
            arrayElements.forEach((el) => {
                const currentElement = newTreeData.find(subNode =>
                    subNode.id === el.id && subNode.data && subNode.data?.nodeType === NodeType.ArrayElement);
                if (currentElement) {
                    index++;
                    const addedElement = {...currentElement as NodeModel<IJsonTreeDataArrayElement>};
                    addedElement.data!.key = index;
                    addedElement.text = String(index) + ':';
                    addedElement.parent = node;
                    const parentIndex = resultTreeData.findIndex(subNode => subNode.parent === node);
                    resultTreeData.splice(parentIndex + index + 1, 0, addedElement);
                }
            });
        });
        let maxNodeId = 0;
        resultTreeData.forEach(node => {
            if (Number(node.id) > maxNodeId) {
                maxNodeId = Number(node.id);
            }
        });
        return resultTreeData;
/*
        arrayNodes.forEach(node => {
            maxNodeId++;
            const closestComponentsNode = this.getClosestComponentsNode(resultTreeData, node);
            if (closestComponentsNode) {
                newTreeData = resultTreeData.map(node => {
                    if (node.id === closestComponentsNode) {
                        return {...node, id: maxNodeId};
                    } else if (node.parent === closestComponentsNode) {
                        return {...node, parent: maxNodeId};
                    } else {
                        return node;
                    }
                });
            }
        });
        return newTreeData;
*/
    }

    /**
     * Assign the subtypes to the nodes
     * @param treeData
     * @param parentNodeSubType
     */
    private assignSubTypes = (treeData: NodeModel<IJsonTreeData>[], parentNodeSubType?: NodeSubType) => {
        return treeData.map(node => {
            if (node.data && ('key' in node.data) && Object.values(NodeSubType).includes(node.data.key as NodeSubType)) {
                return {...node, data: {...node.data, nodeSubType: node.data.key as NodeSubType}};
            } else if (node.data && node.data.nodeType === 'arrayElement') {
                if (parentNodeSubType === NodeSubType.LayoutGroups) {
                    return {...node, data: {...node.data, nodeSubType: NodeSubType.LayoutGroupElement}};
                } else if (parentNodeSubType === NodeSubType.LayoutGroupSections) {
                    return {...node, data: {...node.data, nodeSubType: NodeSubType.LayoutGroupSectionElement}};
                } else if (parentNodeSubType === NodeSubType.LayoutGroupSectionElementComponent) {
                    return {...node, data: {...node.data, nodeSubType: NodeSubType.LayoutGroupSectionElementComponentProps}};
                } else {
                    return node;
                }
            } else {
                return node;
            }
        });
    }

    /**
     * Adds the tree data parameters, such as actions, to the nodes
     * @param treeData The tree data
     * @param parentNodeSubType The parent node subtype
     */
    addTreeDataParams = (treeData: NodeModel<IJsonTreeData>[], parentNodeSubType?: NodeSubType) => {
        const addedActions: {condition: (data: IJsonTreeData | undefined) => boolean, actionType: JsonTreeActionType, icon: string,
            color: DailyToolbarPaletteType, additionalParams?: (data: IJsonTreeData | undefined) => Record<string, unknown>}[] = [
            {condition: (data) => data?.nodeType === NodeType.Array && data?.key === 'layoutGroups',
                actionType: 'addGroup', icon: 'plus-circle-outline', color: 'primary'},
            {condition: (data) => data?.nodeType === NodeType.Array && data?.key === 'sections',
                actionType: 'addSection', icon: 'plus-circle-outline', color: 'primary'},
            {condition: (data) => data?.nodeType === NodeType.Array && data?.key === 'components',
                actionType: 'addComponent', icon: 'plus-circle-outline', color: 'primary'},
            {condition: (data) => data?.nodeType === NodeType.Array && data?.key === 'components',
                actionType: 'addSubForm', icon: 'table-large-plus', color: 'primary'},
            {condition: (data) => (data?.nodeType === NodeType.ArrayElement || data?.nodeType === NodeType.Object) &&
                    !!data?.optionalSubProperties && data?.optionalSubProperties.length > 0,
                actionType: 'addProperty', icon: 'plus', color: 'primary',
                additionalParams: (data: IJsonTreeData | undefined) => ({
                    optionalProperties: data && ('optionalSubProperties' in data) ? data.optionalSubProperties : undefined
                })},
            {condition: (data) => (data?.nodeType === NodeType.Leaf ||
                            data?.nodeType === NodeType.Object || data?.nodeType === NodeType.Array) && !!data?.removable,
                actionType: 'removeProperty', icon: 'close', color: 'error'},
            {condition: (data) => data?.nodeType === NodeType.ArrayElement && data?.nodeSubType === NodeSubType.LayoutGroupSectionElementComponent,
                actionType: 'locateComponent', icon: 'target', color: 'primary'},
            {condition: (data) => data?.nodeType === NodeType.ArrayElement,
                actionType: 'removeArrayElement', icon: 'close', color: 'error'},
            {condition: (data) => data?.nodeType === NodeType.ArrayElement &&
                            !!data.optionalSubProperties?.find(el => el.key === 'multiSelect'),
                actionType: 'addExternalDataInfoProperty', icon: 'database-arrow-left-outline', color: 'primary'},
            {condition: (data) => !!data && 'key' in data && data?.key === 'externalDataInfo',
                actionType: 'addExternalDataInfoSubProperty', icon: 'table-arrow-left', color: 'primary',
                additionalParams: (data: IJsonTreeData | undefined) => ({
                    optionalProperties:  [{key: "apiCallInfo", defaultValue: ""},
                    {key: "customList", defaultValue: ""}]
                })},
            {condition: (data) => !!data && 'key' in data && data?.key === 'customList',
                actionType: 'addCustomListElement', icon: 'plus', color: 'primary'},
        ];
        return this.assignSubTypes(treeData, parentNodeSubType).map(node => {
            const newNode: NodeModel<IJsonTreeData> = {...node};
            if (newNode.data?.nodeType === NodeType.Leaf && newNode.data?.editable) {
                newNode.data = {...newNode.data,
                            customActions: [
                                {name: 'onTextChanged', action: (nodeId: number | string, args: Record<string, unknown>) =>
                                        this.genericAction('onTextChange', {id: nodeId, value: args})},
                                {name: 'onChangeEditMode', action: (nodeId: number | string, args: Record<string, unknown>) =>
                                        this.genericAction('onChangeEditMode', {id: nodeId, params: args})},
                            ]
                        };
            }
            if (newNode.data?.actions) {
                newNode.data.actions = [];
            }
            addedActions.forEach(action => {
                if (newNode.data && action.condition(newNode.data)) {
                    newNode.data = {...newNode.data,
                        actions: [...(newNode.data?.actions ?? []),
                            this.defineStandardAction(action.icon, action.color, '',
                                (nodeId: number | string, params: Record<string, unknown>) => this.genericAction(action.actionType,
                                    {nodeId: nodeId, ...(params ?? {})}),
                                'end', undefined, action.additionalParams?.(newNode.data!)
                            ),
                        ]
                    };
                }
            });
            return newNode;
        });
    }

    /**
     * Sets the list of allowed values for the fields when applicable (used in edit mode)
     * @param tree
     * @param dataSchema
     */
    updateTreeDataValueLists = (tree: { treeData: NodeModel<IJsonTreeData>[], newNodeId: (string | number)[] }, dataSchema: IDataSchema[]) => {
        return tree.treeData.map(node => {
            if (tree.newNodeId.findIndex(el => el === node.id) !== -1) {
                if (node.data?.nodeType ===
                    NodeType.Leaf && ['xs', 'sm', 'md', 'lg', 'xl'].indexOf(node.data?.key ?? "") !== -1) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            allowedValues: [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
                        }
                    }
                }
                if (node.data?.nodeType === NodeType.Leaf && node.data?.key === 'componentType') {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            allowedValues: [
                                "wdStringTextField", "wdPasswordTextField", "wdNumberTextField", "wdDateTextField",
                                "wdBooleanTextField", "wdTextArea", "wdHidden", "wdCheckbox", "wdCombobox",
                                "wdButton", "wdHidden", "wdDatePicker", "wdTimePicker", "wdLabel", "wdLink",
                                "wdImage", "wdTree"
                            ]
                        }
                    }
                }
                if (node.data?.nodeType === NodeType.Leaf && node.data?.key === 'decimalplaces') {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            allowedValues: [
                                0,1,2,3,4,5,6
                            ]
                        }
                    }
                }
                if (node.data?.nodeType === NodeType.Leaf && node.data?.key === 'linesNumber') {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            allowedValues: [
                                2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20
                            ]
                        }
                    }
                }
                if (node.data?.nodeType === NodeType.Leaf && (node.data?.key === 'multiSelect' ||
                                node.data?.key === 'filterable' || node.data?.key === 'defaultVisible')) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            allowedValues: [
                                'true', 'false'
                            ]
                        }
                    }
                }
                if (node.data?.nodeType === NodeType.Leaf && node.data?.key === 'textAlignment') {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            allowedValues: [
                                'left', 'center', 'right'
                            ]
                        }
                    }
                }
                if (node.data?.nodeType === NodeType.Leaf && node.data?.key === 'fieldName') {
                    const entity = this.getEntityName(tree.treeData, node.id);
                    if (entity !== "") {
                        const properties = dataSchema?.find(el => el.name === entity)?.schema.properties;
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                allowedValues: properties ? Object.keys(properties) : []
                            }
                        }
                    }
                }
            }
            return node;
        });
    }

    /**
     * Gets the entity of a node (scales up the tree until the entity name is found)
     * @param treeData
     * @param nodeId
     */
    getEntityName = (treeData: NodeModel<IJsonTreeData>[], nodeId: number | string): string => {
        return this.getParentEntityName(treeData, nodeId);
    }
    getParentEntityName = (treeData: NodeModel<IJsonTreeData>[], nodeId: number | string): string => {
        const currentNode = treeData.find(node => node.id === nodeId);
        if (currentNode) {
            const parentNode = treeData.find(node => node.id === currentNode.parent);
            if (parentNode && parentNode.id !== 0) {
                const entityNameParentNode = treeData.find(
                    node => node.parent === parentNode.id && node.data && 'key' in node.data &&
                        node.data?.key === 'entityName');
                if (entityNameParentNode) {
                    return String(entityNameParentNode.data!.text2);
                } else {
                    return this.getParentEntityName(treeData, parentNode.id);
                }
            } else {
                return "";
            }
        } else {
            return ""
        }
    }

    getNodeName(treeData: NodeModel<IJsonTreeData>[], nodeId: number | string): string {
        const currentNode = treeData.find(node => node.id === nodeId);
        const componentNameNodeData = treeData.filter(
            el => el.parent === nodeId
        )?.find(
            node => node.data && 'key' in node.data &&
                ["componentName", "sectionName", "groupName"].includes(String(node.data?.key))
        )?.data;
        if (componentNameNodeData && 'value' in componentNameNodeData) {
            return String(componentNameNodeData.value);
        } else {
            return "";
        }
    }

    getNodePath(treeData: NodeModel<IJsonTreeData>[], nodeId: number | string): string {
        const currentNode = treeData.find(node => node.id === nodeId);
        const name = this.getNodeName(treeData, nodeId);
        if (currentNode?.data && 'key' in currentNode.data && currentNode.data.key === 'groups') {
            return "";
        }
        if (currentNode) {
            const parentNode = treeData.find(node =>
                node.id === currentNode.parent);
            if (parentNode && parentNode.id !== 0) {
                return this.getNodePath(treeData, parentNode.id) +
                    (name !== ""
                        ? (parentNode.data && 'key' in parentNode.data && parentNode.data?.key === "layoutGroups" ? '' : ".")
                            + name
                        : ""
                    );
            } else {
                return "";
            }
        } else {
            return "";
        }
    }

}
