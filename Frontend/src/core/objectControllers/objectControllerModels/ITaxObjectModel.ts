import type { TaxEntityType } from "../../apiModels/ITaxPayload";
import type {IEntityDataMainObject} from "@tcpos/common-core";

export type TaxObjectDataType = [TaxEntityType];

export type ITaxObjectModel = IEntityDataMainObject<TaxObjectDataType>;

export type TaxObjectExternalDataType = [
];

