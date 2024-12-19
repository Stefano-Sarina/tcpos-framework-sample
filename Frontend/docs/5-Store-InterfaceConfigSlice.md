# BackOffice Sample App store - InterfaceConfig slice


This slice contains UI configuration info according to the following interface:

```ts
/**
 * Interface configuration
 */
export interface InterfaceConfigState {
    /**
     * Login form configuration (login methods allowed)
     */
    loginConfiguration: ILoginConfiguration;

    /**
     * This object can be rendered as a list of main menu groups (typically, in a sidebar).
     * Each group has a unique id, a label, and a list of clickable menu items
     */
    menuGroups: IMenuGroupModel[];

    /**
     * Base url for API connection (all the API calls should be prefixed by this property)
     */
    apiUrl: string;

    /**
     * Useful for UI versioning (for example, it's possible to update the UI permission tree increasing this value)
     */
    uiVersion: string;

    /**
     * Default language code
     */
    defaultLang: I18n;

    /**
     * Application name
     */
    applicationName: string;

    /**
     * UI pages configuration
     */
    objectDetails?: IInterfaceBuilderModel[],

    /**
     * Info about binding between UI and data
     */
    componentBinding: IComponentBinding[],

    /**
     * True after the menu configuration has been loaded
     */
    menuLoaded: boolean
}
```

The provided methods are:

```ts
        /**
         * Saves the main menu configuration (tipically, the sidebar menu). The menuLoaded property is set to true
         */
        loadInterfaceMenu(state, action:PayloadAction<IMenuGroupModel[]>)

        /**
         * Saves the application configuration (loginConfiguration, apiUrl, uiVersion, defaultLang, applicationName).
         * The menuLoaded property is set to false
         */
        loadBaseConfiguration(state, action:PayloadAction<IViewConfigModel>)

        /**
         * Saves the grid view configuration for the UI objects
         */
        loadGridViewModel(state,
                            action: PayloadAction<{selectedEntity: string, dataViewConfig: IGridViewModel}>)

        /**
         * Saves the detail view configuration for the UI objects
         */
        loadInterfaceBuilder(state, action:PayloadAction<IInterfaceBuilderModel>)
        
        /**
         * Stores info about binding between UI and data
         */
        setInterfaceBinding(state, action: PayloadAction<IEditComponentBinding>)
        
        /**
         * Removes the interface binding info for a UI object
         */
        resetInterfaceBinding(state, action: PayloadAction<{objectName: string, objectId: string}>)
        
```
