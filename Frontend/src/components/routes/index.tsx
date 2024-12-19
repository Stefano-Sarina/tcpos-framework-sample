import {useRoutes} from "react-router-dom";

// project import
import LoginRoutes from "./LoginRoutes";
import MainRoutes from "./MainRoutes";

// ==============================|| ROUTING RENDER ||============================== //

/**
 * Application routes
 */
export default function ThemeRoutes() {
    return useRoutes([...LoginRoutes, MainRoutes]);
}
