import type {NodeModel} from "@minoru/react-dnd-treeview";
import _, {isNumber} from "underscore";
import { NodeType} from "./IJsonTreeData";
import type {IJsonTreeData} from "./IJsonTreeData";
import { jsonConfigStructure, type IJsonConfigStructure } from "./JsonConfigStructure";

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

    buildTreeData(jsonObject: Object, offset?: number): NodeModel<IJsonTreeData>[] { 
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
            ...this.convertNodeIds(this.addSubtreeData(json, 1), offset ?? 2),
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
            error = `Wrong properties in ${objectDescription}: `;
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

    getProperties = (jsonObject: any, property: string): {mandatoryProps: string[], optionalProps: string[]} => {
        const subProperties: IJsonConfigStructure[] = jsonConfigStructure.filter(el => el.parentProperty === property &&
            (!el.conditionalProperty || (
                el.conditionalProperty && jsonObject[el.conditionalProperty] && 
                    ((el.conditionalValue && el.conditionalValue.includes(jsonObject[el.conditionalProperty])) || 
                        (el.conditionalValueExclusion && !el.conditionalValueExclusion.includes(jsonObject[el.conditionalProperty])))))
            )
            ?? [];
        const mandatoryProps = subProperties.filter(el => !el.optional).map(el => el.propertyName);
        const optionalProps = subProperties.filter(el => !!el.optional).map(el => el.propertyName);
        return {mandatoryProps, optionalProps};
    }

    jsonSubValidation = (subObject: any, property: string, nav: string) => {
        const propertyInfo = jsonConfigStructure.find(el => el.propertyName === property);
        let errors: string[] = [];
        if (propertyInfo?.type === "array") {
            if (!Array.isArray(subObject)) {
                return [`${nav} property must be an array.`];
            }
            subObject.forEach((el: any, index: number) => {
                const {mandatoryProps, optionalProps} = this.getProperties(el, property);
                const currentErrors = this.checkObjectProperties(el, mandatoryProps, optionalProps, `${nav}/${property}[${index}]`);
                if (currentErrors !== "") {
                    errors = [...errors, currentErrors];
                } else {
                    Object.keys(el).forEach(key => {
                        const currentErrors = this.jsonSubValidation(el[key], key, `${nav}/${property}[${index}]`);
                        if (currentErrors.length > 0) {
                            errors = [...errors, ...currentErrors];
                        }
                    });
                }
            });
        } else if (propertyInfo?.type === "object") {
            if (typeof subObject !== 'object' || subObject === null || Array.isArray(subObject)) {
                return [`${property} property must be an object.`];
            }
            const {mandatoryProps, optionalProps} = this.getProperties(subObject, property);
            const currentErrors = this.checkObjectProperties(subObject, mandatoryProps, optionalProps, `${nav}`);
            if (property === "externalDataInfo") {
                if (Object.keys(subObject).length !== 1) {
                    return [`${nav} property must have exactly one property ('apiCallInfo' or 'customList).`];
                }
            }
            if (currentErrors !== "") {
                errors = [...errors, currentErrors];
            } else {
                Object.keys(subObject).forEach((el) => {
                    const currentErrors = this.jsonSubValidation(subObject[el], el, `${nav}/${el}`);
                    if (currentErrors.length > 0) {
                        errors = [...errors, ...currentErrors];
                    }
                });
            }
        } else { // leaf
            if (subObject === null || typeof subObject === 'object' || Array.isArray(subObject)) { 
                return [`${property} property must not be an object or an array.`];
            }
        }
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
        }

        if (error.filter(el => el !== "").length > 0) {
            return error.join(" - ");
        } else {
            return "";
        }
    }
}