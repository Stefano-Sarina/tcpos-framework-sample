interface IUiTree {     
    nodeId: number     
    parentNodeId: number     
    component: string     
    description: string     
    parent: string     
    type: "MainForm" | "Group" | "Section" | "ListComponent" | "SubForm"     
    api?: {         
        entity: string         
        url?: string         
        verb?: "Read" | "Write" | "All"     
    }[] 
}