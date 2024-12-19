export class DataListGraphNode<T> {
    data: T;
    children: DataListGraphNode<T>[];
    parent: number | string | null;
    id: string | number;

    constructor({data, children = [], parent, id}: Omit<DataListGraphNode<T>, "children"> & {
        children?: DataListGraphNode<T>[]
    }) {
        this.data = data;
        this.children = children;
        this.parent = parent;
        this.id = id;
    }
}