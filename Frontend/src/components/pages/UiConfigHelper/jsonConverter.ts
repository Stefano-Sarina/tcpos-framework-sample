import type {NodeModel} from "@minoru/react-dnd-treeview";
import _, {isNumber} from "underscore";
import { NodeType} from "./IJsonTreeData";
import type {IJsonTreeData} from "./IJsonTreeData";

export class JsonConverter {
    private addSubtreeData(partialJson: Record<string, any>, parentId: number | string) {
        let newSubTreeData: NodeModel<IJsonTreeData>[] = [];
        if (!Array.isArray(partialJson)) {
            Object.keys(partialJson).forEach((el, index) => {
                const objectKeyValue: Object = partialJson[el];
                if (!Array.isArray(objectKeyValue)) {
                    if (typeof objectKeyValue === 'object' && objectKeyValue !== null) {
                        newSubTreeData = [
                            ...newSubTreeData,
                            ...this.addSubTreeObject(objectKeyValue, el, parentId)
                        ];
                    } else { // the object is a leaf
                        newSubTreeData = [
                            ...newSubTreeData,
                            ...this.addSubTreeLeaf(el, objectKeyValue, parentId)
                        ];
                    }
                } else {
                    // array
                    newSubTreeData = [
                        ...newSubTreeData,
                        ...this.addSubTreeArray(objectKeyValue, el, parentId),
                    ];
                }
            })
        }
        return newSubTreeData;
    }

    private addSubTreeArray(partialJson: Record<string, any>, key: string, parentId: number | string): NodeModel<IJsonTreeData>[] {
        return [
            {
                id: parentId + "_" + key + "_openArray",
                parent: parentId,
                droppable: true,
                text: key + ":",
                data: {
                    typographyProps: {
                        variant: 'body1'
                    },
                    text2TypographyProps: {
                        variant: 'h6'
                    },
                    nodeType: NodeType.Array,
                    key: key,
                }
            },
            ..._.flatten(partialJson.map((el2: any, index2: number) => {
                return this.addSubTreeArrayElement(index2, el2, parentId + "_" + key + "_openArray");
            })),
        ];
    }

    private addSubTreeArrayElement(index: number, partialJson: Record<string, any>, parentId: number | string): NodeModel<IJsonTreeData>[] {
        return [
            {
                id: parentId + "_" + index + "_openNode",
                parent: parentId,
                droppable: true,
                text: index + ":",
                data: {
                    typographyProps: {
                        variant: 'body1'
                    },
                    text2TypographyProps: {
                        variant: 'h6'
                    },
                    nodeType: NodeType.ArrayElement,
                    key: index
                }
            },
            ...this.addSubtreeData(partialJson, parentId + "_" + index + "_openNode"),
        ];
    }

    private addSubTreeLeaf(key: string, value: any, parentId: number | string): NodeModel<IJsonTreeData>[] {
        return [
            {
                id: parentId + "_" + key,
                parent: parentId,
                droppable: false,
                text: key + ":",
                data: {
                    typographyProps: {
                        variant: 'body1'
                    },
                    text2: value,
                    text2TypographyProps: {
                        color: 'error'
                    },
                    nodeType: NodeType.Leaf,
                    editable: key !== 'entityName',
                    key: key,
                    value: value
                }
            }
        ];
    };

    private addSubTreeObject(partialJson: Record<string, any>, key: string, parentId: number | string): NodeModel<IJsonTreeData>[] {
        return [
            {
                id: parentId + "_" + key + "_openNode",
                parent: parentId,
                droppable: true,
                text: key + ":",
                data: {
                    typographyProps: {
                        variant: 'body1'
                    },
                    text2TypographyProps: {
                        variant: 'h6'
                    },
                    nodeType: NodeType.Object,
                    key: key
                }
            },
            ...this.addSubtreeData(partialJson, parentId + "_" + key + "_openNode"),
        ]
    }

    private convertNodeIds(treeData: NodeModel<IJsonTreeData>[], offset: number) {
        const idList = treeData.map(el => el.id);
        const newTreeData: NodeModel<IJsonTreeData>[] = treeData.map(node =>
            ({
                ...node,
                id: idList.indexOf(node.id) + offset + 1,
                parent: isNumber(node.parent) ? node.parent : idList.indexOf(node.parent) + offset + 1,
            })
        );
        return newTreeData;
    }

    buildTreeData(jsonObject: Object): NodeModel<IJsonTreeData>[] {
        const json = jsonObject as Record<string, any>;
        let newTreeData: NodeModel<IJsonTreeData>[] = [
            {
                id: 1,
                parent: 0,
                droppable: true,
                text: "{",
                data: {
                    typographyProps: {
                        variant: 'h6'
                    },
                    nodeType: NodeType.RootNode,
                }
            },
            ...this.convertNodeIds(this.addSubtreeData(json, 1), 2),
            {
                id: 2,
                parent: 0,
                droppable: false,
                text: "}",
                data: {
                    typographyProps: {
                        variant: 'h6'
                    },
                    nodeType: NodeType.CloseNode,
                    mainNodeId: 1,
                    mainNodeParent: 0,
                }
            }
        ];
        return newTreeData;
    }

    convertTreeData2Json = (treeData: NodeModel<IJsonTreeData>[]): Record<string, any> => {
        const rootNode = treeData.find(el => el.data?.nodeType === NodeType.RootNode);
        if (!rootNode) {
            return {};
        }
        return this.convertSubTreeData2Json(treeData, rootNode.id);
    }

    private convertSubTreeData2Json = (treeData: NodeModel<IJsonTreeData>[], parentId: number | string): Record<string, any> => {
        const jsonRes:Record<string, any> = {};
        const childrenNodes = treeData.filter(node =>
            node.data?.nodeType !== NodeType.CloseNode && node.parent === parentId);
        childrenNodes.forEach(node => {
            const objectKey = (node.data && 'key' in node.data) ? String(node.data?.key) : node.text;
            if (node.data?.nodeType === NodeType.Leaf) {
                jsonRes[objectKey] = node.data?.text2;
            } else if (node.data?.nodeType === NodeType.Object) {
                jsonRes[objectKey] = this.convertSubTreeData2Json(treeData, node.id);
            } else if (node.data?.nodeType === NodeType.Array) {
                jsonRes[objectKey] = [];
                const arrayNodes = treeData.filter(el => el.parent === node.id
                    && el.data?.nodeType === NodeType.ArrayElement);
                arrayNodes.forEach(arrayNode => {
                    jsonRes[objectKey].push(this.convertSubTreeData2Json(treeData, arrayNode.id));
                })
            }
        });

        return jsonRes;

    }

    convertJson2TreeData = (jsonObject: Object): NodeModel<IJsonTreeData>[] => {
        return this.buildTreeData(jsonObject);
    }

    private checkObjectProperties = (jsonObject: Object, properties: string[],
                                     optionalProperties: string[], objectDescription: string): string => {
        let error = "";
        const missingProperties: string[] = [];
        properties.forEach(property => {
            if (!Object.keys(jsonObject).includes(property)) {
                missingProperties.push(property);
            }
        });
        const wrongProperties: string[] = [];
        Object.keys(jsonObject).forEach(property => {
            if (![...properties, ...optionalProperties].includes(property)) {
                wrongProperties.push(property);
            }
        });
        if (missingProperties.length > 0 || wrongProperties.length > 0) {
            error = `Wrong properties in ${objectDescription}. `;
            if (missingProperties.length > 0) {
                error += "Properties [" + missingProperties.join(", ") + "] missing. ";
            }
            if (wrongProperties.length > 0) {
                error += "Properties [" + wrongProperties.join(", ") + "] not accepted. ";
            }
            return error;
        }
        return "";
    }

    jsonProperties(prop: string, type?: string):
            {mandatoryProps: string[], optionalProps: string[], arrayProps: {key: string, nameProp: string}[], objectProps?: string[]} {
        switch (prop) {
            case 'detailView':
                return {
                    mandatoryProps: ["titleField", "label", "entityName", "layoutGroups"],
                    optionalProps: [],
                    arrayProps: [{key: "layoutGroups", nameProp: "groupName"}],
                }
            case 'layoutGroups':
                return {
                    mandatoryProps: ["groupName", "label", "sections"],
                    optionalProps: [],
                    arrayProps: [{key: "sections", nameProp: "sectionName"}]
                };
            case 'sections':
                return {
                    mandatoryProps: ["sectionName", "label", "components", "xs"],
                    optionalProps: ["sm", "md", "lg", "xl"],
                    arrayProps: [{key: "components", nameProp: "componentName"}]
                };
            case 'components':
                return {
                    mandatoryProps: [...["componentName", "label", "componentType", "xs"],
                        ...(type === "wdCombobox" ? ["multiSelect", "externalDataInfo"] : []),
                        ...(type !== "wdSubForm" && type !== "wdButton" ? ["fieldName"] : []),
                    ],
                    optionalProps: [...["sm", "md", "lg", "xl", "gridView"],
                        ...(type === "wdNumberTextField" ? ["decimalplaces"] : []),
                        ...(type === "wdButton" ? ["action", "activeOnRMode", "activeOnWMode"] : []),
                        ...(type === "wdSubForm" ? ["minHeight", "pagination", "subFields", "entityName", "fieldName"] : []),
                    ],
                    arrayProps: type === "wdSubForm"
                        ? [{key: "subFields", nameProp: "colId"}, {key: "subFields", nameProp: "cellRenderer.componentName"}]
                        : []
                };
            case "subFields":
                return {
                    mandatoryProps: ["colId", "sortable", "filter", "lockPinned", "flex", "minWidth", "cellRenderer"],
                    optionalProps: ["sm", "md", "lg", "xl"],
                    arrayProps: [],
                    objectProps: ["cellRenderer"]
                };
            case "cellRenderer":
                return {
                    mandatoryProps: ["componentName", "label", "fieldName", "componentType"],
                    optionalProps: [
                        ...(type === "wdNumberTextField" ? ["decimalplaces"] : []),
                        ...(type === "wdCombobox" ? ["multiSelect", "externalDataInfo"] : []),
                        ...(type === "wdButton" ? ["action", "activeOnRMode", "activeOnWMode"] : []),
                    ],
                    arrayProps: []
                };
            case "gridView":
                return {
                    mandatoryProps: ["defaultVisible"], 
                    optionalProps: ["textAlignment", "position", "width", "minWidth", "filterable"],
                    arrayProps: []
                };
            case "externalDataInfo":
                return {
                    mandatoryProps: [],
                    optionalProps: ["apiCallInfo", "customList"],
                    arrayProps: [{key: "customList", nameProp: "value"}, {key: "customList", nameProp: "label"}]
                };
            case "apiCallInfo":
                return {
                    mandatoryProps: ["apiSuffix", "descriptionField", "foreignIdField"],
                    optionalProps: [],
                    arrayProps: []
                };
            default:
                return {
                    mandatoryProps: [],
                    optionalProps: [],
                    arrayProps: []
                };
        }
    };

    jsonSubValidation = (subObject: any, property: string, nav: string) => {
        // Check sub properties
        const {mandatoryProps, optionalProps, arrayProps, objectProps} =
            this.jsonProperties(property, subObject.componentType);
        let errors = [this.checkObjectProperties(subObject, mandatoryProps, optionalProps, `${nav}`)];
        // Check array sub properties
        arrayProps.forEach(prop => {
            if (Object.keys(subObject).includes(prop.key)) {
                if (!Array.isArray(subObject[prop.key])) {
                    errors.push(`${prop} property must be an array.`);
                } else {
                    // Check name duplications
                    const names: string[] = subObject[prop.key].map((el: any) => prop.nameProp.indexOf('.') === -1 ?
                        el[prop.nameProp] : el[prop.nameProp.split('.')[0]][prop.nameProp.split('.')[1]]).sort();
                    const duplications: string[] = [];
                    names.forEach((name, index) => {
                        if (index > 0 && name === names[index - 1]) {
                            duplications.push(name);
                        }
                    });
                    if (duplications.length > 0) {
                        errors = [...errors, `Duplicated names in ${nav}/${prop.key}: ${duplications.join(", ")}`];
                    }
                    // Check array element sub properties
                    subObject[prop.key].forEach((el: any, index: number) => {
                        errors = [...errors, ...this.jsonSubValidation(el, prop.key, nav + `/${prop.key}[${index}]`)];
                    });
                }
            }
        });
        // Check object sub properties
        objectProps?.forEach(prop => {
            errors = [...errors, ...this.jsonSubValidation(subObject[prop], prop, nav + `/${prop}`)];
        });
        return [...errors];
    }

    jsonValidation (jsonObject: Object) {
        // Check main properties
        let error: string[] = [this.checkObjectProperties(jsonObject, ["objectName", "toolbar", "detailView"], [],
            "main object")];
        if (Object.keys(jsonObject).includes("detailView")) {
            // Check detailView properties and sub properties
            const detailView = (jsonObject as Record<string, any>).detailView;
            error = [...error, ...this.jsonSubValidation(detailView, "detailView", "detailView")];
            // Check combo box properties
            const layoutGroups: Record<string, unknown>[] = Array.isArray(detailView.layoutGroups) ? detailView.layoutGroups : [];
            layoutGroups.forEach((layoutGroup: Record<string, unknown>, groupIndex: number) => {
                const sections: Record<string, unknown>[] = Array.isArray(layoutGroup.sections) ? layoutGroup.sections : [];
                sections.forEach((section: Record<string, unknown>, sectionIndex: number) => {
                    const components: Record<string, unknown>[] = Array.isArray(section.components) ? section.components : [];
                    components.forEach((component: Record<string, unknown>, index: number) => {
                        if (component.componentType === "wdCombobox") {
                            if ((component.externalDataInfo as Record<string, unknown>)?.apiCallInfo &&
                                (component.externalDataInfo as Record<string, unknown>)?.customList) {
                                error = [...error, "An externalDataInfo property of a combobox component cannot have both apiCallInfo and customList properties. Error in " +
                                    `detailView/layoutGroups[${groupIndex}]/sections[${sectionIndex}]/components[${index}]`];
                            }
                            if (!(component.externalDataInfo as Record<string, unknown>)?.apiCallInfo &&
                                !(component.externalDataInfo as Record<string, unknown>)?.customList) {
                                error = [...error, "An externalDataInfo property of a combobox component must have an apiCallInfo or a customList property. Error in " +
                                    `detailView/layoutGroups[${groupIndex}]/sections[${sectionIndex}]/components[${index}]`];
                            }
                            const valueDuplications: string[] = [];
                            const labelDuplications: string[] = [];
                            if ((component.externalDataInfo as Record<string, unknown>)?.customList) {
                                const customList = (component.externalDataInfo as Record<string, unknown>)?.customList;
                                const values = (customList as {value: unknown, label: string}[])
                                    .map(el => el.value).sort();
                                values.forEach((value, index) => {
                                    if (index > 0 && value === values[index - 1]) {
                                        valueDuplications.push(String(value));
                                    }
                                });
                                const labels = (customList as {value: unknown, label: string}[])
                                    .map(el => el.label).sort();
                                labels.forEach((label, index) => {
                                    if (index > 0 && label === labels[index - 1]) {
                                        labelDuplications.push(String(label));
                                    }
                                });
                                if (valueDuplications.length > 0) {
                                    error = [...error, "Duplicated values in custom list: [" + valueDuplications.join(", ") + "]. Error in " +
                                        `detailView/layoutGroups[${groupIndex}]/sections[${sectionIndex}]/components[${index}]`];
                                }
                                if (labelDuplications.length > 0) {
                                    error = [...error, "Duplicated labels in custom list: [" + labelDuplications.join(", ") + "]. Error in " +
                                        `detailView/layoutGroups[${groupIndex}]/sections[${sectionIndex}]/components[${index}]`];
                                }
                            }
                        }
                    });
                });
            })
        }

        if (error.filter(el => el !== "").length > 0) {
            return error.join(" - ");
        } else {
            return "";
        }
    }
}