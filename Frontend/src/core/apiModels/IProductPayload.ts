import type { EntityType ,IPayloadBase} from "@tcpos/common-core";


export type ProductEntityType = EntityType<IProductPayload, "Product">;

export interface IProductPayload extends IPayloadBase {
    Id: number
    Name: string | null // Mandatory
    Price: number | null // Mandatory
}

