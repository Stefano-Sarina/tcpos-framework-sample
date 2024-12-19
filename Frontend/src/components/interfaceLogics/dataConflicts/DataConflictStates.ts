export enum DataConflictStoreEntities {
    AutoMerges = "AUTO_MERGES",
    AutoMergesOriginalValues = "AUTO_MERGES_ORIGINAL_VALUES",
    OriginalValuesBeforeAutMergeShown = "ORIGINAL_VALUE_BEFORE_AUTO_MERGE_SHOWN",
    AutoMergesState = "AUTO_MERGES_STATE",
    Conflicts = "CONFLICTS",
    ConflictsState = "CONFLICTS_STATE",
    OnSaveErrors = "ON_SAVE_ERRORS",
    OnSaveErrorsState = "ON_SAVE_ERRORS_STATE"
}

export enum DataConflictAutoMergesStates {
    AutoMergesApplying = "AUTO_MERGES_APPLYING", // Conflicts that can be automatically solved were detected
    AutoMergesApplied = "AUTO_MERGES_APPLIED", // Automatic modifications were applied
    AutoMergesSaved = "AUTO_MERGES_SAVED", // It was possible to save the automatically applied modifications
    AutoMergesSaveErrors = "AUTO_MERGES_SAVE_ERRORS", // There were errors trying to save the automatically applied modifications
    AutoMergesReload = 'AUTO_MERGES_RELOAD' // Data reloaded after automatic modifications are saved
}

export enum DataConflictConflictsStates {
    ConflictsDetected = "CONFLICTS_DETECTED",
    ConflictsShouldBeResolved = "CONFLICTS_SHOULD_BE_RESOLVED"
}

export enum DataConflictSaveErrorsStates {
    ErrorsDetected = "ERRORS_DETECTED",

}