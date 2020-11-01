import { Chest } from './scripts/openchest.js';
import { Door } from './scripts/opendoor.js';

Hooks.once("init", async () => {
    game.socket.on(`module.innocenti-openlock`, (data) => {
        let actor = game.actors.entities.find(a => a.name === data.token);
        if (!actor) return ui.notifications.error(`Permission: Actor of ${data.token} not found`);
        let newpermissions = duplicate(actor.data.permission);
        newpermissions[`${data.userid}`] = 2;
        let permissions = new PermissionControl(actor);
        permissions._updateObject(event, newpermissions);
    });
});
window.InnocentiOpenLock = {
    Chest: Chest,
    Door: Door
}