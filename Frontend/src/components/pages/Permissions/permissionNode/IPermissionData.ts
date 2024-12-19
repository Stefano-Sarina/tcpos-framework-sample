import type {ITreeData} from "@tcpos/backoffice-components";
import type {PermissionState} from "./PermissionState";
//.
/**
 * this is the data of a permission node
 */
export interface IPermissionData extends ITreeData {
    /**
     * the status of the current node
     */
    nodeStatus?: PermissionState;

    permissionID:number|null;
}