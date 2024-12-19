import type {EntityType,IPayloadBase} from "@tcpos/common-core";

export type UserGroupEntityType = EntityType<IUserGroupPayload, "UserGroup">;

export interface IUserGroupPayload  extends IPayloadBase {
    Id: number
    UserId: number | null // mandatory
    GroupId: number | null // mandatory
}

