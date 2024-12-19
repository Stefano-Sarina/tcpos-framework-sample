import type {EntityType, IPayloadBase} from "@tcpos/common-core";


export type UserPermissionEntityType = EntityType<IUserPermissionPayload, "UserPermission">;

export interface IUserPermissionPayload extends IPayloadBase {
    Id: number;
    UserId: number | null; // Mandatory
    PermissionId: number | null; // Mandatory
    PermissionValue: number | null; // Mandatory
}
