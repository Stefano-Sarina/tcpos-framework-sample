# BackOffice Sample App store

## The store
The application uses a centralized store which contains info about application status, interface status, local data for binding, etc. It is available for all the components and it must be imported from the backoffice-core library. It is possible to add other independent stores to the application, adding a new provider to the App component.

## Store structure
The structure of the store includes the following store slices:

- [user](3-Store-UserSlice.md)
- [config](4-Store-ConfigSlice.md)
- [interfaceConfig](5-Store-InterfaceConfigSlice.md)
- [dataConfig](6-Store-DataConfigSlice.md)
- [dataObjectSlice](7-Store-DataObjectSlice.md)
- [uiState](8-Store-UIStateSlice.md)
- [loadingState](9-Store-LoadingStateSlice.md)
- [gridFilterSlice](10-Store-GridFilterSlice.md)
- [appState](11-Store-AppSlice.md)
- menuState
- menu
- pluginsConfig

