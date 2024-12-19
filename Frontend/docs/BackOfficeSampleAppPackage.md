# BackOffice Sample App package

The BackOffice Sample App application is a package which relies on the _backoffice-core_ and _backoffice-components_ packages;
the _backoffice-core_ package provides the logic to implement the binding with the API and other services, while the 
_backoffice-components_ package provides both unbound and bound components (the bound components rely in turn on the 
backoffice-core logic).

## Configuration
BackOffice is a React/Typescript project bundled with Webpack. The starting point is the _index.tsx_ file
which loads the _bootstrap.tsx_, which in turn renders the main component of the application: __WebDailyFullApp__. 
This component is simply a wrapper of the __App__ component.

## App component

This is the real starting point of the application; it provides all the needed wrappers, along with the __AppInner__ 
subcomponent.

## Internal objects

- __router__: this constant creates a __BrowserRouter__ (i.e. a new data router from _react-router_ version 6) used
to define the __RouterProvider__ wrapper component. It uses the _store_ provided by the _backoffice-core_ package

## Generic dependencies

- React
- react-redux

## Theme

The theme is customized according to [Mantis theme](https://mantisdashboard.io/). All needed components, hooks, contexts,
overrides are in a folder called __themeComponents__. The _ThemeCustomization_ function defines the base configuration
(light/dark mode, font, breakpoints, colors, etc.). The _useConfig_ hook is used to change these settings; this hook uses 
in turn the _useLocalStorage_ hook, so that the property changes are propagated to all the windows of the application.

The layout direction is also managed, but this property uses the _useLocaleConfig_ hook provided by the _backoffice-core_ 
package, and it is not stored in the local storage.

## Logic

## Router creation

The component defines a _router_ variable as result of the creation of a __BrowserRouter__ (i.e., a data router 
from _react-router_ version 6) used to define the __RouterProvider__ wrapper component. It uses the _store_ provided 
by the _backoffice-core_ package.

## Wrappers

The first wrapper component is __ConfigProvider__, i.e., the provider of theme config context. It provides some theme
properties and the methods to change them. It uses the local storage via the _useLocalStorage_ hook,
so that the property changes are propagated to all the windows of the application. This wrapper contains the previously 
described RouterProvider, which in turn contains the components defined in the __AppInner__ component. 

## AppInner component

When starting, this component loads a json file containing the main configuration; then, it provides the following
wrappers:
- ThemeCustomization wrapper: it defines the theme configuration
- RTLLayout wrapper: it manages the theme mode ('LTR' or 'RTL')
- DailyThemeOverrides wrapper: specific UI customization
- WD_Snackbar: component which provides a snackbar for the whole application
- WD_ErrorBoundary: application errors management
- Locales: provides localization
- ScrollTop component
Also, a Backdrop component provides a waiting state with a CircularProgress icon; then, the MenuGenerate component
provides the menu items to show and, at the end, there is a Routes component which manages the application routes.



