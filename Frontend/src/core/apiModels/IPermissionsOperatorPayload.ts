import type {EntityType, IPayloadBase} from "@tcpos/common-core";


export type PermissionsOperatorEntityType = EntityType<IPermissionsOperatorPayload, "PermissionsOperator">;

export interface IPermissionsOperatorPayload extends IPayloadBase {
    Id: number;
    OperatorId: number | null; // Mandatory
    OperatorCode: string | null; // Mandatory
    OperatorGroupId: number | null; // Mandatory
    OperatorGroupCode: string | null; // Mandatory
    PermissionId: number | null; // Mandatory
    PermissionName: string | null; // Mandatory
    PermissionValue: number | null; // Mandatory
}
