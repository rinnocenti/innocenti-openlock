Hooks.once("init", () => {
    const defultTool = game.i18n.localize('OpenLock.Settings.ThievesTool');
    game.settings.register("innocenti-openlock", "nameThievesTool", {
        name: game.i18n.localize('OpenLock.Settings.ThievesToolTitle'),
        hint: game.i18n.localize('OpenLock.Settings.ThievesToolHint'),
        scope: "world",
        config: true,
        default: "Thieves’ Tools",
        type: String
    });
    game.settings.register("innocenti-openlock", "perceptionDistance", {
        name: game.i18n.localize('OpenLock.Settings.perceptionDistance'),
        hint: game.i18n.localize('OpenLock.Settings.perceptionDistanceHint'),
        scope: "world",
        config: true,
        default: 3,
        type: Number
    });
    game.settings.register("innocenti-openlock", "interactDistance", {
        name: game.i18n.localize('OpenLock.Settings.interactDistance'),
        hint: game.i18n.localize('OpenLock.Settings.interactDistanceHint'),
        scope: "world",
        config: true,
        default: 1,
        type: Number
    });
    game.settings.register("innocenti-openlock", "removeLock", {
        name: game.i18n.localize('OpenLock.Settings.removeLock'),
        hint: game.i18n.localize('OpenLock.Settings.removeLockHint'),
        scope: "world",
        config: true,
        default: false,
        type: Boolean
    });
    //game.settings.register("innocenti-openlock", "resetTrap", {
    //    name: game.i18n.localize('OpenLock.Settings.resetTrap'),
    //    hint: game.i18n.localize('OpenLock.Settings.resetTrapHint'),
    //    scope: "world",
    //    config: true,
    //    default: false,
    //    type: Boolean
    //});
});