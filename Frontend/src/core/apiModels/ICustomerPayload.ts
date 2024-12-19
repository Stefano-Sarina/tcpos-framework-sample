import type {EntityType, IPayloadBase} from "@tcpos/common-core";

export type CustomerEntityType = EntityType<ICustomerPayload, "Customer">;

export interface ICustomerPayload extends IPayloadBase {
    Id: number;
    FirstName: string | null;
    LastName: string | null;
}
