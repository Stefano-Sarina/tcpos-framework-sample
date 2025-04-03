import type { ProductEntityType } from "../..//apiModels/IProductPayload";
import type {IEntityDataMainObject} from "@tcpos/common-core";

export type ProductObjectDataType = [ProductEntityType];

export type IProductObjectModel = IEntityDataMainObject<ProductObjectDataType>;

