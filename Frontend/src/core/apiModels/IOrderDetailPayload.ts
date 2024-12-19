import type {EntityType,IPayloadBase} from "@tcpos/common-core";

export type OrderDetailEntityType = EntityType<IOrderDetailPayload, "OrderDetail">;

export interface IOrderDetailPayload  extends IPayloadBase {
    Id: number
    OrderId: number | null // mandatory
    ProductId: number | null // mandatory
    Quantity: number | null // mandatory
}

