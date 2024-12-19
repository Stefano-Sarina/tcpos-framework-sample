# BackOffice Sample App store - DataObject slice

This slice contains the local data used by the application. It is very important because it contains all the info for data binding.

## Data interface

The interface is the following:

```ts
/**
 * Data store
 */
export interface EntityDataContextState<PAYLOADS extends EntityType[] = EntityType[], > {
    /**
     * Data objects
     */
    objects: IEntityDataMainObject<PAYLOADS>[];
    
    /**
     * Used when translationmode is set to global.
     * this is the shared dictionary
     */
    globalTranslations:IGlobalTranslationData[];

}
```

The main property is the _objects_ property, which is an array of application objects. An object is a set of data that are related with themselves. 

The _IEntityDataMainObject_ interface contains all the info of an object:

```ts
/**
 * Object data
 */
export interface IEntityDataMainObject<PAYLOADS extends EntityType[] = EntityType[], > extends IEntityMainObjectIds {
    /**
     * Current data; in general, there are different entities (sub-objects) corresponding to different db tables.
     * Each modified entity matches an entry in the objectDataRowStatuses array
     */
    objectData: IEntityDataObject<PAYLOADS[number]['payload'],  PAYLOADS[number]['name']>[];
    
    /**
     * Initial data
     */
    originalData?: IEditHistory<IEntityDataObject<PAYLOADS[number]['payload'],  PAYLOADS[number]['name']>[], IEntityDataObjectRowStatuses<PAYLOADS[number]['name']>[]>;
    
    /**
     * Validation errors (for each entity)
     */
    objectDataErrors: IEntityDataObjectErrors<PAYLOADS[number]['payload'],  PAYLOADS[number]['name']>[];
    
    /**
     * Entity status (each entity is a row in the database): untouched, added, modified, deleted
     */
    objectDataRowStatuses: IEntityDataObjectRowStatuses<PAYLOADS[number]['name']>[];
    
    /**
     * Translations of values
     */
    objectTranslations: IFieldBasedTranslationEntry<PAYLOADS[number]['payload'],  PAYLOADS[number]['name']>[];
    
    /**
     * History of data changes
     */
    editHistory?: IEditHistory<IEntityDataObject<PAYLOADS[number]['payload'],  PAYLOADS[number]['name']>[], IEntityDataObjectRowStatuses<PAYLOADS[number]['name']>[]>[];
    
    /**
     * The editPointer property indicates the current history version (it allows to manage Undo/Redo operations)
     */
    editPointer?: number;
    
    /**
     * Last edited field (for fields navigation purposes)
     */
    lastEditedField?: string; // entityName.entityId.fieldName
    
    /**
     * Last focused field (for fields navigation purposes)
     */
    lastFocusedFieldId?: string;
    
    /**
     * Data lists used for this object (used to fill the combo boxes options)
     */
    lists: IEntityExternalList[];
    
    /**
     * Other attributes (e.g. conflict management)
     */
    additionalAttributes?: IEntityDataObjectAdditionalAttributes[];
    
    /**
     * MultiEditing id: object with the same multiEditingId are being edited at the same time
     */
    multiEditingId?: number,
    
    /**
     * rwMode: can be Read or Write
     */
    rwMode?: rwModes
    
    /**
     * Permissions on specific components
     */
    componentPermissions?: {componentName: string, access: 'NoAccess' | 'Read' | 'Write' | 'NotSet' }[]
}
```

Based on this interface, the following section provides an example. 

## Structure of an application object - Example
Suppose that the application contains an Orders page with an order header and some order rows, as well as the possibility to update some customer data, for example the billing info. Also, suppose that in each order row the user can pick an article from a list implemented by a combobox (for simplicity, we'll suppose that the whole list of articles is extracted from an API call). This is an application object. Since each object is identified by a name and an id, in this case we have an object called "order", and its id is the id of the order in the database _Orders_ table; in case of a new order, we assume that the id is negative (-1). This object manages different kinds of data; referring to a possible database structure, we have:

- One record related to the _Orders_ table, which can be considered the main row (indeed, it provides the id of the whole object)
- Some records related to the _OrderRows_ table
- One record related to the _Customers_ table
- A list of data coming from the _Articles_ table

This means that the object we are describing will manage data from four tables; however, in the first three cases the application can insert, update or delete the rows, while in last case we are just talking about a static extracted list.

In the application store, this situation is described by several _entities_, all of them identified by a name and an id:
- One entity named _Orders_ with an id equal to the order id
- One entity for each order row; all of these entities are named "OrderRows" and their id is the related primary key
- A _Customers_ entity

Each entity will also contain the data of its record.

The _lists_ property of the object will contain the article list.

The store _objects_ array will contain one element with this data:

```js
{
    objectName: "order",
    objectId: "125",
    objectData: [
        {
            entityName: "Orders",
            entityId: "125",
            data: {
                Id: 125,
                Date: "2024-08-01",
                ...
            }
        },
        {
            entityName: "OrderRows",
            entityId: "1",
            data: {
                Id: 1,
                ArticleId: 5,
                Price: 5.00,
                ...
            }

        },
        {
            entityName: "OrderRows",
            entityId: "-1",
            data: {
                Id: -1,
                ArticleId: 9,
                Price: 13.00,
                ...
            }
        },
        {
            entityName: "Customers",
            entityId: "34",
            data: {
                Id: 34,
                Name: "John Smith",
                ...
            }
        }
    ],
    originalData: {
        objectData: // Initial copy of the whole object
    },
    objectDataRowStatuses: [
        {
            entityName: "Orders",
            entityId: "125",
            status: "Untouched"
        },
        {
            entityName: "OrderRows",
            entityId: "1",
            status: "Modified"
        },
        {
            entityName: "OrderRows",
            entityId: "-1",
            status: "Added"
        }
    ],
    lists: [
        {
            name: "Article_List",
            generalName: "ArticleList",
            data: [
                {
                    value: 1,
                    label: "Article 1 description"
                },
                {
                    value: 2,
                    label: "Article 2 description"
                },
                ...
            ]
        }
    ],
    objectDataErrors: [
        {
            entityName: "Orders",
            entityId: "125",
            dataErrors: [
                fieldName: "Code",
                error: [
                    {key: "Length must be lesser than 10"},
                    {key: "Must begin with 'A'"}
                ]
            ]
        }, 
        ...
    ],
    editHistory: [
        // One copy of the whole object for each data change
    ],
    additionalAttributes: [
        {
            attributeName: "detailViewOfArticle"
            entities: [
                {
                    entityName: "OrderRows",
                    entityId: "1",
                    entityAttributes: [
                        {fieldName: 'fake', value: true}
                    ]
                },
                {
                    entityName: "OrderRows",
                    entityId: "2",
                    entityAttributes: [
                        {fieldName: 'fake', value: false}
                    ]
                }
            ]
        }
    ],
    rwMode: "Write",
    componentPermssions: [
        {componentName: "order", access: "Write"},
        ...
    ]

}
```

## Structure of an application object - Last considerations

From the example above, we can say that, in a standard situation:

- An application object is rendered by an application page
- Each database record whose data can be modified is stored as an entity whose name is the table name and whose id is the primary key of the row
- The _originalData_ property can be used to compare the final data with the initial one (useful in case of conflicts: it is possible to show the original data, the local final data and the remotely modified data)
- The _objectDataRowStatuses_ tracks the status of all the rows
- The _objectDataErrors_ property is used to render error messages
- The _editHistory_ property allows the implementation of Undo and Redo methods
- The _additionalAttributes_ property allows saving non standard data. It is used for example to manage conflict states
- The _rwMode_ property inform that the page is in Read or Write mode

## Methods provided

The provided methods for this slice are:

```ts
        /**
         * Creates an object (it can be an empty object, or it can contain data). If an object with the same name and id
         * exists in the store, it is replaced.
         */
        setNewObject(state: EntityDataContextState, action: PayloadAction<IEntityDataMainObject>)

        /**
         * Removes an object from the store
         */
        resetObject(state, action: PayloadAction<{objectName: string, objectId: string}[]>)

        /**
         * Creates an object for multiediting (multiple object edit at the same time). All the object that already
         * exist in the store are removed
         */
        setMultipleObject(state, action: PayloadAction<IEntityDataMainObject>)

        /**
         * Creates a new entity (table row) in an object. This operation is added to the history.
         */
        setNewEntity(state, action: PayloadAction<ISetNewEntity>)

        /**
         * Sets the data and the other client-defined attributes for the object
         */
        setObjectDataAndAttributes(state, action: PayloadAction<ISetObjectDataAndAttributes>)

        /**
         * Sets the data of the object. This operation is added to the history.
         */
        setObjectData(state, action: PayloadAction<ISetObjectData>)

        /**
         * Sets the object lists (used for example by combo box components). This operation is added to the history.
         */
        setLists(state, action: PayloadAction<ISetExternalLists>)

        /**
         * Sets a single list of the object (it can be used for example in case of dynamic lists).
         */
        setSingleList(state, action: PayloadAction<ISetSingleList>)

        /**
         * Sets the value of a field. This operation is added to the history.
         */
        setFieldValue(state, action: PayloadAction<ISetFieldValue>)

        /**
         * Updates the error list for an entity
         */
        setErrorList(state, action: PayloadAction<ISetObjectErrorList>)

        /**
         * Updates the error list for an object
         */
        setObjectDataErrors(state, action: PayloadAction<ISetObjectDataErrors>)

        /**
         * Sets client-defined attributes for the object
         */
        setObjectAdditionalAttributes(state, action: PayloadAction<ISetObjectDataAdditionalAttributes>)

        /**
         * Removes client-defined attributes for the object
         */
        resetObjectAdditionalAttributes(state, action: PayloadAction<IResetObjectDataAdditionalAttributes>)

        /**
         * Sets the status of an entity (table row): Added, Modified, Deleted, Untouched. This operation is added to the history.
         */
        setObjectDataRowStatuses(state, action: PayloadAction<ISetObjectDataRowStatuses>)

        /**
         * Remove an entity (table row). This operation is added to the history.
         */
        deleteEntity(state, action: PayloadAction<IDeleteEntity>)

        /**
         * Sets object translations
         */
        setObjectTranslations(state: WritableDraft<EntityDataContextState<EntityType<Record<string, unknown>>[]>>,
                                action: PayloadAction<ISetFieldBasedObjectTranslations>)

        /**
         * Performs an Undo operation (the previous status in the history is restored)
         */
        undo(state, action: PayloadAction<ISetUndoRedo>)

        /**
         * Performs a Redo operation (the next status in the history is restored)
         */
        redo(state, action: PayloadAction<ISetUndoRedo>)

        /**
         * Sets all the property of an object only if it already exists
         */
        setObject(state, action: PayloadAction<IEntityDataMainObject>)

        /**
         * Stores the id of the last focused component in the UI
         */
        setLastFocusedComponent(state,
                                  action: PayloadAction<{objectName: string, objectId: string, componentId: string}>)

        /**
         * Sets translations of data in a field
         */
        addUpdateTranslationFieldBased(state: WritableDraft<EntityDataContextState<EntityType<Record<string, unknown>>[]>>,
                                         action: PayloadAction<IAddUpdateFieldBasedTranslation>)

        /**
         * Sets permissions for components
         */
        setComponentPermissions(state, action: PayloadAction<ISetComponentPermissions>)

        /**
         * Sets global translations
         */
        addUpdateTranslationGlobal(state, action: PayloadAction<IAddUpdateGlobalTranslation>)

```