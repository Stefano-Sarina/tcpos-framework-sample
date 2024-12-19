/**
 * registers default components, plugins can remove these components to change rendering widgets
 */
import {createRegistrationEntry, DailyComponents} from "@tcpos/common-core";
import {DailyPublicRegistrationContainer} from "@tcpos/backoffice-core";
import {
    DefaultViewModeToolbarButton,
    DeleteObjectToolbarButton,
    GotoDetailGridViewButton,
    GridViewModeToolbarButton,
    InLineEditGridViewButton,
    NewObjectToolbarButton,
    ReadWriteModeToolbarButton,
    ReadWriteModeToolbarLabel,
    SaveObjectToolbarButton,
    UndoInLineEditGridViewButton,
    UndoRedoToolbarButton,
    ViewModeToolbarCombobox,
    WD_BoundButton,
    WD_BoundCheckBox,
    WD_BoundComboBox,
    WD_BoundDatePicker,
    WD_BoundImageUpload,
    WD_BoundLabel,
    WD_BoundLink,
    WD_BoundSubForm,
    WD_BoundTextArea,
    WD_BoundTextFieldBoolean,
    WD_BoundTextFieldDate,
    WD_BoundTextFieldNumber,
    WD_BoundTextFieldPassword,
    WD_BoundTextFieldString,
    WD_BoundTimePicker,
    WD_BoundTreeContainer,
    WD_DailyActionToolbarButton,
    WD_DailyActionToolbarComboBox,
    WD_DailyActionToolbarDropDownButton,
    WD_DailyActionToolbarLabel,
    WD_DailyActionToolbarNavigationBar,
    WD_DailyActionToolbarProgressBar,
    WD_DailyActionToolbarSeparator,
    WD_DailyActionToolbarTextBox,
    WD_Section
} from "@tcpos/backoffice-components";

/**
 * Registers interface components:
 * - Generic UI components: provided by the _@tcpos/backoffice-components_ package, they include data binding; registration
 * key: "uiComponents"
 * - Toolbar components: provided by the _@tcpos/backoffice-components_ package; registration key: "uiToolbarComponents".
 * - Action components: provided by the _@tcpos/backoffice-components_ package; registration key: "uiActionComponents".
 * These components include actions (triggered depending on the component type). The registration name is prepended
 * by "_all" to indicate that they are included by default in all the toolbars
 *
 * This function uses methods provided by the {@link DailyPublicRegistrationContainer} class.
 */
export function registerDailyDefaultComponent(): void {
    DailyPublicRegistrationContainer.registerEntry("uiComponents",
        createRegistrationEntry({_registrationName: DailyComponents.wdStringTextField, component: WD_BoundTextFieldString}));
    DailyPublicRegistrationContainer.registerEntry("uiComponents",
        createRegistrationEntry({_registrationName: DailyComponents.wdPasswordTextField, component: WD_BoundTextFieldPassword}));
    DailyPublicRegistrationContainer.registerEntry("uiComponents",
        createRegistrationEntry({_registrationName: DailyComponents.wdNumberTextField, component: WD_BoundTextFieldNumber}));
    DailyPublicRegistrationContainer.registerEntry("uiComponents",
        createRegistrationEntry({_registrationName: DailyComponents.wdDateTextField, component: WD_BoundTextFieldDate}));
    DailyPublicRegistrationContainer.registerEntry("uiComponents",
        createRegistrationEntry({_registrationName: DailyComponents.wdBooleanTextField, component: WD_BoundTextFieldBoolean}));
    DailyPublicRegistrationContainer.registerEntry("uiComponents",
        createRegistrationEntry({_registrationName: DailyComponents.wdTextArea, component: WD_BoundTextArea}));
    DailyPublicRegistrationContainer.registerEntry("uiComponents",
        createRegistrationEntry({_registrationName: DailyComponents.wdLabel, component: WD_BoundLabel}));
    DailyPublicRegistrationContainer.registerEntry("uiComponents",
        createRegistrationEntry({_registrationName: DailyComponents.wdLink, component: WD_BoundLink}));
    DailyPublicRegistrationContainer.registerEntry("uiComponents",
        createRegistrationEntry({_registrationName: DailyComponents.wdCheckbox, component: WD_BoundCheckBox}));
    DailyPublicRegistrationContainer.registerEntry("uiComponents",
        createRegistrationEntry({_registrationName: DailyComponents.wdCombobox, component: WD_BoundComboBox}));
    DailyPublicRegistrationContainer.registerEntry("uiComponents",
        createRegistrationEntry({_registrationName: DailyComponents.wdSection, component: WD_Section}));
    DailyPublicRegistrationContainer.registerEntry("uiComponents",
        createRegistrationEntry({_registrationName: DailyComponents.wdDatePicker, component: WD_BoundDatePicker}));
    DailyPublicRegistrationContainer.registerEntry("uiComponents",
        createRegistrationEntry({_registrationName: DailyComponents.wdTimePicker, component: WD_BoundTimePicker}));
    DailyPublicRegistrationContainer.registerEntry("uiComponents",
        createRegistrationEntry({_registrationName: DailyComponents.wdButton, component: WD_BoundButton}));
    DailyPublicRegistrationContainer.registerEntry("uiComponents",
        createRegistrationEntry({_registrationName: DailyComponents.wdSubForm, component: WD_BoundSubForm}));
    DailyPublicRegistrationContainer.registerEntry("uiComponents",
        createRegistrationEntry({_registrationName: DailyComponents.wdImage, component: WD_BoundImageUpload}));
    DailyPublicRegistrationContainer.registerEntry("uiComponents",
        createRegistrationEntry({_registrationName: DailyComponents.wdTree, component: WD_BoundTreeContainer}));

    DailyPublicRegistrationContainer.registerEntry("uiToolbarComponents",
        createRegistrationEntry({_registrationName: DailyComponents.wdToolbarButton, component: WD_DailyActionToolbarButton}));
    DailyPublicRegistrationContainer.registerEntry("uiToolbarComponents",
        createRegistrationEntry({_registrationName: DailyComponents.wdToolbarComboBox, component: WD_DailyActionToolbarComboBox}));
    DailyPublicRegistrationContainer.registerEntry("uiToolbarComponents",
        createRegistrationEntry({_registrationName: DailyComponents.wdToolbarDropDownButton, component: WD_DailyActionToolbarDropDownButton}));
    DailyPublicRegistrationContainer.registerEntry("uiToolbarComponents",
        createRegistrationEntry({_registrationName: DailyComponents.wdToolbarLabel, component: WD_DailyActionToolbarLabel}));
    DailyPublicRegistrationContainer.registerEntry("uiToolbarComponents",
        createRegistrationEntry({_registrationName: DailyComponents.wdToolbarNavigationBar, component: WD_DailyActionToolbarNavigationBar}));
    DailyPublicRegistrationContainer.registerEntry("uiToolbarComponents",
        createRegistrationEntry({_registrationName: DailyComponents.wdToolbarProgressBar, component: WD_DailyActionToolbarProgressBar}));
    DailyPublicRegistrationContainer.registerEntry("uiToolbarComponents",
        createRegistrationEntry({_registrationName: DailyComponents.wdToolbarSeparator, component: WD_DailyActionToolbarSeparator}));
    DailyPublicRegistrationContainer.registerEntry("uiToolbarComponents",
        createRegistrationEntry({_registrationName: DailyComponents.wdToolbarTextBox, component: WD_DailyActionToolbarTextBox}));

    DailyPublicRegistrationContainer.registerEntry("uiActionComponents",
        createRegistrationEntry({_registrationName: '_all__newObject', component: NewObjectToolbarButton}));
    DailyPublicRegistrationContainer.registerEntry("uiActionComponents",
        createRegistrationEntry({_registrationName:'_all__readWriteModeButton', component: ReadWriteModeToolbarButton}));
    DailyPublicRegistrationContainer.registerEntry("uiActionComponents",
        createRegistrationEntry({_registrationName:'_all__inLineEdit', component: InLineEditGridViewButton}));
    DailyPublicRegistrationContainer.registerEntry("uiActionComponents",
        createRegistrationEntry({_registrationName:'_all__gotoDetailView', component: GotoDetailGridViewButton}));
    DailyPublicRegistrationContainer.registerEntry("uiActionComponents",
        createRegistrationEntry({_registrationName:'_all__saveObject', component: SaveObjectToolbarButton}));
    DailyPublicRegistrationContainer.registerEntry("uiActionComponents",
        createRegistrationEntry({_registrationName:'_all__undoInLineEdit', component: UndoInLineEditGridViewButton}));
    DailyPublicRegistrationContainer.registerEntry("uiActionComponents",
        createRegistrationEntry({_registrationName:'_all__undo_redo', component: UndoRedoToolbarButton}));
    DailyPublicRegistrationContainer.registerEntry("uiActionComponents",
        createRegistrationEntry({_registrationName:'_all_rwModeLabel', component: ReadWriteModeToolbarLabel}));
    DailyPublicRegistrationContainer.registerEntry("uiActionComponents",
        createRegistrationEntry({_registrationName:'_all__delete', component: DeleteObjectToolbarButton}));
    DailyPublicRegistrationContainer.registerEntry("uiActionComponents",
        createRegistrationEntry({_registrationName:'_all_viewModeComboBox', component: ViewModeToolbarCombobox}));
    DailyPublicRegistrationContainer.registerEntry("uiActionComponents",
        createRegistrationEntry({_registrationName:'_all_defaultViewMode', component: DefaultViewModeToolbarButton}));
    DailyPublicRegistrationContainer.registerEntry("uiActionComponents",
        createRegistrationEntry({_registrationName:'_all__gridView', component: GridViewModeToolbarButton}));

}
