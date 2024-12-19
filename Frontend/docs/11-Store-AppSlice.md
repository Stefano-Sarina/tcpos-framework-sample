# BackOffice Sample App store - GridFilterSlice slice

This slice contains info about generic application state according to the following interface:

```ts
/**
 * Generic application state info
 */
export interface AppState {
    /**
     * True if there are unsaved changes in the UI
     */
    dirtyData: boolean,

    /**
     * Used to avoid page change or browser closing in case of dirtyData: 'blocked' | 'unblocked' | 'proceeding'
     */
    navigationBlockerStatus: NavigationBlockerStatusType,

    /**
     * Specific data used by custom pages
     */
    pluginsData?: {pluginName: string, data: Record<string, unknown>}[]
}

```

The provided methods are the following:

```ts
        /**
         * Sets the dirtyData property
         */
        setDirtyData(state: AppState, action: PayloadAction<boolean>)

        /**
         * Sets the navigationBlockerStatus property
         */
        setNavigationBlockerStatus(state: AppState, action: PayloadAction<NavigationBlockerStatusType>)

        /**
         * Sets custom data for a plugin
         */
        setPluginsData(state: AppState, action: PayloadAction<{pluginName: string, data: Record<string, unknown>}>)

```
