# BackOffice Sample App store - LoadingState slice

This slice contains info about the initial loading state of the application according to the following interface:

```ts
/**
 * Application loading state
 */
export interface ILoadingStateSlice {
    /**
     * step to accomplish
     */
    step: string

    /**
     * Completion status
     */
    completed: boolean
}
```

Currently, the following steps are considered: 'jsonConfigFiles', 'registrations', 'pluginRegistrations'.

The provided method is the following:

```ts
        /**
         * Sets completion status of an application loading step
         */
        setLoadingStateCompleted(state: ILoadingStateSlice[], action: PayloadAction<{step: string}>)

```
