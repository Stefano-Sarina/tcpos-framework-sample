```ts
/**
 * Main menu state
 */
export interface MenuState {
    /**
     * Active item in the main menu (it can be used to highlighted a menu item when the related page is visualized)
     */
    openItem: string[],

    /**
     * True if the menuDrawer is open
     */
    drawerOpen: boolean,

}

```

The provided methods are the following:

```ts
        /**
         * Sets the menu active item
         */
        activeItem(state, action: PayloadAction<{ openItem: string[] }>) {
            state.openItem = action.payload.openItem;
        },

        /**
         * Sets the open status of menu drawer 
         */
        openDrawer(state, action: PayloadAction<{drawerOpen: boolean}>) {
            state.drawerOpen = action.payload.drawerOpen;
        },

```