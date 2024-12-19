/**
 * defines stats about the children of current node
 */
export interface IPermissionChildrenStats {
    /**
     * number of allowed children
     */
    allowed: number;
    /**
     * number of denied children
     */
    denied: number;
    /**
     * number of unset children
     */
    notSet: number;
    /**
     * total number of children
     */
    total: number;

}