import type {EntityType, IPayloadBase} from "@tcpos/common-core";


export type PermissionsCtesEntityType = EntityType<IPermissionsCtesPayload, "PermissionsCtes">;

export interface IPermissionsCtesPayload extends IPayloadBase {
    Id: number;
    ParentPermissionId: number;
    ParentKeyCode: string;
    ParentDescription: string;
    ParentEntity: string;
    ParentType: string;
    ParentSubType: string;
    PermissionId: number;
    KeyCode: string;
    Entity: string;
    Type: string;
    SubType: string;
    Description: string;
    Level: number;
    ImmediateParentId: number;
}
