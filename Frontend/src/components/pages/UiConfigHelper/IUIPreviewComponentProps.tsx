export interface IUIPreviewComponentProps {
    json: any
    containerWidth?: number
    classes?: {
        gridItem?: string,
        detailView?: { gridContainer?: string },
    }
    isInMainWindow: boolean
    onOpenInNewWindowClick?: () => void
    objectName?: string
    tabsValue: number
    handleTabsValueChange: (newValue: number) => void
}

export interface IUIPreviewComponentWrapperProps extends IUIPreviewComponentProps {
    error: string
}