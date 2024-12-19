# BackOffice Sample App store - Config slice

This slice contains config info according to the following interface

```ts
export interface ConfigState {
    /**
     * True after the locale file has been loaded
     */
    localeLoaded: boolean,

    /**
     * Contains the lang property, which must be one of the available languages
     */
    languageInfo: StoreLanguageModel,

    /**
     * Current layout direction: 'ltr' or 'rtl'
     */
    layoutDirection: LayoutDirection,
}
```

The provided methods are:

```ts
        /**
         * Sets current language info: language code (lang) and direction 
         * (layoutDirection)
         */
        setLanguageInfo(state, action: PayloadAction<{ lang: I18n, direction?: LayoutDirection }>)

        /**
         * Sets the localeLoaded property
         */
        setLocaleLoaded(state, action: PayloadAction<boolean>)
```

The _setLocaleLoaded_ method is important because it should be avoided to load the application before the locale has been completely loaded. Both the main App component and the AuthLogin.tsx form currently check this property to avoid a call to the _changeLanguage_ method before the locale initialization.
