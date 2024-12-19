# BackOffice Sample App store - UIState slice

This slice contains info about the UI state according to the following interface:

```ts
/**
 * UI state data
 */
export interface IUiStateSlice {
    /**
     * Name of the visualized object
     */
    entityName: string

    /**
     * Visibility status of components
     */
    visibilities: {componentName: string, visible: boolean}[]

    /**
     * Stores the last ordered list of field indexes shown in the grid view separated by ","
     * This property and the following ones cna be used to restore the last settings in the grid view
     * after a page change
     */
    lastVisibleFields: string

    /**
     * Stores the last language
     */
    lastLang: string

    /**
     * Stores the last filter in the grid view
     */
    lastFilter: string

    /**
     * Stores the last field sorting in the grid view
     */
    lastSorting: string

    /**
     * Stores the last page viewed in the grid view
     */
    lastPage: number

    /**
     * Stores the last rows per page setting in the grid view
     */
    lastRowsPerPage: number
}
```

The provided methods are the following:

```ts
        /**
         * Adds an empty UI state of a page 
         */
        addUiState(state: IUiStateSlice[], action: PayloadAction<{entityName: string}>)

        /**
         * Sets UI state visibilities 
         */
        setUiStateVisibilities(state:IUiStateSlice[], action: PayloadAction<{
            entityName: string, visibilities: {componentName: string, visible: boolean}[]
        }>)

        /**
         * Sets the grid view parameters 
         */
        setUiStateSearchParameters(state: IUiStateSlice[], action: PayloadAction<{
            entityName: string, lastVisibleFields: string, lastLang: string, lastFilter: string, lastSorting: string,
            lastPage: number, lastRowsPerPage: number
        }>)
```