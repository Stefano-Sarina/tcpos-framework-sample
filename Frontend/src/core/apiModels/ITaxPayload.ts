import type {EntityType, IPayloadBase} from "@tcpos/common-core";

export type TaxEntityType = EntityType<ITaxPayload, "Tax">;

export interface ITaxPayload extends IPayloadBase {
    Id: number;
    Code: string | null;
    Description: string | null;
    Tax: number | null;
}
