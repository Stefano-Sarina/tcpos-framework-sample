/**
 * registers default components, plugins can remove these components to change rendering widgets
 */
import {createRegistrationEntry, NextBOComponents} from "@tcpos/common-core";
import {NextBOPublicRegistrationContainer} from "@tcpos/backoffice-core";
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
    NBO_BoundButton,
    NBO_BoundCheckBox,
    NBO_BoundComboBox,
    NBO_BoundDatePicker,
    NBO_BoundImageUpload,
    NBO_BoundLabel,
    NBO_BoundLink,
    NBO_BoundSubForm,
    NBO_BoundTextArea,
    NBO_BoundTextFieldBoolean,
    NBO_BoundTextFieldDate,
    NBO_BoundTextFieldNumber,
    NBO_BoundTextFieldPassword,
    NBO_BoundTextFieldString,
    NBO_BoundTimePicker,
    NBO_BoundTreeContainer,
    NBO_ActionToolbarButton,
    NBO_ActionToolbarComboBox,
    NBO_ActionToolbarDropDownButton,
    NBO_ActionToolbarLabel,
    NBO_ActionToolbarNavigationBar,
    NBO_ActionToolbarProgressBar,
    NBO_ActionToolbarSeparator,
    NBO_ActionToolbarTextBox,
    NBO_Section,
    NBOHidden
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
 * This function uses methods provided by the {@link NextBOPublicRegistrationContainer} class.
 */
export function registerAppDefaultComponent(): void {
    NextBOPublicRegistrationContainer.registerEntry("uiComponents",
        createRegistrationEntry({_registrationName: NextBOComponents.nboStringTextField, component: NBO_BoundTextFieldString}));
    NextBOPublicRegistrationContainer.registerEntry("uiComponents",
        createRegistrationEntry({_registrationName: NextBOComponents.nboPasswordTextField, component: NBO_BoundTextFieldPassword}));
    NextBOPublicRegistrationContainer.registerEntry("uiComponents",
        createRegistrationEntry({_registrationName: NextBOComponents.nboNumberTextField, component: NBO_BoundTextFieldNumber}));
    NextBOPublicRegistrationContainer.registerEntry("uiComponents",
        createRegistrationEntry({_registrationName: NextBOComponents.nboDateTextField, component: NBO_BoundTextFieldDate}));
    NextBOPublicRegistrationContainer.registerEntry("uiComponents",
        createRegistrationEntry({_registrationName: NextBOComponents.nboBooleanTextField, component: NBO_BoundTextFieldBoolean}));
    NextBOPublicRegistrationContainer.registerEntry("uiComponents",
        createRegistrationEntry({_registrationName: NextBOComponents.nboTextArea, component: NBO_BoundTextArea}));
    NextBOPublicRegistrationContainer.registerEntry("uiComponents",
        createRegistrationEntry({_registrationName: NextBOComponents.nboLabel, component: NBO_BoundLabel}));
    NextBOPublicRegistrationContainer.registerEntry("uiComponents",
        createRegistrationEntry({_registrationName: NextBOComponents.nboLink, component: NBO_BoundLink}));
    NextBOPublicRegistrationContainer.registerEntry("uiComponents",
        createRegistrationEntry({_registrationName: NextBOComponents.nboCheckbox, component: NBO_BoundCheckBox}));
    NextBOPublicRegistrationContainer.registerEntry("uiComponents",
        createRegistrationEntry({_registrationName: NextBOComponents.nboCombobox, component: NBO_BoundComboBox}));
    NextBOPublicRegistrationContainer.registerEntry("uiComponents",
        createRegistrationEntry({_registrationName: NextBOComponents.nboSection, component: NBO_Section}));
    NextBOPublicRegistrationContainer.registerEntry("uiComponents",
        createRegistrationEntry({_registrationName: NextBOComponents.nboDatePicker, component: NBO_BoundDatePicker}));
    NextBOPublicRegistrationContainer.registerEntry("uiComponents",
        createRegistrationEntry({_registrationName: NextBOComponents.nboHidden, component: NBOHidden}));
    NextBOPublicRegistrationContainer.registerEntry("uiComponents",
        createRegistrationEntry({_registrationName: NextBOComponents.nboTimePicker, component: NBO_BoundTimePicker}));
    NextBOPublicRegistrationContainer.registerEntry("uiComponents",
        createRegistrationEntry({_registrationName: NextBOComponents.nboButton, component: NBO_BoundButton}));
    NextBOPublicRegistrationContainer.registerEntry("uiComponents",
        createRegistrationEntry({_registrationName: NextBOComponents.nboSubForm, component: NBO_BoundSubForm}));
    NextBOPublicRegistrationContainer.registerEntry("uiComponents",
        createRegistrationEntry({_registrationName: NextBOComponents.nboImage, component: NBO_BoundImageUpload}));
    NextBOPublicRegistrationContainer.registerEntry("uiComponents",
        createRegistrationEntry({_registrationName: NextBOComponents.nboTree, component: NBO_BoundTreeContainer}));

    NextBOPublicRegistrationContainer.registerEntry("uiToolbarComponents",
        createRegistrationEntry({_registrationName: NextBOComponents.nboToolbarButton, component: NBO_ActionToolbarButton}));
    NextBOPublicRegistrationContainer.registerEntry("uiToolbarComponents",
        createRegistrationEntry({_registrationName: NextBOComponents.nboToolbarComboBox, component: NBO_ActionToolbarComboBox}));
    NextBOPublicRegistrationContainer.registerEntry("uiToolbarComponents",
        createRegistrationEntry({_registrationName: NextBOComponents.nboToolbarDropDownButton, component: NBO_ActionToolbarDropDownButton}));
    NextBOPublicRegistrationContainer.registerEntry("uiToolbarComponents",
        createRegistrationEntry({_registrationName: NextBOComponents.nboToolbarLabel, component: NBO_ActionToolbarLabel}));
    NextBOPublicRegistrationContainer.registerEntry("uiToolbarComponents",
        createRegistrationEntry({_registrationName: NextBOComponents.nboToolbarNavigationBar, component: NBO_ActionToolbarNavigationBar}));
    NextBOPublicRegistrationContainer.registerEntry("uiToolbarComponents",
        createRegistrationEntry({_registrationName: NextBOComponents.nboToolbarProgressBar, component: NBO_ActionToolbarProgressBar}));
    NextBOPublicRegistrationContainer.registerEntry("uiToolbarComponents",
        createRegistrationEntry({_registrationName: NextBOComponents.nboToolbarSeparator, component: NBO_ActionToolbarSeparator}));
    NextBOPublicRegistrationContainer.registerEntry("uiToolbarComponents",
        createRegistrationEntry({_registrationName: NextBOComponents.nboToolbarTextBox, component: NBO_ActionToolbarTextBox}));
    
    NextBOPublicRegistrationContainer.registerEntry("uiActionComponents",
        createRegistrationEntry({_registrationName: '_all__newObject', component: NewObjectToolbarButton}));
    NextBOPublicRegistrationContainer.registerEntry("uiActionComponents",
        createRegistrationEntry({_registrationName:'_all__readWriteModeButton', component: ReadWriteModeToolbarButton}));
    NextBOPublicRegistrationContainer.registerEntry("uiActionComponents",
        createRegistrationEntry({_registrationName:'_all__inLineEdit', component: InLineEditGridViewButton}));
    NextBOPublicRegistrationContainer.registerEntry("uiActionComponents",
        createRegistrationEntry({_registrationName:'_all__gotoDetailView', component: GotoDetailGridViewButton}));
    NextBOPublicRegistrationContainer.registerEntry("uiActionComponents",
        createRegistrationEntry({_registrationName:'_all__saveObject', component: SaveObjectToolbarButton}));
    NextBOPublicRegistrationContainer.registerEntry("uiActionComponents",
        createRegistrationEntry({_registrationName:'_all__undoInLineEdit', component: UndoInLineEditGridViewButton}));
    NextBOPublicRegistrationContainer.registerEntry("uiActionComponents",
        createRegistrationEntry({_registrationName:'_all__undo_redo', component: UndoRedoToolbarButton}));
    NextBOPublicRegistrationContainer.registerEntry("uiActionComponents",
        createRegistrationEntry({_registrationName:'_all_rwModeLabel', component: ReadWriteModeToolbarLabel}));
    NextBOPublicRegistrationContainer.registerEntry("uiActionComponents",
        createRegistrationEntry({_registrationName:'_all__delete', component: DeleteObjectToolbarButton}));
    NextBOPublicRegistrationContainer.registerEntry("uiActionComponents",
        createRegistrationEntry({_registrationName:'_all_viewModeComboBox', component: ViewModeToolbarCombobox}));
    NextBOPublicRegistrationContainer.registerEntry("uiActionComponents",
        createRegistrationEntry({_registrationName:'_all_defaultViewMode', component: DefaultViewModeToolbarButton}));
    NextBOPublicRegistrationContainer.registerEntry("uiActionComponents",
        createRegistrationEntry({_registrationName:'_all__gridView', component: GridViewModeToolbarButton}));

}
