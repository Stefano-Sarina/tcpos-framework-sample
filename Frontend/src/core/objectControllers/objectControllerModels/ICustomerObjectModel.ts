import type {CustomerEntityType, ICustomerPayload} from "../../apiModels/ICustomerPayload";
import type {EntityType, IEntityDataMainObject} from "@tcpos/common-core";

export interface ICustomerExtendedPayload extends ICustomerPayload {
    FullName: string; 
}

export type CustomerObjectDataType = [CustomerEntityType];

export type CustomerExtendedEntityType = EntityType<ICustomerExtendedPayload, "Customer">;

export type CustomerObjectExtendedDataType = [CustomerExtendedEntityType];

export type ICustomerObjectModel = IEntityDataMainObject<CustomerObjectExtendedDataType>;

export type CustomerObjectExternalDataType = [
];

