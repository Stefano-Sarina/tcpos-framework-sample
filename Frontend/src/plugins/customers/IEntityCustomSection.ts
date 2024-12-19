import type {IFieldViewModel} from "@tcpos/common-core";

export interface IEntityCustomSection {
    name: string,
    groupName: string,
    label?: string,
    index?: number,
    xs?: number,
    sm?: number,
    md?: number,
    lg?: number,
    xl?: number;
    pt?: string;
    pl?: string;
    pr?: string;
    pb?: string;
    fields?: IFieldViewModel[],
    component?: string
}