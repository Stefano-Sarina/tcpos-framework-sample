export type JsonTreeActionType =
        'addGroup'
        | 'addSection'
        | 'addComponent'
        | 'addSubForm'
        | 'addComponentFromField'
        | 'addProperty'
        | 'setEntityName'
        | 'removeTreeElement'
        | 'reorderArray'
        | 'locateComponent'
        | 'onTextChange'
        | 'onChangeEditMode'
        | 'addExternalDataInfoProperty'
        | 'addExternalDataInfoSubProperty'
        | 'addApiCallInfoProperty'
        | 'addCustomListProperty'
        | 'addCustomListElement';

export interface IJsonTreeActions {
    action: JsonTreeActionType | undefined;
    params: any;
    active: boolean;
}