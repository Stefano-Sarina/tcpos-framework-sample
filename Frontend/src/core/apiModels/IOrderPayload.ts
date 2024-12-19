import type {EntityType,IPayloadBase} from "@tcpos/common-core";


export type OrderEntityType = EntityType<IOrderPayload, "Order">;

export interface IOrderPayload  extends IPayloadBase {
    Id: number
    OrderDate: string | null // mandatory
    Notes: string | null 
    CustomerId: number | null
}

