import type {EntityType, IPayloadBase} from "@tcpos/common-core";


export type PrmOperatorPermAssocEntityType = EntityType<IPrmOperatorPermAssocPayload, "PrmOperatorPermAssocs">;

export interface IPrmOperatorPermAssocPayload extends IPayloadBase {
    Id: number;
    OperatorId: number | null; // Mandatory
    PermissionId: number | null; // Mandatory
    PermissionValue: number | null; // Mandatory
}
