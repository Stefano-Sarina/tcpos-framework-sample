import type { EntityType, IEntityDataMainObject } from "@tcpos/common-core";
import type { IOrderDetailPayload, OrderDetailEntityType } from "../../apiModels/IOrderDetailPayload";
import type { IOrderPayload, OrderEntityType } from "../../apiModels/IOrderPayload";
import type { ProductEntityType } from "../../apiModels/IProductPayload";

export interface IOrderExtendedPayload extends IOrderPayload {
    Customer: string; 
}

export interface IOrderDetailExtendedPayload extends IOrderDetailPayload {
    Product: string; 
}

export type OrderExtendedEntityType = EntityType<IOrderExtendedPayload, "Order">;

export type OrderDetailExtendedEntityType = EntityType<IOrderDetailExtendedPayload, "OrderDetail">;

export type OrderObjectDataType = [OrderEntityType, ...Array<OrderDetailEntityType>];

export type OrderObjectExtendedDataType = [OrderExtendedEntityType, ...Array<OrderDetailExtendedEntityType>];

export type IOrderObjectModel = IEntityDataMainObject<OrderObjectExtendedDataType>;

export type OrderObjectExternalDataType = [
    OrderDetailEntityType, ProductEntityType
];