import {PublicInjectable} from "@tcpos/common-core";
import _, {isArray} from "underscore";
import axios from "axios";
import type {AxiosInstance, AxiosRequestConfig, GenericAbortSignal, Cancel, AxiosError} from "axios";
import {
    ABaseApiController,
    ActionExecutorHelper,
    DailyHooksAfter,
    DailyHooksBefore, FilterLogic,
    store,
    DailyPublicRegistrationContainer,
    ACacheLogic,
    setLogged,
    CacheGroups} from "@tcpos/backoffice-core";
import type {IBatchOperationType, IApiError, IDataFilter, IDataFilterGroup, IApiInfo, IBatchCommand, IBatchSavedReturnValue, IApiResponse} from "@tcpos/backoffice-core";
import type {IPermissionList} from "../businessLogic/permissions/PermissionLogic";
import type {IBatchSavedAllReturnValues} from "./IBatchSavedReturnValue";

export class ApiAbortError extends Error {

    constructor(message?: string) {
        super(message);
    }
}

@PublicInjectable()
export class CommonApiController<T extends Record<string, unknown>> extends ABaseApiController {
    apiUrl: string = "";
    private axiosClient: AxiosInstance;

    constructor(
        @DailyPublicRegistrationContainer.inject(ACacheLogic) private cacheLogic: ACacheLogic,
    ) {
        super();
        this.axiosClient = axios.create({
            validateStatus: (status) => status >= 200 && status !== 401,
        });
    }

    getApiUrl(): string {
        return this.apiUrl !== "" ? this.apiUrl : store.getState().interfaceConfig.apiUrl;
    }

    setApiUrl(url: string) {
        this.apiUrl = url;
    }

    dataLoad = async <T>(apiEntityName: string, id: number): Promise<T | IApiError | undefined> => {
        try {
            const getNewData = async () => {
                return await this.apiGet<T>(`${this.getApiUrl()}/${apiEntityName}/${id}`,
                    [], {}, true);
            };
            const newData = await getNewData();
            if ((newData as IApiError).type) {
                return undefined;
            }
            const getResult = async () => {
                return await ActionExecutorHelper.executeAction<T, T>(
                    apiEntityName, DailyHooksBefore.dataLoadBefore, DailyHooksAfter.dataLoadAfter, newData as T,
                    (data) => {
                        return {success: true, result: data};
                    }
                );
            };
            const result = await getResult();
            if (result.success) {
                return result.result;
            }
            return undefined;
        } catch {
            throw `Error when trying to get data from ${apiEntityName}/${id}`;
        }
    };

    dataListCount = async (apiEntityName: string, filter: (IDataFilterGroup | IDataFilter)[] | string,
                    abortSignal?: GenericAbortSignal,
                    params?: Record<string, string>): Promise<number | undefined | IApiError> => {
        let rowCount = -1;
        try {
            const getRowCount = await (async () => {
                return await this.apiGet<number>(
                    `${this.getApiUrl()}/${apiEntityName}/count`, filter,
                    {
                        ...(params ?? {})
                    },
                    true, [], abortSignal);
            })();
            if (!(getRowCount as IApiError).type) {
                return Number(getRowCount);
            } else {
                const error = getRowCount as IApiError;
                if (error.message) {
                    return error;
                } else {
                    return undefined;
                }
            }
        } catch (err) {
            throw new Error(`Error when trying to get data list count from ${apiEntityName}`);
        }

    };

    dataListLoad = async <T>(apiEntityName: string, filter: (IDataFilterGroup | IDataFilter)[] | string, fieldList: string[],
                             sort?: string[], top?: number, skip?: number, abortSignal?: GenericAbortSignal,
                             all?: boolean, params?: Record<string, string>):
        Promise<T[] | undefined | IApiError> => {
        let rowCount = -1;
        if (all) {
            try {
                const getRowCount = await this.dataListCount(
                    apiEntityName, filter, abortSignal, params
                );
                if (!(getRowCount as IApiError).type) {
                    rowCount = Number(getRowCount);
                } else {
                    const error = getRowCount as IApiError;
                    if (error.message) {
                        return error;
                    } else {
                        return undefined;
                    }
                }
            } catch (err) {
                throw new Error(`Error when trying to get data list count from ${apiEntityName}`);
            }
        }
        try {
            let newData: IApiError | T[] = [];
            let cnt = 0;
            if (all) {
                skip = undefined;
                top = undefined;
            }
            do {
                const newPartialData = await (async () => {
                    return await this.apiGet<T[]>(
                        `${this.getApiUrl()}/${apiEntityName}`, filter,
                        {
                            '$orderby': sort && sort.length ? sort.join(",") : undefined,
                            '$top': top ?? (!all ? 50 : undefined),
                            '$skip': skip,
                            ...(params ?? {})
                        },
                        true, fieldList, abortSignal);
                })();
                cnt++;
                if (!(newPartialData as IApiError).type) {
                    newData = [...newData, ...(newPartialData as T[])];
                } else {
                    return undefined; // TODO return the error with the type
                }
                if (cnt >= 100) {
                    break;
                }
                if (all) {
                    skip = newData.length;
                }
            } while (!(newData as unknown as IApiError).type && newData.length < rowCount && all);
            const getResult = async () => {
                return await ActionExecutorHelper.executeAction<T[], T[]>(
                    apiEntityName, DailyHooksBefore.dataListLoadBefore, DailyHooksAfter.dataListLoadAfter, newData as T[],
                    (data) => {
                        return {success: true, result: data};
                    }
                );
            };
            const result = await getResult();
            if (result.success) {
                return result.result;
            }
            return undefined;
        } catch {
            throw `Error when trying to get data list from ${apiEntityName}`;
        }
    };

    getDataSchema = async <T>(apiEntityName: string, operation: string): Promise<T | IApiError> => {
        try {
            return await this.apiGet<T>(
                //`${this.getApiUrl()}/${apiEntityName}/${operation}/Schema`,
                `${this.getApiUrl()}/${apiEntityName}/Schema`,
                [], {}, false);
        } catch {
            throw new Error(`Error when trying to get ${apiEntityName} schema`);
        }
    };

    /**
     * API batch creation
     * @return - object containing the generic url and the function to call to get the batch id
     */
    batchCreateCommand(): IApiInfo<{ numCommands: number, ttlMilliseconds: number }, string>  {
        const Url = `${this.getApiUrl()}/Batch/{numCommands}/{ttlMilliseconds}`;
        const Verb = "POST";
        const apiCall = async (params: { numCommands: number, ttlMilliseconds: number }) => {
            return await this.apiPost<Record<string, never>, string>(
                Url.replace('{numCommands}', params.numCommands.toString())
                    .replace('{ttlMilliseconds}', params.ttlMilliseconds.toString()),
                {}
            );
        };
        return {endPoint: {Url, Verb}, apiCall};
    }

    /**
     * Creates a new batch and returns the batch id
     * @param numCommands
     * @return - new batch id
     */
    async getBatchId(numCommands: number): Promise<string> {
        try {
            return await this.batchCreateCommand().apiCall({numCommands, ttlMilliseconds: 20000});
        } catch {
            throw `Error when trying to create the batch`;
        }
    }

    /**
     * API batch execution
     * @return - object containing the generic url and the function to call to execute the batch
     */
    batchRunCommand(): IApiInfo<string, IApiResponse> {
        const Url = `${this.getApiUrl()}/Batch/{batchId}/Run`;
        const Verb = "PUT";
        const apiCall = async (batchId: string) => {
            return await this.apiPut<Record<string, never>, IApiResponse>(
                Url.replace('{batchId}', batchId), {}
            );
        };
        return {endPoint: {Url, Verb}, apiCall};
    }

    /**
     * Executes a batch
     * @param batchId
     * @param newIdCommandIndex Index of the command whose response contains the id of the main entity we are saving
     * @return - Extracts from the list of the responses of each command, the response corresponding to newIdCommandIndex
     * and returns the entityKey value
     */
    async runBatch(batchId: string, newIdCommandIndex: number): Promise<IBatchSavedAllReturnValues> {
        let result: IApiResponse;
        try {
            result = await this.batchRunCommand().apiCall(batchId);
            if (isArray(result)) {
                return result;
/*
                return result?.find((el: { commandId: number, entityKey: number }) =>
                    el.commandId === newIdCommandIndex)?.entityKey;
*/
            } else if ((result as unknown as IApiError).status && (result as unknown as IApiError).status === 409) { // (result as AxiosError).response?.status && String((result as AxiosError).response?.status) === "409") {
                return {
                    error: (result as Record<string, string>).detail,
                    errorCode: String((result as unknown as IApiError).status),
                };
            } else if (result?.message || (result as unknown as IApiError).status) {
                return {error: result?.message ?? "", errorDetails: result?.errorDetails ?? (result?.stack ?? (result?.detail ?? ""))};
            } else {
                return undefined;
            }
        } catch {
            if (result && !isArray(result)) {
                throw new Error(`Error when trying to execute the batch: ` + result);
            } else {
                throw new Error(`Error when trying to execute the batch`);
            }
        }
    }

    batchEditCommand(entity: string, operation: IBatchOperationType): IApiInfo<{batchId: string, commandId: number,
                                    key: string, payload: object, concurrencyCode?: string}, any> {
        const Url = `${this.getApiUrl()}/Batch/{batchId}/{commandId}/${entity}/${operation}/{key}/{concurrencyCode?}`;
        const Verb = "POST";
        const apiCall = async (params: {batchId: string, commandId: number,
                                   key: string, payload: object, concurrencyCode?: string}) => {
            return await this.postCall(
                Url.replace('{batchId}', params.batchId)
                    .replace('{commandId}', params.commandId.toString())
                    .replace('{entity}', entity)
                    .replace('{operation}', operation)
                    .replace('{key}', params.key)
                    .replace('/{concurrencyCode?}', params.concurrencyCode ? `/${encodeURIComponent(params.concurrencyCode)}` : ""),
                {}, params.payload
            );
        };
        return {endPoint: {Url, Verb}, apiCall};
    }

    batchInsertCommand(entity: string): IApiInfo<{batchId: string, commandId: number, operation: IBatchOperationType,
                                    payload: object}, any> {
        const Url = `${this.getApiUrl()}/Batch/{batchId}/{commandId}/${entity}/Insert`;
        const Verb = "POST";
        const apiCall = async (params: {batchId: string, commandId: number, operation: IBatchOperationType,
                                   payload: object}) => {
            return await this.postCall(
                Url.replace('{batchId}', params.batchId)
                    .replace('{commandId}', params.commandId.toString())
                    .replace('{entity}', entity)
                    .replace('{operation}', params.operation),
                {}, params.payload
            );
        };
        return {endPoint: {Url, Verb}, apiCall};
    }

    basePermissions: IPermissionList[] = [
        {
            Name: "Write",
            PermissionItems: [
                {
                    Entity: "Batch",
                    Code: "batch-create",
                    Description: "Batch create",
                    PermissionItemEndPoint: this.batchCreateCommand().endPoint,
                    PermissionItemParents: []
                },
                {
                    Entity: "Batch",
                    Code: "batch-run",
                    Description: "Batch run",
                    PermissionItemEndPoint: this.batchRunCommand().endPoint,
                    PermissionItemParents: []
                }
            ]
        }
    ];

    getData = <T>(urlSuffix: string | { customEndPoint: string; }, count?: boolean): IApiInfo<{queryParams: Record<string, unknown>, noCache: boolean,
                                        filter: (IDataFilterGroup | IDataFilter)[] | string | undefined,
                                        select?: string[], abortSignal?: GenericAbortSignal}, IApiError | T> => {
        const fullApiUrl = typeof urlSuffix === "string" ? `${this.getApiUrl()}/${urlSuffix}`
            : urlSuffix.customEndPoint;
        const Url = `${fullApiUrl}/${count ? 'count' : ''}`;
        const Verb = "GET";
        const apiCall = async (params: {queryParams: Record<string, unknown>, noCache: boolean,
                                        filter: (IDataFilterGroup | IDataFilter)[] | string | undefined
                                        select?: string[], abortSignal?: GenericAbortSignal}) => {
            return this.apiGet<T>(Url,
                params.filter, params.queryParams, params.noCache, params.select, params.abortSignal);
/*
            return this.apiGet<T>(Url.replace('{urlSuffix}', urlSuffix),
                params.filter, params.queryParams, params.noCache, params.select, params.abortSignal);
*/
        };
        return {endPoint: {Url, Verb}, apiCall};
    };

    getSingleData = <T>(urlSuffix: string): IApiInfo<{id: string, queryParams: Record<string, unknown>, noCache: boolean,
                                        filter: (IDataFilterGroup | IDataFilter)[] | undefined,
                                        select?: string[], abortSignal?: GenericAbortSignal}, IApiError | T> => {
        const Url = `${this.getApiUrl()}/${urlSuffix}/{key}`;
        const Verb = "GET";
        const apiCall = async (params: {id: string, queryParams: Record<string, unknown>, noCache: boolean,
                                        filter: (IDataFilterGroup | IDataFilter)[] | undefined
                                        select?: string[], abortSignal?: GenericAbortSignal}) => {
            return this.apiGet<T>(Url.replace('{urlSuffix}', urlSuffix).replace('{id}', params.id),
                params.filter, params.queryParams, params.noCache, params.select, params.abortSignal);
        };
        return {endPoint: {Url, Verb}, apiCall};
    };

    saveData = async <T extends object>(commandList: IBatchCommand[], newIdCommandIndex: number): Promise<IBatchSavedReturnValue> => {
        if (!commandList.length) {
            return {error: "No commands provided."};
        }

        // Batch command number is limited to 24; they are sent 20 by 20
        let cnt = 0;
        const step = 20;
        const apiResponses: number[] = [];
        while (cnt < commandList.length) {
            let batchId: string;
            const promises: (() => Promise<void>)[] = [];
            const batchCommandsErrors: {error: string, errorDetails: string}[] = [];
            const apiCalls: (() => Promise<any>)[] = [];
            const partialCommandList = commandList.slice(cnt, cnt + step);
            try {
                batchId = await this.getBatchId(partialCommandList.length);
            } catch (ex) {
                return {error: "Error detected when creating a new batch"};
            }
            for (let idx = 0; idx <partialCommandList.length; idx++) {
                partialCommandList[idx].refFields.forEach(f => {
/*
                    if (partialCommandList[idx].payload[f.fieldName] !== null) { // Null fields are not changed
                        partialCommandList[idx].payload[f.fieldName] = {
                            Value: partialCommandList[idx].payload[f.fieldName],
                            ValueType: f.indexRef >= 0 ? f.indexRef : 0
                        } as T[keyof T]; // TODO check cast
                    }
*/
                    if (partialCommandList[idx].payload[f.fieldName] !== null) { // Null fields are not changed
                        if (f.indexRef > 0 && Number(partialCommandList[idx].payload[f.fieldName]) < cnt) {
                            partialCommandList[idx].payload[f.fieldName] = {
                                Value: apiResponses[Number(partialCommandList[idx].payload[f.fieldName]) - 1],
                                ValueType: 0,
                                ValueReference: 0
                            } as T[keyof T]; // TODO check cast
                        } else {
                            partialCommandList[idx].payload[f.fieldName] = {
                                Value: partialCommandList[idx].payload[f.fieldName],
                                ValueType: 1,
                                ValueReference: f.indexRef >= 0 ? f.indexRef : 0
                            } as T[keyof T]; // TODO check cast
                        }
                    }
                });
                if (partialCommandList[idx].operation === 'Replace' || partialCommandList[idx].operation === 'Update' || partialCommandList[idx].operation === 'Remove') {
                    if (!partialCommandList[idx].objectId) {
                        throw new Error(`The operation ${idx + 1} requires an object id`);
                    }
                    apiCalls.push(
                        () => this.batchEditCommand(partialCommandList[idx].entity, partialCommandList[idx].operation).apiCall({batchId: batchId, commandId: idx + 1,
                            key: partialCommandList[idx].objectId!.toString(),
                            payload: _.omit(partialCommandList[idx].payload, ['ConcurrencyCode']) as T, // TODO check cast
                            concurrencyCode: partialCommandList[idx].payload.ConcurrencyCode ? String(partialCommandList[idx].payload.ConcurrencyCode) : ""}),
                    );
                } else if (partialCommandList[idx].operation === 'Insert') {
                    apiCalls.push(
                        () => this.batchInsertCommand(partialCommandList[idx].entity).apiCall({batchId: batchId, commandId: idx + 1,
                            operation: partialCommandList[idx].operation, payload: partialCommandList[idx].payload})
                        /*
                                        apiCalls.push({
                                            apiUrl: `${getApiUrl()}/Batch/${batchId}/${idx + 1}/${partialCommandList[idx].entity}/${partialCommandList[idx].operation}`,
                                            payload: partialCommandList[idx].payload
                                        });
                        */
                    );
                } else {
                    throw `Not a valid operation for command no. ${idx + 1}`;
                }
            }

            apiCalls.forEach(api => {
                const nextCall = async () => {
                    try {
                        const res = await api(); //this.postCall(api.apiUrl, {}, api.payload);
                        if (res.message && res.stack) {
                            batchCommandsErrors.push({error: res.message, errorDetails: res.stack});
                        }
                    } catch(ex) {
                        console.log(ex);
                    }
                };
                promises.push(nextCall);
            });
            try {
                await Promise.all(promises.map(p => p()));
                if (batchCommandsErrors.length) {
                    return {error: batchCommandsErrors.map(err => err.error).join(' - '),
                        errorDetails: batchCommandsErrors.map(err => err.errorDetails).join(' - ')};
                }
            } catch (ex) {
                return {error: "Error detected when sending the batch list"};
            }

            try {
                const res = await this.runBatch(batchId, newIdCommandIndex);
                if (Array.isArray(res)) {
                    (res as {commandId: number, entityKey: number}[]).forEach(i =>
                        apiResponses[i.commandId + cnt - 1] = i.entityKey
                    );
                } else {
                    return res;
                }
            } catch (ex) {
                throw "Error detected when executing the batch: " + ex;
            }

            cnt += step;
        }
        return apiResponses[newIdCommandIndex - 1];
    };

    apiGet = async <T>(url: string, filter?: (IDataFilterGroup | IDataFilter)[] | string, queryParams?: Record<string, unknown>,
                       noCache?: boolean, select?: string[], abortSignal?: GenericAbortSignal, configParams?: Record<string, unknown>): Promise<T | IApiError> => {
        /*
                let convertedFilter: {filter: (IGridFilterGroup | IGridFilter)[], error: string} = {filter: [], error: ""};
                if (filter) {
                    convertedFilter = FilterLogic.convertFilterUrl2FilterTree(filter);
                    if (convertedFilter.error !== "") {
                        throw convertedFilter.error;
                    }
                }
        */
        if (Array.isArray(filter)) {
            if (filter?.length) {
                queryParams = {...queryParams, "$filter": FilterLogic.convertFilterTreeForAPI(filter)};
            }
        } else {
            queryParams = {...queryParams, "$filter": filter};
        }
        if (select?.length) {
            queryParams = {...queryParams, "$select": select.join(',')};
        }
        const data = await this.get<T>(
            url, {
                baseURL: "",
                params: queryParams,
                /*...this.authenticationService.getAuthConfig()*/
                signal: abortSignal,
                ...(configParams ?? {}),
            },
            !noCache, noCache
        );
        return data as T | IApiError;
    };

    /**Performs an api get */
    async get<T>(url: string, config?: AxiosRequestConfig, noVer?: boolean, noCache?: boolean): Promise<T | IApiError> {
        if (noCache) {
            try {
                const {data} = await this.axiosClient.get<T>(
                    url + (url.indexOf("?") === -1 ? "?" : "&") +
                    (!noVer ? "ver=" + Date.now().toString() : ""),
                    config ?? this.decorateUserConfig(config)
                );
                return data;
            } catch (error: any) {
                return this.onApiError(error) as IApiError;
            }
        } else {
            return await this.cacheLogic.getCacheItem(
                url + JSON.stringify(config?.params ?? "") ,
                CacheGroups.apiCalls,
                async () => {
                    try {
                        const {data} = await this.axiosClient.get<T>(url, config ?? this.decorateUserConfig(config));
                        return data;
                    } catch (error) {
                        return this.onApiError(error) as T;
                    }
                },
                false
            );
        }
    }

    apiPost = async <T, R>(url: string, payload: T, configParams?: Record<string, unknown>): Promise<R> => {
        return await this.post<R>(
            url, payload, {
                baseURL: "",
                params: {},
                ...(configParams ?? {})
                /*...this.authenticationService.getAuthConfig()*/
            }
        );
    };

    /**Performs an api post */
    async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        try {
            const ajaxResult = await this.axiosClient.post<T>(
                url,
                data,
                config ?? this.decorateUserConfig(config)
            );

            const {data: resultData} = ajaxResult;
            return resultData;
        } catch (error) {
            return this.onApiError(error) as T;
        }
    }

    apiPut = async <T, R>(url: string, payload: T): Promise<R> => {
        return await this.put<R>(
            url, payload, {
                baseURL: "",
                params: {},
                /*...this.authenticationService.getAuthConfig()*/
            }
        );
    };

    /**Performs an api put */
    async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        try {
            const {data: resultData, status} = await this.axiosClient.put<T>(
                url,
                data,
                this.decorateUserConfig(config)
            );
            if (status >= 200 && status < 300) {
                return resultData as T;
            } else {
                return this.onApiError({response: {status: status, data: JSON.stringify(resultData)}}) as T;
            }
        } catch (error) {
            return this.onApiError(error) as T;
        }
    }

    apiDelete = async <T>(url: string): Promise<T> => {
        return await this.delete<T>(
            url
        );
    };

    /**Performs an api delete */
    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
        try {
            const {data} = await this.axiosClient.delete<T>(
                url,

                {
                    ...this.decorateUserConfig(config),
                    data: {
                        viewConfigsource: {}
                    }
                }
            );
            return data;
        } catch (error) {
            return this.onApiError(error) as T;
        }
    }


    /**
     * Sends a "post" call to the API
     * @param url
     * @param queryParams
     * @param payload
     */
    async postCall<T>(url: string, queryParams?: Record<string, unknown>, payload?: Record<string, any>): Promise<any> {
        return await this.post<T>(
            url, payload, {
                baseURL: "",
                params: queryParams//,
                /*...this.authenticationService.getAuthConfig()*/
            }
        );
    }

    /**
     * Sends a "put" call to the API
     * @param url
     * @param queryParams
     * @param payload
     */
    async putCall<T>(url: string, queryParams?: Record<string, unknown>, payload?: Record<string, any>): Promise<any> {
        return await this.put<T>(
            url, payload, {
                baseURL: "",
                params: queryParams//,
                /*...this.authenticationService.getAuthConfig()*/
            }
        );
    }

    onApiError = (error: any): IApiError => {
        if (axios.isCancel(error)) {
            return {type: 'Canceled', message: new ApiAbortError((error as Cancel).message).message};
        }
        if (error.response.status === 401) {
            const dispatch = store.dispatch;
            dispatch(setLogged({logged: false}));
            return {type: 'Unauthorized', message: ''};
        } else if (error.response.status === 409) {
            return {type: 'Undefined', message: '', status: 409};
        } else if (error.response.data && JSON.parse(error.response.data).title) {
            const parsedResponse = JSON.parse(error.response.data);
            let title = parsedResponse.title;
            if (title.substring(0,3) === '975' && parsedResponse.exceptionData.providerMessage) {
                title = String(parsedResponse.exceptionData.providerMessage).split("\r\n")[0];
            }
            return {
                type: 'ApiError',
                message: "_apiError_" + title,
                stack: JSON.parse(error.response.data).exceptionDetails
            }
        } else if (error.response.status === 400) {
            const newError = this.processAxiosError(error);
            return {
                type: 'Undefined',
                message: newError instanceof Error ? newError.message : "Bad request",
                stack: error.response?.data?.exception ?? (error.response.data.errors
                    ? Object.keys(error.response.data.errors).map(key => key + ': ' + error.response.data.errors[key]).join(' - ')
                    : "No details available")
            };
        } else if (error.response.data?.detail) {
            return {
                type: error.code ?? (error.name ?? "Generic error"),
                message: error.message ?? (error.response.statusText ?? "Unexpected error"),
                status: error.response.status ?? "",
                stack: error.response.data.detail,
            }
        } else if (error.response.data) {
            return {
                type: error.code ?? (error.name ?? "Generic error"),
                message: error.message ?? String(error.response.data),
                status: error.response.status ?? "",
            }
        } else {
            const newError = this.processAxiosError(error);
            return {type: 'AxiosError',
                message: newError instanceof Error ? newError.message : "Unexpected error",
                stack: error.response?.data?.exception ?? "No details available",
            };
        }
    };

    /**
     * if the error is axios and a reason is given, throws a new error with the reason
     * @param error
     * @private
     */
    private processAxiosError(error: unknown) {
        if (error instanceof Error && "isAxiosError" in error) {
            const axiosError = error as AxiosError;
            if (axiosError.response && _.isObject(axiosError.response.data) && "message" in (axiosError.response.data || {})) {
                return new Error(axiosError.response.data.message);
            }
        }
        return error;
    }



    /**
     *
     * @param config operator provided config
     * @returns a config decorated with properties from app status
     */
    private decorateUserConfig(
        config: AxiosRequestConfig<any> | undefined
    ): AxiosRequestConfig<any> | undefined {
        return {
            transitional: {
                //avoid invalid json to proceed
                // silentJSONParsing: false,
            },
            responseType: "json",
            baseURL: "",
            ...config,

        };
    }


}