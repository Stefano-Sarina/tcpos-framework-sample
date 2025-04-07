/**
 * This is the structure of the JSON config file.
 */
export interface IJsonConfigStructure {
    /**
     * The name of the property in the JSON config file.
     */
    propertyName: string,

    /**
     * The name of the parent property in the JSON config file.
     */
    parentProperty: string,
    
    /**
     * The name of the property of the parent that is used to conditionally add this property.
     */
    conditionalProperty?: string,

    /**
     * The values of the conditional property that will add this property.
     */
    conditionalValue?: string[],

    /**
     * The values of the conditional property that will exclude this property.
     */
    conditionalValueExclusion?: string[],

    /**
     * The type of the property in the JSON config file.
     * It can be one of the following:
     * - 'leaf': a single value (string, number, boolean)
     * - 'object': an object with properties
     * - 'array': an array of objects
     */
    type: 'leaf' | 'object' | 'array',
    optional: boolean,
    defaultAdd: boolean,
    unique: boolean,
    defaultValue?: string | number
}

/**
 * This is the structure of the JSON config file.
 * It defines the properties of the JSON config file and their types.
 * It also defines the parent properties and the default values for each property.
 * It is used to validate the JSON config file and to generate the JSON config file.
 * It is also used to generate the UI for the JSON config file.
 * !!! Important !!! propertyName + parentProperty must be unique in the structure.
 * !!! Important !!! propertyName must be unique in the structure for object and array types.
 */
export const jsonConfigStructure: IJsonConfigStructure[] = [
    {
        propertyName: 'detailView',
        parentProperty: '',
        type: 'object',
        optional: false,
        defaultAdd: true, 
        unique: false,
    },
    {
        propertyName: 'titleField',
        parentProperty: 'detailView',
        type: 'leaf',
        optional: false,
        defaultAdd: true, 
        unique: false,
        defaultValue: 'Title field(s)'
    },
    {
        propertyName: 'label',
        parentProperty: 'detailView',
        type: 'leaf',
        optional: false,
        defaultAdd: true, 
        unique: false,
        defaultValue: 'label'
    },
    {
        propertyName: 'entityName',
        parentProperty: 'detailView',
        type: 'leaf',
        optional: false,
        defaultAdd: true, 
        unique: false,
        defaultValue: 'entity_name'
    },
    {
        propertyName: 'layoutGroups',
        parentProperty: 'detailView',
        type: 'array',
        optional: false,
        defaultAdd: true, 
        unique: false,
    },
    {
        propertyName: 'groupName',
        parentProperty: 'layoutGroups',
        type: 'leaf',
        optional: false,
        defaultAdd: true, 
        unique: true,
        defaultValue: 'groupName{index}'
    },
    {
        propertyName: 'label',
        parentProperty: 'layoutGroups',
        type: 'leaf',
        optional: false,
        defaultAdd: true, 
        unique: false,
        defaultValue: 'label'
    },
    {
        propertyName: 'sections',
        parentProperty: 'layoutGroups',
        type: 'array',
        optional: false,
        defaultAdd: true, 
        unique: false,
    },
    {
        propertyName: 'sectionName',
        parentProperty: 'sections',
        type: 'leaf',
        optional: false,
        defaultAdd: true, 
        unique: true,
        defaultValue: 'sectionName{index}'
    },
    {
        propertyName: 'label',
        parentProperty: 'sections',
        type: 'leaf',
        optional: false,
        defaultAdd: true, 
        unique: false,
        defaultValue: 'label'
    },
    {
        propertyName: 'xs',
        parentProperty: 'sections',
        type: 'leaf',
        optional: true,
        defaultAdd: true, 
        unique: false,
        defaultValue: 12
    },
    {
        propertyName: 'sm',
        parentProperty: 'sections',
        type: 'leaf',
        optional: true,
        defaultAdd: false, 
        unique: false,
        defaultValue: 12
    },
    {
        propertyName: 'md',
        parentProperty: 'sections',
        type: 'leaf',
        optional: true,
        defaultAdd: false, 
        unique: false,
        defaultValue: 12
    },
    {
        propertyName: 'lg',
        parentProperty: 'sections',
        type: 'leaf',
        optional: true,
        defaultAdd: false, 
        unique: false,
        defaultValue: 12
    },
    {
        propertyName: 'xl',
        parentProperty: 'sections',
        type: 'leaf',
        optional: true,
        defaultAdd: false, 
        unique: false,
        defaultValue: 12
    },
    {
        propertyName: 'components',
        parentProperty: 'sections',
        type: 'array',
        optional: false,
        defaultAdd: true, 
        unique: false,
    },
    {
        propertyName: 'componentName',
        parentProperty: 'components',
        type: 'leaf',
        optional: false,
        defaultAdd: true, 
        unique: true,
        defaultValue: 'componentName{index}'
    },
    {
        propertyName: 'label',
        parentProperty: 'components',
        type: 'leaf',
        optional: false,
        defaultAdd: true, 
        unique: false,
        defaultValue: 'label'
    },
    {
        propertyName: 'componentType',
        parentProperty: 'components',
        type: 'leaf',
        optional: false,
        defaultAdd: true, 
        unique: false,
        defaultValue: 'wdStringTextField'
    },
    {
        propertyName: 'xs',
        parentProperty: 'components',
        type: 'leaf',
        optional: true,
        defaultAdd: true, 
        unique: false,
        defaultValue: 12
    },
    {
        propertyName: 'sm',
        parentProperty: 'components',
        type: 'leaf',
        optional: true,
        defaultAdd: false, 
        unique: false,
        defaultValue: 12
    },
    {
        propertyName: 'md',
        parentProperty: 'components',
        type: 'leaf',
        optional: true,
        defaultAdd: false, 
        unique: false,
        defaultValue: 12
    },
    {
        propertyName: 'lg',
        parentProperty: 'components',
        type: 'leaf',
        optional: true,
        defaultAdd: false, 
        unique: false,
        defaultValue: 12
    },
    {
        propertyName: 'xl',
        parentProperty: 'components',
        type: 'leaf',
        optional: true,
        defaultAdd: false, 
        unique: false,
        defaultValue: 12
    },
    {
        propertyName: 'gridView',
        parentProperty: 'components',
        type: 'object',
        optional: true,
        defaultAdd: true, 
        unique: false,
    },
    {
        propertyName: 'defaultVisible',
        parentProperty: 'gridView',
        type: 'leaf',
        optional: true,
        defaultAdd: true, 
        unique: false,
        defaultValue: 'true'
    },
    {
        propertyName: 'textAlignment',
        parentProperty: 'gridView',
        type: 'leaf',
        optional: true,
        defaultAdd: false, 
        unique: false,
        defaultValue: 'left'
    },
    {
        propertyName: 'position',
        parentProperty: 'gridView',
        type: 'leaf',
        optional: true,
        defaultAdd: false, 
        unique: false,
        defaultValue: 1
    },
    {
        propertyName: 'width',
        parentProperty: 'gridView',
        type: 'leaf',
        optional: true,
        defaultAdd: false, 
        unique: false,
        defaultValue: 200
    },
    {
        propertyName: 'minWidth',
        parentProperty: 'gridView',
        type: 'leaf',
        optional: true,
        defaultAdd: false, 
        unique: false,
        defaultValue: 150
    },
    {
        propertyName: 'filterable',
        parentProperty: 'gridView',
        type: 'leaf',
        optional: true,
        defaultAdd: false, 
        unique: false,
        defaultValue: 'true'
    },
    {
        propertyName: 'multiSelect',
        parentProperty: 'components',
        conditionalProperty: "componentType",
        conditionalValue: ["wdCombobox"],
        type: 'leaf',
        optional: true,
        defaultAdd: false, 
        unique: false,
        defaultValue: 'false'
    },
    {
        propertyName: 'externalDataInfo',
        parentProperty: 'components',
        conditionalProperty: "componentType",
        conditionalValue: ["wdCombobox"],
        type: 'object',
        optional: false,
        defaultAdd: true, 
        unique: false,
    },
    {
        propertyName: 'fieldName',
        parentProperty: 'components',
        conditionalProperty: "componentType",
        conditionalValueExclusion: ["wdButton"],
        type: 'leaf',
        optional: true,
        defaultAdd: true, 
        unique: false,
        defaultValue: 'fieldName'
    },
    {
        propertyName: 'decimalplaces',
        parentProperty: 'components',
        conditionalProperty: "componentType",
        conditionalValue: ["wdNumberTextField"],
        type: 'leaf',
        optional: false,
        defaultAdd: true, 
        unique: false,
        defaultValue: 2
    },
    {
        propertyName: 'action',
        parentProperty: 'components',
        conditionalProperty: "componentType",
        conditionalValue: ["wdButton"],
        type: 'leaf',
        optional: false,
        defaultAdd: true, 
        unique: false,
        defaultValue: "actionName"
    },
    {
        propertyName: 'activeOnRMode',
        parentProperty: 'components',
        conditionalProperty: "componentType",
        conditionalValue: ["wdButton"],
        type: 'leaf',
        optional: false,
        defaultAdd: true, 
        unique: false,
        defaultValue: "true"
    },
    {
        propertyName: 'activeOnWMode',
        parentProperty: 'components',
        conditionalProperty: "componentType",
        conditionalValue: ["wdButton"],
        type: 'leaf',
        optional: false,
        defaultAdd: true, 
        unique: false,
        defaultValue: "true"
    },
    {
        propertyName: 'minHeight',
        parentProperty: 'components',
        conditionalProperty: "componentType",
        conditionalValue: ["wdSubForm"],
        type: 'leaf',
        optional: false,
        defaultAdd: true, 
        unique: false,
        defaultValue: '300px'
    },
    {
        propertyName: 'pagination',
        parentProperty: 'components',
        conditionalProperty: "componentType",
        conditionalValue: ["wdSubForm"],
        type: 'leaf',
        optional: false,
        defaultAdd: true, 
        unique: false,
        defaultValue: 'false'
    },
    {
        propertyName: 'entityName',
        parentProperty: 'components',
        conditionalProperty: "componentType",
        conditionalValue: ["wdSubForm"],
        type: 'leaf',
        optional: false,
        defaultAdd: true, 
        unique: false,
        defaultValue: 'entity_name'
    },
    {
        propertyName: 'subFields',
        parentProperty: 'components',
        conditionalProperty: "componentType",
        conditionalValue: ["wdSubForm"],
        type: 'array',
        optional: false,
        defaultAdd: true, 
        unique: false,
    },
    {
        propertyName: 'colId',
        parentProperty: 'subFields',
        type: 'leaf',
        optional: false,
        defaultAdd: true, 
        unique: true,
        defaultValue: 'col_id{index}'
    },
    {
        propertyName: 'sortable',
        parentProperty: 'subFields',
        type: 'leaf',
        optional: true,
        defaultAdd: true, 
        unique: false,
        defaultValue: 'false'
    },
    {
        propertyName: 'filter',
        parentProperty: 'subFields',
        type: 'leaf',
        optional: true,
        defaultAdd: true, 
        unique: false,
        defaultValue: 'false'
    },
    {
        propertyName: 'lockPinned',
        parentProperty: 'subFields',
        type: 'leaf',
        optional: true,
        defaultAdd: true, 
        unique: false,
        defaultValue: 'false'
    },
    {
        propertyName: 'flex',
        parentProperty: 'subFields',
        type: 'leaf',
        optional: true,
        defaultAdd: true, 
        unique: false,
        defaultValue: 1
    },
    {
        propertyName: 'minWidth',
        parentProperty: 'subFields',
        type: 'leaf',
        optional: true,
        defaultAdd: true, 
        unique: false,
        defaultValue: 150
    },
    {
        propertyName: 'cellRenderer',
        parentProperty: 'subFields',
        type: 'object',
        optional: false,
        defaultAdd: true, 
        unique: false
    },
    {
        propertyName: 'componentName',
        parentProperty: 'cellRenderer',
        type: 'leaf',
        optional: false,
        defaultAdd: true, 
        unique: true,
        defaultValue: 'component_name{index}'
    },
    {
        propertyName: 'label',
        parentProperty: 'cellRenderer',
        type: 'leaf',
        optional: false,
        defaultAdd: true, 
        unique: false,
        defaultValue: 'label'
    },
    {
        propertyName: 'fieldName',
        parentProperty: 'cellRenderer',
        type: 'leaf',
        optional: false,
        defaultAdd: true, 
        unique: false,
        defaultValue: 'fieldName'
    },
    {
        propertyName: 'componentType',
        parentProperty: 'cellRenderer',
        type: 'leaf',
        optional: false,
        defaultAdd: true, 
        unique: false,
        defaultValue: 'wdStringTextField'
    },
    {
        propertyName: 'componentType',
        parentProperty: 'cellRenderer',
        conditionalProperty: "componentType",
        conditionalValue: ["wdSubForm"],
        type: 'leaf',
        optional: false,
        defaultAdd: true, 
        unique: false,
        defaultValue: 'wdStringTextField'
    },
    {
        propertyName: 'multiSelect',
        parentProperty: 'cellRenderer',
        conditionalProperty: "componentType",
        conditionalValue: ["wdCombobox"],
        type: 'leaf',
        optional: true,
        defaultAdd: false, 
        unique: false,
        defaultValue: 'false'
    },
    {
        propertyName: 'externalDataInfo',
        parentProperty: 'cellRenderer',
        conditionalProperty: "componentType",
        conditionalValue: ["wdCombobox"],
        type: 'object',
        optional: false,
        defaultAdd: true, 
        unique: false,
    },
    {
        propertyName: 'apiCallInfo',
        parentProperty: 'externalDataInfo',
        type: 'object',
        optional: true,
        defaultAdd: true, 
        unique: false,
    },
    {
        propertyName: 'apiSuffix',
        parentProperty: 'apiCallInfo',
        type: 'leaf',
        optional: false,
        defaultAdd: true, 
        unique: false,
        defaultValue: 'endpoint'
    },
    {
        propertyName: 'descriptionField',
        parentProperty: 'apiCallInfo',
        type: 'leaf',
        optional: false,
        defaultAdd: true, 
        unique: false,
        defaultValue: 'description_field(s)'
    },
    {
        propertyName: 'foreignIdField',
        parentProperty: 'apiCallInfo',
        type: 'leaf',
        optional: false,
        defaultAdd: true, 
        unique: false,
        defaultValue: 'foreignIdField'
    },
    {
        propertyName: 'customList',
        parentProperty: 'externalDataInfo',
        type: 'array',
        optional: true,
        defaultAdd: false, 
        unique: false,
    },
    {
        propertyName: 'value',
        parentProperty: 'customList',
        type: 'leaf',
        optional: false,
        defaultAdd: true, 
        unique: false,
        defaultValue: 'value'
    },
    {
        propertyName: 'label',
        parentProperty: 'customList',
        type: 'leaf',
        optional: false,
        defaultAdd: true, 
        unique: false,
        defaultValue: 'label'
    },
    {
        propertyName: 'customListValueDisplayed',
        parentProperty: 'customList',
        type: 'leaf',
        optional: true,
        defaultAdd: false, 
        unique: false,
        defaultValue: 'false'
    },
    {
        propertyName: 'decimalplaces',
        parentProperty: 'cellRenderer',
        conditionalProperty: "componentType",
        conditionalValue: ["wdNumberTextField"],
        type: 'leaf',
        optional: false,
        defaultAdd: true, 
        unique: false,
        defaultValue: 2
    },
    {
        propertyName: 'action',
        parentProperty: 'cellRenderer',
        conditionalProperty: "componentType",
        conditionalValue: ["wdButton"],
        type: 'leaf',
        optional: false,
        defaultAdd: true, 
        unique: false,
        defaultValue: "actionName"
    },
    {
        propertyName: 'activeOnRMode',
        parentProperty: 'cellRenderer',
        conditionalProperty: "componentType",
        conditionalValue: ["wdButton"],
        type: 'leaf',
        optional: false,
        defaultAdd: true, 
        unique: false,
        defaultValue: "true"
    },
    {
        propertyName: 'activeOnWMode',
        parentProperty: 'cellRenderer',
        conditionalProperty: "componentType",
        conditionalValue: ["wdButton"],
        type: 'leaf',
        optional: false,
        defaultAdd: true, 
        unique: false,
        defaultValue: "true"
    },
]