import type {EntityType, IPayloadBase} from "@tcpos/common-core";


export type GroupPermissionEntityType = EntityType<IGroupPermissionPayload, "GroupPermission">;

export interface IGroupPermissionPayload extends IPayloadBase {
    Id: number;
    GroupId: number | null; // Mandatory
    PermissionId: number | null; // Mandatory
    PermissionValue: number | null; // Mandatory
}
