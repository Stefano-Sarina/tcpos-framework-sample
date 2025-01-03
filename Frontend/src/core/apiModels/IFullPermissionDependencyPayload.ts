import type {EntityType, IPayloadBase} from "@tcpos/common-core";


export type FullPermissionDependencyEntityType = EntityType<IFullPermissionDependencyPayload, "FullPermissionDependency">;

export interface IFullPermissionDependencyPayload extends IPayloadBase {
    Id: number;
    ChildPermissionId: number | null; // Mandatory
    ChildPermissionName: string | null; // Mandatory
    ParentPermissionId: number | null; // Mandatory
    ParentPermissionName: string | null; // Mandatory
    Level: number | null; // Mandatory
}
