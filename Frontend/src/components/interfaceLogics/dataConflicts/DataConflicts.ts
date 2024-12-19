import type {IEditHistory, IEntityDataMainObject, IEntityDataObject, IEntityDataObjectIds} from "@tcpos/common-core";
import {DailyRowStatus} from "@tcpos/common-core";
import _ from "underscore";
import {objectDiff} from "@tcpos/backoffice-core";
import {
    DataConflictAutoMergesStates,
    DataConflictConflictsStates,
    DataConflictSaveErrorsStates,
    DataConflictStoreEntities
} from "./DataConflictStates";
import type {IDataAdditionalAttributes} from "@tcpos/backoffice-core";

export interface IDataConflictDetail {
    key: string;
    remoteValue: unknown;
    localValue: unknown;
    originalValue: unknown;
}

export interface IDataDiffConflicts extends IEntityDataObjectIds{
    onlyRemote: boolean;
    onlyLocal: boolean;
    data: IDataConflictDetail[]
}

export interface IDataDiffAutoMerges extends IEntityDataObjectIds{
   updatedLocalData?: Record<string, unknown>;
   originalData?: Record<string, unknown>;
}

export interface IDataDiff {
    conflicts: IDataDiffConflicts[];
    autoMerges: IDataDiffAutoMerges[];
    errors: IDataDiffConflicts[]; // Same structure as conflicts
}

export class DataConflicts {
    /**
     * Detect errors, conflicts, auto-solvable conflicts (auto-merges)
     * @param localData
     * @param remoteData
     * @param originalData
     */
    public static compareSavedData = (localData: IEntityDataMainObject, remoteData: IEntityDataMainObject, originalData: IEditHistory)
        : IDataDiff => {
        const differences: IDataDiff = {conflicts: [], autoMerges: [], errors: []};
        remoteData.objectData.forEach(remoteDataEnt => { // Cycle the remote data tables

            // Extract the original data
            const originalDataEnt = originalData.objectData?.find(
                el =>
                    el.entityId === remoteDataEnt.entityId && el.entityName === remoteDataEnt.entityName
            );
            if (originalDataEnt) {
                // If the table row originally existed, check the differences with the remote data
                const remoteDataDiff = objectDiff(originalDataEnt.data, remoteDataEnt.data);
                // Get the local data
                const localDataEnt = localData.objectData
                    .find(el =>
                        el.entityId === remoteDataEnt.entityId && el.entityName === remoteDataEnt.entityName &&
                        localData.objectDataRowStatuses.find(
                            rowStatus =>
                                rowStatus.entityName === el.entityName && rowStatus.entityId === el.entityId &&
                                rowStatus.status !== DailyRowStatus.DELETED
                        )
                    );

                if (localDataEnt) { // If there is local data, check if auto merge is possible
                    const autoMerges: { key: string, value: unknown, originalValue: unknown }[] = [];
                    // Local and remote modifications on the same records
                    const localDataDiff = objectDiff(originalDataEnt.data, localDataEnt.data);
                    const currentDiffs: IDataConflictDetail[] = [];
                    Object.keys(remoteDataDiff).forEach(key => {
                        if (localDataDiff && localDataDiff[key as keyof typeof localDataDiff] && remoteDataDiff &&
                            remoteDataDiff[key as keyof typeof remoteDataDiff] !== undefined &&
                            remoteDataDiff[key as keyof typeof remoteDataDiff] !== localDataDiff[key as keyof typeof localDataDiff]
                        ) {
                            // Concurrent modifications (key = field name)
                            currentDiffs.push({
                                key: key,
                                localValue: localDataDiff[key as keyof typeof localDataDiff],
                                remoteValue: remoteDataDiff[key as keyof typeof localDataDiff],
                                originalValue: originalDataEnt.data[key as keyof typeof localDataDiff]
                            });
                        } else if (remoteDataDiff[key as keyof typeof remoteDataDiff] !== undefined &&
                                    !localDataDiff[key as keyof typeof localDataDiff]) {
                            // Only remote modification (key = field name)
                            autoMerges.push({
                                key: key,
                                value: remoteDataDiff[key as keyof typeof localDataDiff],
                                originalValue: originalDataEnt.data[key as keyof typeof localDataDiff]
                            });
                        }
                    });
                    if (currentDiffs.length) { // Add the conflicts to the conflict list
                        differences.conflicts.push({
                            entityName: remoteDataEnt.entityName,
                            entityId: remoteDataEnt.entityId,
                            onlyRemote: false,
                            onlyLocal: false,
                            data: currentDiffs,
                        });
                    }
                    if (autoMerges.length) { // Add the auto-solvable conflicts (autoMerges) to the list
                        differences.autoMerges.push({
                            entityName: remoteDataEnt.entityName,
                            entityId: remoteDataEnt.entityId,
                            updatedLocalData: _.object(autoMerges.map(el => {
                                return [el.key, el.value];
                            })),
                            originalData: _.object(autoMerges.map(el => {
                                return [el.key, el.originalValue];
                            }))
                        });
                    }
                } else {
                    // Remote modifications on a record locally deleted
                    differences.conflicts.push({
                        entityName: remoteDataEnt.entityName,
                        entityId: remoteDataEnt.entityId,
                        onlyRemote: true,
                        onlyLocal: false,
                        data: Object.keys(remoteDataEnt.data).map(key => {
                            return {
                                key: key,
                                remoteValue: (remoteDataEnt.data as Record<string, unknown>)[key],
                                localValue: undefined,
                                originalValue: (originalDataEnt.data as Record<string, unknown>)[key]
                            };
                        })
                    });
                }
            } else {
                // Record added remotely: no conflict
            }
        });

        // Cycle the locally modified rows
        localData.objectData.filter(ent => Number(ent.entityId) > 0 &&
            localData.objectDataRowStatuses.find(
                el => el.entityName === ent.entityName && el.entityId === ent.entityId &&
                    el.status === DailyRowStatus.MODIFIED
            )
        ).forEach(localDataEnt => {
                if (!remoteData.objectData.find(
                    el => el.entityId === localDataEnt.entityId && el.entityName === localDataEnt.entityName
                )) {
                    // Record locally modified and remotely deleted
                    differences.errors.push({
                        entityName: localDataEnt.entityName,
                        entityId: localDataEnt.entityId,
                        onlyRemote: false,
                        onlyLocal: true,
                        data: Object.keys(localDataEnt.data).map(key => {
                            return {
                                key: key,
                                remoteValue: undefined,
                                localValue: (localDataEnt.data as Record<string, unknown>)[key],
                                originalValue: undefined
                            };
                        })
                    });
                }
            }
        );
        return differences;
    };

    public static getConflictsData = (entityDataContext: IEntityDataMainObject, differences: IDataDiff)
        : {newDataObject: IEntityDataObject[], attributes: IDataAdditionalAttributes[]} => {
        const draft = structuredClone(entityDataContext.objectData);
        // Automatic update of data remotely modified
        differences.autoMerges.forEach(el => {
            const currentEntity = draft.find(ent =>
                ent.entityName === el.entityName && ent.entityId === el.entityId);
            if (currentEntity) {
                Object.keys(el.updatedLocalData ?? {}).forEach(key =>
                    (currentEntity.data as Record<string, unknown>)[key] = el.updatedLocalData![key]
                );
            }
        });
        // Store the executed data merges with the remote modifications
        const newAttributes: IDataAdditionalAttributes[] = [];
        differences.autoMerges.forEach(el => {
            newAttributes.push({
                attributeName: DataConflictStoreEntities.AutoMerges,
                newDataAttributes: Object.keys(_.omit(el.updatedLocalData ?? {}, 'ShaCode')).map(key => {
                    return {
                        entityId: el.entityId,
                        entityName: el.entityName,
                        fieldName: key,
                        value: el.updatedLocalData![key]
                    };
                })
            });
            newAttributes.push({
                attributeName: DataConflictStoreEntities.AutoMergesOriginalValues,
                newDataAttributes: Object.keys(_.omit(el.originalData ?? {}, 'ShaCode')).map(key => {
                    return {
                        entityId: el.entityId,
                        entityName: el.entityName,
                        fieldName: key,
                        value: el.originalData![key]
                    };
                })
            });
        });
        // Store the merging state
        if (differences.autoMerges.length) {
            newAttributes.push({
                attributeName: DataConflictStoreEntities.AutoMergesState,
                newDataAttributes: [{
                    entityName: "_general",
                    entityId: "_general",
                    value: DataConflictAutoMergesStates.AutoMergesApplying
                }]
            });
        }
        // Store the conflicts
        if (differences.conflicts.length) {
            const newDataConflictAttributes: {entityName: string, entityId: string, fieldName?: string, value: unknown}[] = [];
            differences.conflicts.forEach(el => {
                el.data.forEach(field => {
                    newDataConflictAttributes.push({
                        entityName: el.entityName,
                        entityId: el.entityId,
                        fieldName: field.key,
                        value: field
                    });
                });
            });
            newAttributes.push({
                attributeName: DataConflictStoreEntities.Conflicts,
                newDataAttributes: newDataConflictAttributes
            });
            newAttributes.push({
                attributeName: DataConflictStoreEntities.ConflictsState,
                newDataAttributes: [{
                    entityName: "_general",
                    entityId: "_general",
                    value: DataConflictConflictsStates.ConflictsDetected
                }]
            });
        }
        // Store the errors
        if (differences.errors.length) {
            newAttributes.push({
                attributeName: DataConflictStoreEntities.OnSaveErrors,
                newDataAttributes: differences.errors.map(el => {
                    return {
                        entityName: el.entityName,
                        entityId: el.entityId,
                        fieldName: "DataErrors",
                        value: el.data
                    };
                })
            });
            newAttributes.push({
                attributeName: DataConflictStoreEntities.OnSaveErrorsState,
                newDataAttributes: [{
                    entityName: "_general",
                    entityId: "_general",
                    value: DataConflictSaveErrorsStates.ErrorsDetected
                }]
            });
        }

        return {
            newDataObject: draft,
            attributes: newAttributes
        };
    };
}