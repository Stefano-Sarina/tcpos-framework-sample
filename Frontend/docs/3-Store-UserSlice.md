# BackOffice Sample App store - User slice

This slice contains user info according to the following interface

```ts
export interface UserState {
    /**
     * True if the user is logged
     */
    loggedIn: boolean

    /**
     * Useful to manage loading state in login form
     */
    loading: boolean

    /**
     * Useful to show login error messages in the login form 
     */
    loginErrors: LoginErrorModel|null

    /**
     * User name to show in the user profile
     */
    name: string

    /**
     * Generic user data (currently not used)
     */
    data: any

    /**
     * True after the user initialization is completed
     */
    initialized: boolean

    /**
     * Useful to redirect the user to a given url after a logout for expired session and new login
     */
    autoRedirect: {url: string, qstr: string}

    /**
     * True if the user manually logged out
     */
    manualLogout: boolean

    /**
     * User visibility access (currently not used)
     */
    visibilities: userVisibilities

    /**
     * User permission list (currently not used)
     */
    permissions: userPermission[]
}
```



The provided methods are:

```ts
        /**
         * Sets the initialized property
         */
        setInit(state, action: PayloadAction<boolean>) 
        /**
         * Sets login info: loggedIn, loginErrors, loading, name, initialized
         */
        setLogged(state, action: PayloadAction<{logged: boolean, name?: string}>) 
        /**
         * Sets the visibilities property
         */
        setVisibilities(state, action: PayloadAction<userVisibilities>) 
        /**
         * Sets the permissions property
         */
        setPermissions(state, action: PayloadAction<userPermission[]>) 
        /**
         * Sets the loginErrors property
         */
        setLoginErrors(state, action: PayloadAction<LoginErrorModel|null>) 
        /**
         * Sets the loading property
         */
        setLoading(state,action: PayloadAction<boolean>) 
        /**
         * Sets the user name property
         */
        setUserData(state, action: PayloadAction<any>) 
        /**
         * Sets the autoRedirect property
         */
        setAutoRedirect(state, action: PayloadAction<{ url: string, qstr: string }>)
        /**
         * Performs logout by resetting loggedIn, name, initialized; it also sets 
         * manualLogout to true
         */
        logout(state)
```

In the current implementation of BackOfficeSampleApp, the _setInit_, _setVisibilities_ and _setPermissions_ methods are not used.
