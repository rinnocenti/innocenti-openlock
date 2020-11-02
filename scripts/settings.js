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
    game.settings.register("innocenti-openlock", "nameTrapLockFeat", {
        name: game.i18n.localize('OpenLock.Settings.TrapFeatTitle'),
        hint: game.i18n.localize('OpenLock.Settings.TrapFeatHint'),
        scope: "world",
        config: true,
        default: "Trap",
        type: String
    });
    game.settings.register("innocenti-openlock", "nameLockFeat", {
        name: game.i18n.localize('OpenLock.Settings.LockFeatTitle'),
        hint: game.i18n.localize('OpenLock.Settings.LockFeatHint'),
        scope: "world",
        config: true,
        default: "Lock",
        type: String
    });
    game.settings.register("innocenti-openlock", "defaultStrenght", {
        name: game.i18n.localize('OpenLock.Settings.defaultStrenght'),
        hint: game.i18n.localize('OpenLock.Settings.defaultStrenghtHint'),
        scope: "world",
        config: true,
        default: 12,
        type: Number
    });
    game.settings.register("innocenti-openlock", "defaultDexterity", {
        name: game.i18n.localize('OpenLock.Settings.defaultDexterity'),
        hint: game.i18n.localize('OpenLock.Settings.defaultDexterityHint'),
        scope: "world",
        config: true,
        default: 10,
        type: Number
    });
    game.settings.register("innocenti-openlock", "defaultPerception", {
        name: game.i18n.localize('OpenLock.Settings.defaultPerception'),
        hint: game.i18n.localize('OpenLock.Settings.defaultPerceptionHint'),
        scope: "world",
        config: true,
        default: 10,
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
});