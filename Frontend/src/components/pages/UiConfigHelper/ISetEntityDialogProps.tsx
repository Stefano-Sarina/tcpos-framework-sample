export interface ISetEntityDialogProps {
    open: boolean,
    title: string,
    message: string,
    error: string,
    label: string,
    onOk: (value: string, id: string | number, addSubFields?: boolean) => void,
    onCancel: () => void,
    onTextChanged: () => void,
    subFormEntity: boolean,
    nodeId: number | string,
    entityList: string[]
}