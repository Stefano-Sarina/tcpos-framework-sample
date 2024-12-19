// ==============================|| THEME CONFIG  ||============================== //

import type {FontFamily, PresetColor} from "./types/config";
import type {ThemeMode} from "@tcpos/backoffice-components";

const config: {defaultPath: string, fontFamily: FontFamily, miniDrawer: boolean, container: boolean, mode: ThemeMode,
                presetColor: PresetColor} = {
    defaultPath: '/dashboard/default',
    fontFamily: `'Public Sans', sans-serif`,
    miniDrawer: false,
    container: true,
    mode: 'light',
    presetColor: 'default',
};

export default config;
export const drawerWidth = 260;

export const twitterColor = '#1DA1F2';
export const facebookColor = '#3b5998';
export const linkedInColor = '#0e76a8';
