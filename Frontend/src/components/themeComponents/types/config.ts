import type {ThemeMode} from "@tcpos/backoffice-components";

/** Literal type for theme font */
export type FontFamily =
    `'Inter', sans-serif`
    | `'Poppins', sans-serif`
    | `'Roboto', sans-serif`
    | `'Public Sans', sans-serif`;
/** Literal type for theme preset colors */
export type PresetColor =
    'default'
    | 'theme1'
    | 'theme2'
    | 'theme3'
    | 'theme4'
    | 'theme5'
    | 'theme6'
    | 'theme7'
    | 'theme8';

// ==============================|| CONFIG TYPES  ||============================== //

export type CustomizationActionProps = {
    type: string;
    payload?: CustomizationProps;
};

export type DefaultConfigProps = {
    defaultPath: string;
    fontFamily: FontFamily;
    //i18n: I18n;
    miniDrawer: boolean;
    container: boolean;
    mode: ThemeMode;
    presetColor: PresetColor;
    //themeDirection: ThemeDirection;
};

/**
 * Theme customization props
 */
export type CustomizationProps = {
    /** default path - not used */
    defaultPath: string;

    /** Font family used in the theme */
    fontFamily: FontFamily;

    /** miniDrawer */
    miniDrawer: boolean;

    /** container */
    container: boolean;

    /** Theme mode (light/dark) */
    mode: ThemeMode;

    /** presetColor */
    presetColor: PresetColor;

    /** onChangeContainer */
    onChangeContainer: VoidFunction;

    /** triggered when the theme mode changes */
    onChangeMode: (mode: ThemeMode) => void;

    /** onChangePresetColor */
    onChangePresetColor: (theme: PresetColor) => void;

    /** onChangeMiniDrawer */
    onChangeMiniDrawer: (miniDrawer: boolean) => void;

    /** onChangeFontFamily */
    onChangeFontFamily: (fontFamily: FontFamily) => void;
};
