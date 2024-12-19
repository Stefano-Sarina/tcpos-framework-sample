# BackOffice Sample App store - GridFilterSlice slice

This slice contains info about the filters used in the grid view. The main interface is an array of objects that satisfy the following interface:

```ts
/**
 * Filter state in grid view
 */
export interface GridFilterEntityState {
    /**
     * Entity (table) name
     */
    entity: string,

    /**
     * Last added node in the filter tree
     */
    lastAddedNode:(IDataFilterGroup | IDataFilter|null),

    /**
     * Modified and NOT applied filters
     */
    filters(IDataFilterGroup | IDataFilter)[],

    /**
     * Applied filters
     */
    appliedFilters(IDataFilterGroup | IDataFilter)[],

    /**
     * True when the user clears all filters
     */
    filtersCleared?: boolean,
}
```

The filters are stored in an array which represents a tree. Eacn element of the array can be an IDataFilterGroup (AND or OR) or an IDataFilter:

```ts
/**
 * Simple filter in a filter tree
 */
export interface IDataFilter {
    /**
     * Unique id in a filter tree
     */
    id: number,

    /**
     * Field name
     */
    field: string,

    /**
     * Filter operator
     */
    operator: IOperatorNames,

    /**
     * Values (there could be more than one value depending on the operator)
     */
    values: unknown[],

    /**
     * Associates a description to the values (for example, when the values are ids)
     */
    valuesDescription?: string,

    /**
     * Parent node in the filter tree (0 is the root)
     */
    parentId: number,

    /**
     * Node type: 'filter'
     */
    type: 'filter',

    /**
     * True if the filter is applied in the grid view "quick" filter //TODO refactoring
     */
    embedded?: boolean,

    /**
     * True if the filter is not editable from the normal UI filter interface
     */
    notEditable?: boolean,
}

/**
 * Filter group in a filter tree
 */
export interface IDataFilterGroup {
    /**
     * Unique id in a filter tree
     */
    id: number,

    /**
     * Filter group mode
     */
    mode: 'AND' | 'OR',

    /**
     * Parent node in the filter tree (0 is the root)
     */
    parentId: number,

    /**
     * Node type: 'filter'
     */
    type: 'filterGroup',

    /**
     * True if the filter is not editable from the normal UI filter interface
     */
    notEditable?: boolean,
}

```

The methods provided are:

```ts
        /**
         * For each entity, the first filter tree node must be a filter group; if there are no filter nodes,
         * an AND group is created
         * @param   {String} action.payload.entity  Name of the entity
         */
        addEntityFilterStore(state, action:PayloadAction<{entity: string}>)

        /**
         * Loads the received filter tree for the entity
         * @param   {String} action.payload.entity  Name of the entity
         * @param   {(IDataFilterGroup | IDataFilter)[]} action.payload.filters    Not applied filters tree
         * @param   {(IDataFilterGroup | IDataFilter)[]} action.payload.appliedFilters    Applied filters tree
         */
        buildGridFilterTreeStore(state, action: PayloadAction<GridFilterEntityState>)
        
        /**
         * Adds a filter to the tree
         * @param {String} action.payload.entity  Name of the entity
         * @param {Number} action.payload.parentId  Id of the parent node (filter group)
         * @param {IFilterOperators} action.payload.operator  Filter operator
         * @param {String} action.payload.field  Field name
         * @param {Any[]} action.payload.values  Values list
         */
        addGridFilterStore(state, action: PayloadAction<IFilterEditAction>)
        
        /**
         * Changes a filter
         * @param {String} action.payload.entity  Name of the entity
         * @param {Number} action.payload.id  Id of the changed node
         * @param {Number} action.payload.parentId  Id of the parent node (filter group)
         * @param {IFilterOperators} action.payload.operator  Filter operator
         * @param {String} action.payload.field  Field name
         * @param {Any[]} action.payload.values  Values list
         */
        editGridFilterStore(state, action: PayloadAction<IFilterEditAction>)

        /**
         * Adds a filter group
         * @param {String} action.payload.entity  Name of the entity
         * @param {Number} action.payload.parentId  Id of the parent node (filter group)
         * @param {'AND' | 'OR'} action.payload.mode  Filter group operator
         */
        addGridFilterGroupStore(state, action: PayloadAction<IFilterGroupEditAction>)
        
        /**
         * Changes a filter group
         * @param {String} action.payload.entity  Name of the entity
         * @param {Number} action.payload.id  Id of the changed node
         * @param {Number} action.payload.parentId  Id of the parent node (filter group)
         * @param {'AND' | 'OR'} action.payload.mode  Filter group operator
         */
        editGridFilterGroupStore(state, action: PayloadAction<IFilterGroupEditAction>)
        
        /**
         * Deletes a filter node or a filter group node (with its children)
         * @param {String} action.payload.entity  Name of the entity
         * @param {Number} action.payload.id  Id of the deleted node
         */
        deleteGridFilterStore(state, action: PayloadAction<{entity: string, id: number}>)

        /**
         * Removes all the filters
         * @param {String} action.payload.entity  Name of the entity
         */
        clearGridFilterStore(state, action: PayloadAction<{entity: string}>)
        
        /**
         * Resets the filtersCleared var
         * @param {String} action.payload.entity  Name of the entity
         */
        updateGridFilterStoreClearStatus(state, action: PayloadAction<{entity: string, clear: boolean}>)
        
        /**
         * Removes the temporary filters and resets filters to the last applied ones
         * @param {String} action.payload.entity  Name of the entity
         */
        clearTempGridFilterStore(state, action: PayloadAction<{entity: string}>)

```