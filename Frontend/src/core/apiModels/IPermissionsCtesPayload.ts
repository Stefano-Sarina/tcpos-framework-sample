import type {EntityType, IPayloadBase} from "@tcpos/common-core";


export type PermissionsCtesEntityType = EntityType<IPermissionsCtesPayload, "PermissionsCtes">;

export interface IPermissionsCtesPayload extends IPayloadBase {
    Id: number;
    ChildPermissionId: number | null; // Mandatory
    ChildPermissionName: string | null; // Mandatory
    ChildPermissionType: number | null; // Mandatory
    ParentPermissionId: number | null; // Mandatory
    ParentPermissionName: string | null; // Mandatory
    ParentPermissionType: number | null; // Mandatory
    Level: number | null; // Mandatory
}
