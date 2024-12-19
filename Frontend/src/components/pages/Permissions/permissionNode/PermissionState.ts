import {defineMessages, type MessageDescriptor} from "react-intl";

/**
 * define the various statuses that a permission node can have
 */
export enum PermissionState {
    NOT_SET = "NotSet",
    ALLOWED = "Allowed",
    DENIED = "Denied",
}


defineMessages<PermissionState, MessageDescriptor>({
    [PermissionState.NOT_SET]: {
        id: "NotSet",
    },
    [PermissionState.ALLOWED]: {
        id: "Allowed",
    },
    [PermissionState.DENIED]: {
        id: "Denied",
    },
});