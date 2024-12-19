import type {EntityType,IPayloadBase} from "@tcpos/common-core";


export type GroupEntityType = EntityType<IGroupPayload, "Groups">;

export interface IGroupPayload  extends IPayloadBase {
    Id: number
    Code: string | null // mandatory
    Description: string | null // mandatory
}

