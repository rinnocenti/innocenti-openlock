const MODULE_NAME = 'innocenti-openlock';
export class GMActions {
    constructor(data = {}) {
        this.data = data;
        this.targetToken = canvas.tokens.get(data.targetid);
        this.token = canvas.tokens.get(data.tokenid);
        this.actor = game.actors.entities.find(a => a.id === this.token.actor.id);
        

        //if (!game.user.isGM) {
        //    data.tokenid = tokenid;
        //    data.targetid = targetid;
        //    data.userid = game.user.id;
        //    game.socket.emit(`module.${MODULE_NAME}`, data);
        //}
        //} else {            
        //    this.Init(token, targetToken, actor, data);
        //}
    }

    async Init(token, targetToken, actor, data) {
        await this.SetPermission(targetToken.actor, data);
        await this.TriggerTrap(token, targetToken, data);
        await this.RemoveItem(actor, data.tool.have, data);
        await this.SetFlags(targetToken, actor.id, data);
    }

    async SetFlags() {
        await this.targetToken.setFlag(MODULE_NAME, this.actor.id, this.data);
        console.log("SALVANDO FLAGS...", this.data);
    }

    async SetPermission() {        
        let entityTarget = await game.actors.entities.find(a => a.id === this.targetToken.actor.id);
        let perm = entityTarget.data.permission;
        // Se já tenho permissão não preciso testar nada.
        if (perm[`${this.data.userid}`] && perm[`${this.data.userid}`] >= 2) return;
        console.log("Permission", this.data, this.targetToken.actor);
        if (!this.data.lock.have || this.data.keys.have || this.data.lock.disarm || this.data.lock.broke && !game.users.get(this.data.userid).isGM) {
            if (!this.targetToken.actor) return ui.notifications.error(`Permission: Actor of ${this.data.targetid} not found`);
            let newpermissions = duplicate(this.targetToken.actor.data.permission);
            newpermissions[`${this.data.userid}`] = 2;
            let permissions = new PermissionControl(this.targetToken.actor);
            await permissions._updateObject(event, newpermissions);
        }
    }

    async TriggerTrap() {
        let tokenitem = await this.targetToken.actor.items.find(a => a.id === this.data.lock.have);
        if (this.data.trap.trigger) {
            await new MidiQOL.TrapWorkflow(this.targetToken.actor, tokenitem, [this.token], this.targetToken.center);
            let updates = await this.targetToken.actor.items.map(itemup => {
                if (itemup.name === tokenitem.name)
                    return { _id: itemup.id, data: { actionType: "" } }
                else
                    return { _id: itemup.id }
            });
            if (game.modules.get('dice-so-nice')?.active) {
                Hooks.on('diceSoNiceRollComplete', (messageId) => {
                    this.targetToken.actor.updateEmbeddedEntity("OwnedItem", updates);
                });
            } else {
                await setTimeout(function () { this.targetToken.actor.updateEmbeddedEntity("OwnedItem", updates); }, 2000);
            }
            this.data.trap.trigger = false;
        }
    }

    async RemoveItem(token, itemid) {
        let itemtools = token.actor.items.get(itemid);
            let itemEb = token.actor.getEmbeddedEntity("OwnedItem", itemtools.id);
            if (itemEb.data.quantity - 1 >= 1) {
                let update = { _id: itemtools.id, "data.quantity": itemEb.data.quantity - 1 };
                await token.actor.updateEmbeddedEntity("OwnedItem", update);
            } else {
                await itemtools.delete();
            }
            console.log("perdeu o thivestool", itemtools);
    }
}