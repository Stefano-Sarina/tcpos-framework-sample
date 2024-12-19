import {registerCustomer} from "./Customer";
import {registerOperator} from "./Operator";
import {registerCostCenter} from "./CostCenters";

export const basePluginListRegistration: {[name: string]: () => void} = {
    customer: () => registerCustomer(),
    operator: () => registerOperator(),
    costCenter: () => registerCostCenter(),
};