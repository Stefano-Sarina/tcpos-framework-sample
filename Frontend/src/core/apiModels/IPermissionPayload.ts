import type {EntityType, IPayloadBase} from "@tcpos/common-core";


export type PermissionEntityType = EntityType<IPermissionPayload, "Permission">;

export interface IPermissionPayload extends IPayloadBase {
    Id: number;
    PermissionName: string | null; // Mandatory
    PermissionType: number | null; // Mandatory
}
