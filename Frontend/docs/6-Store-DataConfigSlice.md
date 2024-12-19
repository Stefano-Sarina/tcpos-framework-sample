# BackOffice Sample App store - DataConfig slice

This slice contains JSON data schemas for the managed data type (entities) according 
to the following interface:

```ts
/**
 * Data structure
 */
export interface IModelDataStructure {
    /**
     * Table name
     */
    datatype: string;

    /**
     * JSON schema
     */
    schema?: Record<string, any>;
}
```

The provided method is:

```ts
/**
 * Saves the JSON schema model of a table 
 */
loadDataModel(state:IModelDataStructure[], action:PayloadAction<IModelDataStructure[]>)
```

The JSON schema is used for base validation of payloads.
