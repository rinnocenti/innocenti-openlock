import { OpenLock, CheckForTraps } from './scripts/openchest.js';
import { Door } from './scripts/opendoor.js';

Hooks.once("init", async () => {
    game.socket.on(`module.innocenti-openlock`, async (data) => {
        console.log(data);
        if (game.user.isGM) {
            let actor = game.actors.entities.find(a => a.id === data.actorTargetid);
            //let item = actor.items.find(a => a.id === data.item_id);
            let token = canvas.tokens.get(data.token);
            let targetToken = canvas.tokens.get(data.targetToken);
            let tokenitem = targetToken.actor.items.find(a => a.id === data.item_id);
            if (data.open === true) { 
                if (!actor) return ui.notifications.error(`Permission: Actor of ${data.actorTargetid} not found`);
                let newpermissions = duplicate(actor.data.permission);
                newpermissions[`${data.userid}`] = 2;
                let permissions = new PermissionControl(actor);
                await permissions._updateObject(event, newpermissions);
            }
            if (data.trap === true && data.disarm === false) {
                data.disarm = true;
                await new MidiQOL.TrapWorkflow(actor, tokenitem, [token], targetToken.center);
            }
            if (data.disarm === true) {
                data.trap = false;
                console.log(tokenitem);
                let updates = targetToken.actor.items.map(itemup => {
                    if (itemup.name === tokenitem.name)
                        return { _id: itemup.id, data: { actionType: "" } }
                    else
                        return { _id: itemup.id }
                });
                targetToken.actor.updateEmbeddedEntity("OwnedItem", updates);
                await console.log("DESARMOU O LOCK");
            }
            
            if (data.remove === true || game.settings.get("innocenti-openlock", "removeLock") === true) {
                await tokenitem.delete();
                await console.log("REMOVER O LOCK", tokenitem);
            }
        }
    });
});
window.InnocentiOpenLock = {
    Chest: OpenLock,
    CheckTraps: CheckForTraps,
    Door: Door
}