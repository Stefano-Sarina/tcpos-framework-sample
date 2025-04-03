export interface ITreeElementProperties {
    key: string,
    defaultAdd?: boolean,
    defaultValue?: string | number | boolean | null,
    defaultObjectValue?: Record<string, unknown>,
    propertyIsArray?: boolean,
    propertyIsObject?: boolean,
    removable?: boolean,
}