import { SETTINGS } from './scripts/settings.js';
import { GMActions } from './scripts/gmactions.js';
import { ActionLock } from './scripts/actions.js';
import { OpenLockTab } from "./scripts/openlocktab.js";

Hooks.once("init", async () => {
    game.socket.on(`module.${SETTINGS.MODULE_NAME}`, async (data) => {
        if (game.user.isGM) {
            let gmaction = new GMActions(data);
            await gmaction.SetPermission();
            await gmaction.TriggerTrap();
            if (data.tool.have && data.tool.broke) {
                await gmaction.RemoveItem(gmaction.token, data.tool.have);
                gmaction.data.tool.have = false;
                gmaction.data.tool.broke = false;
            }
            await gmaction.SetFlags();
        }
    });
});
Hooks.on("renderItemSheet", (app, html, data) => {
    OpenLockTab.bind(app, html, data);
})
window.InnocentiOpenLock = {
    Actions: ActionLock
}