import type {ITreeData} from "@tcpos/backoffice-components";

export enum NodeType {
    Object = 'object',
    Array = 'array',
    Leaf = 'leaf',
    CloseNode = 'closeNode',
    ArrayElement = 'arrayElement',
    RootNode = 'rootNode'
}

export interface IOptionalProperties {
    key: string,
    defaultValue: string | number | boolean,
    override?: boolean,
    notRemovable?: boolean
}

export enum NodeSubType {
    ObjectName = 'objectName',
    Toolbar = 'toolbar',
    TitleField = 'titleField',
    DetailView = 'detailView',
    DetailViewLabel = 'detailViewLabel',
    EntityName = 'entityName',
    LayoutGroups = 'layoutGroups',
    LayoutGroupElement = 'layoutGroupElement',
    LayoutGroupElementName = 'layoutGroupElementName',
    LayoutGroupElementLabel = 'layoutGroupElementLabel',
    LayoutGroupSections = 'layoutGroupSections',
    LayoutGroupSectionElement = 'layoutGroupSectionElement',
    LayoutGroupSectionElementName = 'layoutGroupSectionElementName',
    LayoutGroupSectionElementLabel = 'layoutGroupSectionElementLabel',
    LayoutGroupSectionElementComponent = 'layoutGroupSectionElementComponent',
    LayoutGroupSectionElementComponentName = 'layoutGroupSectionElementComponentName',
    LayoutGroupSectionElementComponentLabel = 'layoutGroupSectionElementComponentLabel',
    LayoutGroupSectionElementComponentFieldName = 'layoutGroupSectionElementComponentFieldName',
    LayoutGroupSectionElementComponentProps = 'layoutGroupSectionElementComponentProps',
}

interface IJsonTreeDataWithType extends ITreeData {
    nodeType: NodeType,
    nodeSubType?: NodeSubType,
    blocked_update?: boolean,
    connectedEntity?: string
}

interface IJsonTreeDataObject extends IJsonTreeDataWithType {
    nodeType: NodeType.Object,
    optionalSubProperties?: IOptionalProperties[]
    removable?: boolean,
    key: string,
}

interface IJsonTreeDataArray extends IJsonTreeDataWithType {
    nodeType: NodeType.Array,
    removable?: boolean,
    key: string,
}

interface IJsonTreeDataCloseNode extends IJsonTreeDataWithType {
    nodeType: NodeType.CloseNode,
    mainNodeId: number | string,
    mainNodeParent: number | string,
}

interface IJsonTreeDataRootNode extends IJsonTreeDataWithType {
    nodeType: NodeType.RootNode,
}

interface IJsonTreeDataLeaf extends IJsonTreeDataWithType {
    nodeType: NodeType.Leaf,
    key: string,
    value: string | number | boolean,
    editable?: boolean,
    removable?: boolean,
    allowedValues?: (string | number)[],
    isBoolean?: boolean
}

export interface IJsonTreeDataArrayElement extends IJsonTreeDataWithType {
    nodeType: NodeType.ArrayElement,
    key: number
    optionalSubProperties?: IOptionalProperties[]
}

export type IJsonTreeData = IJsonTreeDataObject | IJsonTreeDataArray | IJsonTreeDataLeaf | IJsonTreeDataCloseNode |
    IJsonTreeDataArrayElement | IJsonTreeDataRootNode;
