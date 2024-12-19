#Step by step - How to create menus, views, pages, etc.

## Application and main menu configuration
The application configuration is defined by a json configuration file called configViewMenuGroups.json; it contains the following properties:
- loginConfiguration
    - simpleLogin: if true, show the classic username/password form
    - loginWithTcPos: if true, show the Login with TcPos button,
    - loginWithMicrosoft: if true, show the Login with Microsoft button,
    - loginWithGoogle: if true, show the Login with Google button
- apiUrl: Api call prefix,
- uiVersion: Version of UI (used to create a permission tree),
- defaultLang: default language code,
- applicationName: Name of the application,
- menuGroups: array of sidebar menu groups (described below)

### Menu configuration
The sidebar menu is composed by menu groups (just labels) containing the menu items for navigation. The menu groups are described by an array (property "menuGroups") as follows:

```
[
    {
      "id": "General", // Unique menu group id
      "label": "General", // Menu group label
      "entities": [ // Array of menu items
        {
          "entityId": "dashboard", // Unique menu item id
          "label": "Home", // Menu item label
          "icon": "home", // Menu item icon (one of mdi icons)
          "url": "/home", // It must be provided for custom pages; if not provided, the entityId is considered for navigation
          "active": true // If false, the menu item is not shown
        }
      ]
    },
    ...
```

## Routes
If there are custom pages, the corresponding coponents must be registered with the same name provided as id for the entity in the menu configuration, and they must be listed in the MainRoutes const (they should be wrapped by the PageWrapper component and, if applicable, by the AuthGuard component).

## Object models
The database tables should be mapped in local object models (src/core/apiModels); the payload interface mut extend the IPayloadBase interface. Also, a specific entityType should connect the payload with the table name. Example:

```ts
import type {EntityType, IPayloadBase} from "@tcpos/common-core";

export type CustomerEntityType = EntityType<ICustomerPayload, "Customers">;

export interface ICustomerPayload extends IPayloadBase {
    Id: number;
    FirstName: string | null;
    LastName: string | null;
}

```

## DataControllers
In the src/core/dataControllers folder there are a data controller for each model. The data controller must extend the CommonDataController class using as generic the entity type defined in the previous step. It must be decorated as @PublicInjectable to allow its registration. In the constructor, the base API controller must be injected.

```ts
@PublicInjectable()
export class CustomerDataController extends CommonDataController<CustomerEntityType> {

    constructor(
        @DailyPublicRegistrationContainer.inject(ABaseApiController) apiController: ABaseApiController
    ) {
        super(apiController);
    }

    init() {
        super.init('Customers');
    }

    async createNewEntity(initialData: ICustomerPayload | undefined, id?: number)
                                        : Promise<LogicResult<ICustomerPayload>> {
        return await super.createNewEntity({
                Id: id ?? -1,
                FirstName: "",
                LastName: "",

```

The _createNewEntity_ method allows creating an empty record (locally).

The _dateFields_ array contains the date type fields, for example:

```ts
    dateFields: (keyof IOrderPayload)[] = ['OrderDate'];
```

The _batchRefFields_ contains the foreign keys, for example:

```ts
    batchRefFields: (keyof IOrderDetailPayload)[]= [
        'OrderId',
        'ProductId',
    ];

```

## ObjectControllers
In the src/core/objectControllers folder there are the object controllers (one for each standard main menu item, i.e., one for each standard page). First of all, an object controller model must be defined, for example:
```ts
export type OrderObjectDataType = [OrderEntityType, ...Array<OrderDetailEntityType>];

export type IOrderObjectModel = IEntityDataMainObject<OrderObjectDataType>;

export type OrderObjectExternalDataType = [
    OrderDetailEntityType, ProductEntityType
];
```
The object data type should reproduce the database structure (in the example above, we have one record of Order type and an array of records of OrderDetail type). The object data type is used as generic for the IEntityDataMainObject class to define the Order Object model.

The external datatype is a type array containing the list models to use in the application.

The initial entityType can be based on an extended payload.

After the model definition an object controller class must be created.


## Registrations

Data controller and object controllers must be registered in src/core/registerCoreServices.

## Json object configuration

Grid view and detail view for each object should be defined in a json configuration file called (objectName)_interfaceBuilder.json.