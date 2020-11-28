import { SETTINGS } from './scripts/settings.js';
import { GMActions } from './scripts/gmactions.js';
import { ActionLock } from './scripts/actions.js';
import { OpenLockTab } from "./scripts/openlocktab.js";

Hooks.once("init", async () => {
    game.socket.on(`module.${SETTINGS.MODULE_NAME}`, async (data) => {
        if (game.user.isGM) {
            let gmaction = new GMActions(data);
            await gmaction.Init();
        }
    });
});
Hooks.on("renderItemSheet", (app, html, data) => {
    OpenLockTab.bind(app, html, data);
});

window.InnocentiOpenLock = {
    Actions: ActionLock
}