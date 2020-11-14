export let SETTINGS = {
    MODULE_NAME: 'innocenti-openlock',
    LOOT_SHEET: 'lootsheettype',
    MODULE_LOOT_SHEET: 'lootsheetnpc5e',
    TYPE_LOOT_SHEET: 'Loot',
    THIEVESTOOLS: 'Thieves’ Tools'
}

Hooks.once("init", () => {
    const defultTool = game.i18n.localize('OpenLock.Settings.ThievesTool');
    game.settings.register(SETTINGS.MODULE_NAME, "nameThievesTool", {
        name: game.i18n.localize('OpenLock.Settings.ThievesToolTitle'),
        hint: game.i18n.localize('OpenLock.Settings.ThievesToolHint'),
        scope: "world",
        config: true,
        default: "Thieves’ Tools",
        type: String
    });
    game.settings.register(SETTINGS.MODULE_NAME, "perceptionDistance", {
        name: game.i18n.localize('OpenLock.Settings.perceptionDistance'),
        hint: game.i18n.localize('OpenLock.Settings.perceptionDistanceHint'),
        scope: "world",
        config: true,
        default: 3,
        type: Number
    });
    game.settings.register(SETTINGS.MODULE_NAME, "interactDistance", {
        name: game.i18n.localize('OpenLock.Settings.interactDistance'),
        hint: game.i18n.localize('OpenLock.Settings.interactDistanceHint'),
        scope: "world",
        config: true,
        default: 1,
        type: Number
    });
    game.settings.register(SETTINGS.MODULE_NAME, "removeLock", {
        name: game.i18n.localize('OpenLock.Settings.removeLock'),
        hint: game.i18n.localize('OpenLock.Settings.removeLockHint'),
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });
    game.settings.register(SETTINGS.MODULE_NAME, "repeatCheck", {
        name: game.i18n.localize('OpenLock.Settings.repeatCheck'),
        hint: game.i18n.localize('OpenLock.Settings.repeatCheckHint'),
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });
});