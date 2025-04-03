import React from "react";
import {App, AppInner} from "./App";

/**
 * this is the standard entry point for webdaily
 * in some particular enviroment, the <App> wrapper can be used
 */
export const FullApp = () => <App><AppInner/></App>;