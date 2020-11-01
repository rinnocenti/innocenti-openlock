Hooks.once("init", () => {
    game.settings.register("innocenti-openlock", "nameThivesTool", {
        name: game.i18n.localize('OpenLock.Settings.ThievesTool'),
        hint: game.i18n.localize('OpenLock.Settings.ThievesToolHint'),
        scope: "world",
        config: true,
        default: 'Thieves’ Tools',
        type: String
    });
});