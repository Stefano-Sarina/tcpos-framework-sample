export type IBatchSavedReturnValue = number  | {
    error: string
    errorCode?: string
    errorDetails?: string
} | undefined;

export type IBatchSavedAllReturnValues = { commandId: number, entityKey: number }[] | {
    error: string
    errorCode?: string
    errorDetails?: string
} | undefined;
