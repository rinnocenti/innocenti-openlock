import { SETTINGS } from './scripts/settings.js';
import { GMActions } from './scripts/gmactions.js';
import { ActionLock } from './scripts/actions.js';
<<<<<<< HEAD
=======
//import { ActionsDialog } from './scripts/actionsDialog.js';
>>>>>>> v.0.2.0
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
<<<<<<< HEAD
    });
});
Hooks.on("renderItemSheet", (app, html, data) => {
    OpenLockTab.bind(app, html, data);
})
window.InnocentiOpenLock = {
    Actions: ActionLock
=======
        
//        if (game.user.isGM) {
//            let actor = game.actors.entities.find(a => a.id === data.actorTargetid);
//            //let item = actor.items.find(a => a.id === data.item_id);
//            let token = canvas.tokens.get(data.token);
//            let targetToken = canvas.tokens.get(data.targetToken);
//            let tokenitem = await targetToken.actor.items.find(a => a.id === data.item_id);
//            let itemflags = tokenitem.data.flags['innocenti-openlock'];
//            if (data.open === true && !game.users.get(data.userid).isGM) {
//                if (!actor) return ui.notifications.error(`Permission: Actor of ${data.actorTargetid} not found`);
//                let newpermissions = duplicate(actor.data.permission);
//                newpermissions[`${data.userid}`] = 2;
//                let permissions = new PermissionControl(actor);
//                await permissions._updateObject(event, newpermissions);
//            }
//            if (data.trap === true && data.disarm === false) {
//                data.disarm = (itemflags.resetTrap == true) ? false : true;
//                //console.log(actor, token);
//                await new MidiQOL.TrapWorkflow(actor, tokenitem, [token], targetToken.center);
//            }
//            if (data.disarm === true) {
//                let updates = targetToken.actor.items.map(itemup => {
//                    if (itemup.name === tokenitem.name)
//                        return { _id: itemup.id, data: { actionType: "" } }
//                    else
//                        return { _id: itemup.id }
//                });
//                targetToken.actor.updateEmbeddedEntity("OwnedItem", updates);
//                await console.log("DESARMOU O LOCK");
//            }
//            if (data.remove === true || game.settings.get("innocenti-openlock", "removeLock") === true) {
//                await setTimeout(function () { tokenitem.delete(); }, 1000);
//                await console.log("REMOVER O LOCK", tokenitem);
//            }
//            if (data.toolsbreak === true) {
//                let tool = await actor.items.find(a => a.name === `Thieves’ Tools` || a.name === game.i18n.localize('OpenLock.Msg.ThievesTools') || a.name === game.settings.get("innocenti-openlock", "nameThievesTool"));
//                let itemEb = actor.getEmbeddedEntity("OwnedItem", tool.id);
//                if (itemEb.data.quantity -1 >= 1) {
//                    let update = { _id: item.id, "data.quantity": itemEb.data.quantity - 1 };
//                    await actor.updateEmbeddedEntity("OwnedItem", update);
//                } else {
//                    await setTimeout(function () { actor.items.find(a => a.name === itemName[i]).delete(); }, 1000);
//                }
//                await console.log("perdeu o thivestool", item);
//            }
//        }
    });
});
Hooks.on("renderItemSheet", (app, html, data) => {
    //const element = html.find(`select[name="data.consumableType"]`);
    //element.append($(
    //    `<option value=\"lock\">${game.i18n.localize('OpenLock.MsgDialog.ConsumableLock')}</option>`
    //));
    OpenLockTab.bind(app, html, data);
})
window.InnocentiOpenLock = {
    //Chest: OpenLock,
    Actions: ActionLock,
    //Dialogs: ActionsDialog
    //Door: Door
>>>>>>> v.0.2.0
}