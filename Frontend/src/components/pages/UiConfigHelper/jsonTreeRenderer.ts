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
import { jsonConfigStructure } from "./JsonConfigStructure";

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
    addArrayElement(treeData: NodeModel<IJsonTreeData>[], id: number | string, /* properties: ITreeElementProperties[], */
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
                nodeSubType: mainNodeSubType
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

            treeData.splice(nodePosition, 0, ...newNodes);
            treeData.filter(node => node.parent === id)
                .forEach((node, index) => {
                    const currentNode = treeData.find(
                        el => el.id === node.id) as NodeModel<IJsonTreeDataArrayElement>;
                    currentNode!.text = index + ":";
                    currentNode!.data!.key = index;
                });
        } else {
            treeData = [...treeData, ...newNodes];
        }
        treeData = this.addTreeDataParams(treeData);
        return {
            treeData: treeData, //[...treeData, ...this.addTreeDataParams(newNodes, arrayNode.data?.nodeSubType)],
            newNodeId: newNodes.map(el => el.id)
        };
    }

    /**
     * Looks for the parent property of the node with the specified id; if the parent node is an array element, 
     *  looks for the parent property of the array element
     * @param treeData 
     * @param id 
     */
    getParentProperty(treeData: NodeModel<IJsonTreeData>[], id: number | string): string {
        let isArrayElement = true;
        let currentNode = treeData.find(node => node.id === id);
        while (isArrayElement) {
            if (!currentNode) {
                throw new Error('Parent node not found');
            }
            if (currentNode?.data?.nodeType !== NodeType.ArrayElement) {
                isArrayElement = false;
                if (currentNode?.data && 'key' in currentNode.data) {
                    return currentNode?.data?.key;
                } else {
                    throw new Error('Parent node key not found');
                }
            } else {
                const currentParent = treeData.find(node => node.id === currentNode!.parent);
                if (!currentParent || currentParent.id === 0) {
                    throw new Error('Parent node not found');
                }
            }
            currentNode = treeData.find(node => node.id === currentNode!.parent);
        }
        throw new Error('Parent node not found');
    }

    /**
     * Add a generic element to the tree (recursively)
     * @param treeData 
     * @param id parent node id
     * @param property property to add
     * @param value property values
     * @param dontTraverseArray if true, the function does not traverse the array (used for inner array elements)
     */
    addSubJsonElement(treeData: NodeModel<IJsonTreeData>[], id: number | string, property: string,
                            value?: Record<string, string | number | boolean>, isArrayElement?: boolean, insertPosition?: number) {
        const currentNode = treeData.find(node => node.id === id);
        if (!currentNode) {
            throw new Error('Node not found');
        }
        let parentProperty = "";
        if (currentNode.data?.nodeType === NodeType.Array && isArrayElement) {
            parentProperty = this.getParentProperty(treeData, currentNode.parent);
        } else {
            parentProperty = this.getParentProperty(treeData, id);
        }
        if (parentProperty === '') {
            throw new Error('Parent key not found');
        }
        const element = jsonConfigStructure.find(el => el.propertyName === property && el.parentProperty === parentProperty);
        if (!element) {
            throw new Error('Element type not found');
        }
        let newTreeData = [...treeData];
        let currentId = id;
        let currentProperty = property;
        let result: {treeData: NodeModel<IJsonTreeData>[], newNodeId: (number | string)[]} = {treeData: newTreeData, newNodeId: [id]};
        if (isArrayElement && element.type !== 'array') {
            throw new Error('Element is not an array');
        }
        if (isArrayElement && currentNode.data?.nodeType !== NodeType.Array) {
            throw new Error('Node is not an array');
        }
        if (element.type === 'leaf' || (element.type === 'array' && !isArrayElement)) {
            const partialResult = this.addProperty(newTreeData, currentId, 
                {key: currentProperty, defaultValue: value?.[property] ?? (element.defaultValue ?? "insert_value")}, false, element.type === 'array'
            );
            result.treeData = partialResult.treeData;
            result.newNodeId = [...result.newNodeId, ...partialResult.newNodeId];
            return result;
        }
        const parentPropertyName = element.type === 'array' && isArrayElement ? property : element.propertyName;
        let nodesToAdd = jsonConfigStructure.filter(el => el.parentProperty === parentPropertyName && el.defaultAdd && 
            (!el.conditionalProperty || (value &&
                (Object.keys(value ?? {}).includes(el.conditionalProperty) && 
                    (el.conditionalValue && el.conditionalValue.includes(String(value[el.conditionalProperty]))
                        || (el.conditionalValueExclusion && !el.conditionalValueExclusion.includes(String(value[el.conditionalProperty]))))
                )
            ))
        );
        if (element.type === 'array' && isArrayElement) {
            let partialResult = this.addArrayElement(treeData, id, insertPosition);
            //let partialResult = this.addProperty(newTreeData, id, {key: property, defaultValue: '', notRemovable: !element.optional}, false, true); // TODO override?
            result.treeData = partialResult.treeData;
            result.newNodeId = [...result.newNodeId, ...partialResult.newNodeId];
            const currentParentNode: string | number = partialResult.newNodeId[0];
            nodesToAdd.filter(el => el.defaultAdd).forEach(node => {
                partialResult = this.addSubJsonElement(partialResult.treeData, currentParentNode, node.propertyName, value);
                result.treeData = partialResult.treeData;
                result.newNodeId = [...result.newNodeId, ...partialResult.newNodeId];
            });
        } else if(element.type = 'object') {
            let partialResult = this.addProperty(newTreeData, currentId, 
                {key: currentProperty, defaultValue: value?.[currentProperty] ?? (element.defaultValue ?? "insert_value")}, true
            );
            result.treeData = partialResult.treeData;
            result.newNodeId = [...result.newNodeId, ...partialResult.newNodeId];
            const currentParentNode: string | number = partialResult.newNodeId[0];
            nodesToAdd.filter(el => el.defaultAdd).forEach(node => {
                partialResult = this.addSubJsonElement(partialResult.treeData, currentParentNode, node.propertyName, value);
                result.treeData = partialResult.treeData;
                result.newNodeId = [...result.newNodeId, ...partialResult.newNodeId];
            });
        }
        return result;      
    }

    /**
     * Add a generic element to the tree
     * @param treeData 
     * @param id parent node id
     * @param property property to add
     * @param value property values
     * @param isArrayElement if true, an element of property (which must be an array) is being added
     */
    addJsonElement(treeData: NodeModel<IJsonTreeData>[], id: number | string, property: string,
            value?: Record<string, string | number | boolean>, isArrayElement?: boolean, insertPosition?: number) {
        const currentNode = treeData.find(node => node.id === id);
        if (!currentNode) {
            throw new Error('Node not found');
        }
        return this.addSubJsonElement(treeData, id, property, value, isArrayElement, insertPosition);
    }

    /**
     * Add an array element of a class among layoutGroups, sections, components to the tree
     * @param treeData 
     * @param id 
     * @param arrayClass 
     * @param value 
     * @returns 
     */
    addClassElement(treeData: NodeModel<IJsonTreeData>[], id: number | string, arrayClass: 'layoutGroups' | 'sections' | 'components' | 'subFields' | 'customList', 
                                    value?: Record<string, string>, insertPosition?: number): 
                                    {treeData: NodeModel<IJsonTreeData>[], newNodeId: (number | string)[]} {
        return this.addJsonElement(treeData, id, arrayClass, value, true, insertPosition);
    }

    /**
     * Adds a group element to the tree
     * @param treeData The tree data
     * @param id The id of the parent node
     * @param value Property values of the group element
     */
    addGroupElement(treeData: NodeModel<IJsonTreeData>[], id: number | string, value?: Record<string, string>):
                                    {treeData: NodeModel<IJsonTreeData>[], newNodeId: (number | string)[]} {
        return this.addClassElement(treeData, id, 'layoutGroups', value);
    }

    /**
     * Adds a section element to the tree
     * @param treeData The tree data
     * @param id The id of the parent node
     * @param value Property values of the section element
     */
    addSectionElement(treeData: NodeModel<IJsonTreeData>[], id: number | string, value?: Record<string, string>):
                                    {treeData: NodeModel<IJsonTreeData>[], newNodeId: (number | string)[]} {
        return this.addClassElement(treeData, id, 'sections', value);
    }

    /**
     * Adds a component element to the tree
     * @param treeData The tree data
     * @param id The id of the parent node
     * @param value Property values of the component element
     */
    addComponentElement(treeData: NodeModel<IJsonTreeData>[], id: number | string, value?: Record<string, string>):
                                    {treeData: NodeModel<IJsonTreeData>[], newNodeId: (number | string)[]} {
        return this.addClassElement(treeData, id, 'components', value);
    }

    /**
     * Add an element to a combobox custom list
     * @param treeData The tree data
     * @param id The id of the parent node
     * @param value Property values of the element
     * @returns 
     */
    addCustomListElement(treeData: NodeModel<IJsonTreeData>[], id: number | string):
                                    {treeData: NodeModel<IJsonTreeData>[], newNodeId: (number | string)[]} {
        const result = this.addClassElement(treeData, id, 'customList', {value: 'value', label: 'label'});
        return {
            treeData: result.treeData,
            newNodeId: result.newNodeId
        };
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
                const properties = jsonConfigStructure.filter(el => el.parentProperty === 'subFields').map(el => el.propertyName);
                return this.addClassElement(treeData, componentsNodeid, 'subFields', 
                    {colId: fieldName, fieldName: fieldName, component: fieldName, label: fieldName, 
                        componentType: componentType.componentType}, insertPosition);
            } else {
                return this.addClassElement(treeData, componentsNodeid, 'components', 
                    {componentName: fieldName, fieldName: fieldName, component: fieldName, label: fieldName, 
                        componentType: componentType.componentType}, insertPosition);
            }
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
     */
    addProperty(treeData: NodeModel<IJsonTreeData>[], id: number | string, property: IOptionalProperties,
                isObject?: boolean, isArray?: boolean):
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
        let resultTreeData = this.addTreeDataParams([...treeData, newNode]);

        return {
            treeData: resultTreeData,
            newNodeId: [newNode.id]
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
        const result = this.addClassElement(treeData, id, 'components', {componentType: 'wdSubForm', entityName: entity});
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
     * Remove recursively the sub elements of an array from the tree
     * @param treeData The tree data
     * @param id The id of the array element to remove
     */
    private removeTreeElementSubNode(treeData: NodeModel<IJsonTreeData>[], id: number | string):
                                    NodeModel<IJsonTreeData>[] {
        let newTreeData = [...treeData];
        treeData.filter(el => el.parent === id).forEach(node => {
            newTreeData = this.removeTreeElementSubNode(newTreeData, node.id);
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
    removeTreeElement(treeData: NodeModel<IJsonTreeData>[], id: number | string): NodeModel<IJsonTreeData>[] {
        const currentNode = treeData.find(el => el.id === id);
        if (currentNode) {
            const parentNodeId = currentNode.parent;
            //const newTreeData = treeData.filter(node => node.id !== id);
            const newTreeData = this.removeTreeElementSubNode(treeData, id);

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
            return this.addTreeDataParams(newTreeData);
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
        baseData = this.addGroupElement(baseData, layoutGroupsNode!.id, {groupName: "Main", label: "Main"}).treeData;
        const sectionsNode = baseData.find(
            el => el.data && 'key' in el.data && el.data?.key === 'sections'
        );
        baseData = this.addSectionElement(baseData, sectionsNode!.id, {sectionName: "main_section", label: "Main section"}).treeData;
        const openNodes = baseData.filter(el =>
            el.data?.nodeType !== NodeType.CloseNode && el.data?.nodeSubType !== 'toolbar'
        ).map(el => el.id);
        baseData = this.updateTreeDataValueLists({treeData: baseData, newNodeId: openNodes}, dataSchema);
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
        return this.addTreeDataParams(this.buildTreeData(jsonObject));
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
        if (!currentNode || !parentNode) {
            return treeData;
        } 
        let componentTypeModified = false;
        // Calculate nodes to remove and properties to add if the component type is being changed
        const nodesToRemove: (string |number)[] = [];
        const propertiesToAdd: string[] = [];
        if (currentNode && currentNode.data?.nodeType === NodeType.Leaf && currentNode.data.key === 'componentType' && parentNode) {
            componentTypeModified = true;
            const currentPropertyNodes = treeData.filter(node => node.parent === parentNode.id);
            const parentType = this.getParentProperty(treeData, parentNode.id);
            const newProperties = jsonConfigStructure
                .filter(el => el.parentProperty === parentType && el.defaultAdd && (!el.conditionalProperty || (
                    el.conditionalProperty === 'componentType' && 
                        ((el.conditionalValue && el.conditionalValue.includes(newValue)) || 
                            (el.conditionalValueExclusion && !el.conditionalValueExclusion.includes(newValue)))))
                ).map(el => el.propertyName);
            currentPropertyNodes.forEach(node => {
                if (node.data && 'key' in node.data) {
                    if (!newProperties.includes(String(node.data?.key))) {
                        nodesToRemove.push(node.id);
                    }
                }
            });
            newProperties.forEach(prop => {
                if (!(currentPropertyNodes.find(node => !!node.data && 'key' in node.data && node.data.key === prop))) {
                    propertiesToAdd.push(prop);
                }
            });
        }
        let newTreeData: NodeModel<IJsonTreeData>[] = [...treeData];
        const modifiedNode = newTreeData.find(el => el.id === nodeId);
        if (modifiedNode && modifiedNode.data && modifiedNode.data.nodeType === NodeType.Leaf) {
            modifiedNode.data.text2 = newValue;
            modifiedNode.data.value = newValue;
            modifiedNode.data.nodeTextCustomStyle = undefined;
            modifiedNode.data.blocked_update = false;
        }
        
        nodesToRemove.forEach(el => {
            const index = newTreeData.findIndex(node => node.id === el);
            if (index > -1) {
                newTreeData.splice(index, 1);
            }
        });
        propertiesToAdd.forEach(el => {
            newTreeData = this.addJsonElement(newTreeData, parentNode?.id, el).treeData;
        });
        return this.addTreeDataParams(newTreeData);
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
    addTreeDataParams = (treeData: NodeModel<IJsonTreeData>[]) => {
        return this.assignSubTypes(treeData).map(node => {
            if (!node.data || Number(node.parent) < 2) {
                return node;
            }
            const newNode: NodeModel<IJsonTreeData> = {...node};
            const nodeKey = newNode.data && 'key' in newNode.data ? newNode.data.key : '';
            let nodeType = newNode.data?.nodeType;
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
            if (newNode.data && !newNode.data.actions) {
                newNode.data.actions = [];
            }
            let actions: ITreeAction[] = [];
            if (nodeType === NodeType.ArrayElement || nodeType === NodeType.Object) {
                const parentProperty = this.getParentProperty(treeData, nodeType === NodeType.ArrayElement ? newNode.parent : newNode.id);
                const childrenProps = treeData.filter(el => el.parent === newNode.id);
                const optionalProperties = jsonConfigStructure.filter(el => 
                    el.parentProperty === parentProperty && (!el.conditionalProperty ||
                        (el.conditionalProperty && childrenProps.find(s => s?.data && 'key' in s.data && 'value' in s.data && s.data.key === el.conditionalProperty &&
                            ((el.conditionalValue && el.conditionalValue.includes(String(s.data.value))) ||
                                (el.conditionalValueExclusion && !el.conditionalValueExclusion.includes(String(s.data.value)))))
                        ))
                    ).filter(p => !childrenProps.find(s => s.data && 'key' in s.data && s.data.key === p.propertyName)) 
                    .map(el => ({key: el.propertyName, defaultValue: el.defaultValue, notRemovable: !el.optional})  //TODO: override ?
                );
                actions = [...actions, 
                    ...(optionalProperties.length > 0 ? [this.defineStandardAction('plus', 'primary', '', 
                        (nodeId: number | string, params: Record<string, unknown>) => this.genericAction('addProperty',
                            {nodeId: nodeId, ...(params ?? {})}), 'end', undefined, 
                            {optionalProperties: optionalProperties})] : []),
                ];
            } 
            if (nodeType === NodeType.Array) {
                const actionForArray: {
                    actionType: JsonTreeActionType, 
                    icon: string,
                    color: DailyToolbarPaletteType, 
                    additionalParams?: Record<string, unknown>
                }[] = [];
                switch(nodeKey) {
                    case 'layoutGroups':
                        actionForArray.push({actionType: 'addGroup', icon: 'plus-circle-outline', color: 'primary'});
                        break;
                    case 'sections':
                        actionForArray.push({actionType: 'addSection', icon: 'plus-circle-outline', color: 'primary'});
                        break;
                    case 'components':
                        actionForArray.push({actionType: 'addComponent', icon: 'plus-circle-outline', color: 'primary'});
                        actionForArray.push({actionType: 'addSubForm', icon: 'table-large-plus', color: 'primary'});
                        break;
                    case 'subFields':
                        actionForArray.push({actionType: 'addComponentFromField', icon: 'plus-circle-outline', color: 'primary'});
                        break;
                    case 'customList':
                        actionForArray.push({actionType: 'addCustomListElement', icon: 'plus-circle-outline', color: 'primary'});
                        actionForArray.push({actionType: 'removeTreeElement', icon: 'close', color: 'error'});
                        break;
                    default:
                        actionForArray.push({actionType: 'removeTreeElement', icon: 'close', color: 'error'});
                        break;
                }
                actions = [...actions, 
                    ...actionForArray
                        .map(el => this.defineStandardAction(el.icon, el.color, '', 
                            (nodeId: number | string, params: Record<string, unknown>) => 
                                this.genericAction(el.actionType,{nodeId: nodeId, ...(params ?? {})}), 'end', undefined))
                ];
            }
            if (nodeType === NodeType.ArrayElement) {
                actions = [...actions,
                    this.defineStandardAction('close', 'error', '', 
                        (nodeId: number | string, params: Record<string, unknown>) => this.genericAction('removeTreeElement',
                            {nodeId: nodeId, ...(params ?? {})}), 
                            'end'
                    )
                ];
                const parentProperty = this.getParentProperty(treeData, nodeType === NodeType.ArrayElement ? newNode.parent : newNode.id);
                if (parentProperty === 'components') {
                    const childrenProps = treeData.filter(el => el.parent === newNode.id);
                    if (childrenProps.find(el => el.data && 'key' in el.data && el.data.key === 'fieldName')) {
                        actions = [...actions,
                            this.defineStandardAction('target', 'primary', '', 
                                (nodeId: number | string, params: Record<string, unknown>) => this.genericAction('locateComponent',
                                    {nodeId: nodeId, ...(params ?? {})}), 
                                    'end'
                            )
                        ];
                    }
                }
            }
            if (nodeType === NodeType.Leaf || nodeType === NodeType.Object) {
                const parentProperty = this.getParentProperty(treeData, nodeType === NodeType.Leaf ? newNode.parent : newNode.id);
                let removable = true;
                const property = jsonConfigStructure.find(el => el.propertyName === nodeKey && parentProperty === el.parentProperty);
                if (property && !property.optional) {
                    removable = false;
                }
                if (removable) {
                    actions = [...actions,
                        this.defineStandardAction('close', 'error', '', 
                            (nodeId: number | string, params: Record<string, unknown>) => this.genericAction('removeTreeElement',
                                {nodeId: nodeId, ...(params ?? {})}), 
                                'end'
                        )
                    ];
                }
            }
            if (newNode.data) {
                newNode.data.actions = actions;
            }
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
                                node.data?.key === 'filterable' || node.data?.key === 'defaultVisible' || 
                                node.data?.key === 'customListValueDisplayed')) {
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
