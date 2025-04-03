import type {EntityType,IPayloadBase} from "@tcpos/common-core";


export type GroupEntityType = EntityType<IGroupPayload, "Group">;

export interface IGroupPayload  extends IPayloadBase {
    Id: number
    GroupName: string | null // mandatory
}

