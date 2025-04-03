import type {IEntityDataMainObject} from "@tcpos/common-core";
import type {GroupEntityType} from "../../apiModels/IGroupPayload";
import type {UserGroupEntityType} from "../../apiModels/IUserGroupPayload";

export type GroupObjectDataType = [GroupEntityType,
    ...Array<UserGroupEntityType>];

export type IGroupObjectModel = IEntityDataMainObject<GroupObjectDataType>;
