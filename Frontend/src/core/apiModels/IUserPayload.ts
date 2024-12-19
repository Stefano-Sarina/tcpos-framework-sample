import type {EntityType,IPayloadBase} from "@tcpos/common-core";

export type UserEntityType = EntityType<IUserPayload, "User">;

export interface IUserPayload  extends IPayloadBase {
    Id: number
    UserName: number | null // mandatory
    Password: number | null // mandatory
}

