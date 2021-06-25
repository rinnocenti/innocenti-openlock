import { SETTINGS } from './settings.js';
export class GMActions {
    constructor(data = {}) {
        this.data = data;
        this.targetToken = canvas.tokens.get(data.targetid);
        this.token = canvas.tokens.get(data.tokenid);
        this.actor = game.actors.contents.find(a => a.id === this.token.actor.id);
    }

    async Init() {
        await this.ShowDoor();
        await this.OpenDoor();
        await this.SetPermission();
        await this.TriggerTrap();
        if (this.data.tool.have && this.data.tool.broke) {
            await this.RemoveItem(this.token, this.data.tool.have);
            this.data.tool.have = false;
            this.data.tool.broke = false;
        }
        if (game.settings.get(SETTINGS.MODULE_NAME, "removeLock") && this.data.lock.have && (this.data.lock.broke || this.data.lock.disarm)) {
            await this.RemoveItem(this.targetToken, this.data.lock.have);
        }
        await this.SetFlags();
    }

    async SetFlags() {
        console.log(this.targetToken, "target");
        await this.targetToken.document.setFlag(SETTINGS.MODULE_NAME, this.actor.id, this.data);
        console.log("SALVANDO FLAGS...", this.data);
    }

    async SetPermission() {
        let entityTarget = await game.actors.contents.find(a => a.id === this.targetToken.actor.id);
        this.perm = entityTarget.data.permission;
        // Se já tenho permissão não preciso testar nada.
        if (this.data.door.have) return;
        if (this.perm[`${this.data.userid}`] && this.perm[`${this.data.userid}`] >= 2) return;
        if (!this.data.lock.have || this.data.keys.have || this.data.lock.disarm || this.data.lock.broke && !game.users.get(this.data.userid).isGM) {
            if (!this.targetToken.actor) return ui.notifications.error(`Permission: Actor of ${this.data.targetid} not found`);
            let newpermissions = duplicate(this.targetToken.actor.data.permission);
            newpermissions[`${this.data.userid}`] = 2;
            let permissions = new PermissionControl(this.targetToken.actor);
            await permissions._updateObject(event, newpermissions);
        }
    }

    async TriggerTrap() {
        if (this.perm[`${this.data.userid}`] && this.perm[`${this.data.userid}`] >= 2) return;
        let tokenitem = await this.targetToken.actor.items.find(a => a.id === this.data.lock.have);
        if (this.data.trap.trigger && tokenitem.data.data.actionType !== '') {
            await new MidiQOL.TrapWorkflow(this.targetToken.actor, tokenitem, [this.token], this.targetToken.center);
            let updates = await this.targetToken.actor.items.map(itemup => {
                if (itemup.name === tokenitem.name)
                    return { id: itemup.id, data: { actionType: "" } }
                else
                    return { id: itemup.id }
            });
            if (game.modules.get('dice-so-nice')?.active) {
                Hooks.on('diceSoNiceRollComplete', (messageId) => {
                    this.targetToken.actor.updateEmbeddedDocuments("Item", updates);
                });
            } else {
                await setTimeout(function () { this.targetToken.actor.updateEmbeddedDocuments("Item", updates); }, 2000);
            }
            this.data.trap.trigger = false;
        }
    }

    async RemoveItem(token, itemid) {
        let itemtools = token.actor.items.get(itemid);
        let itemEb = token.actor.updateEmbeddedDocuments("Item", [itemtools.id]);
        if (itemEb.data.quantity - 1 >= 1) {
            let update = { id: itemtools.id, "data.quantity": itemEb.data.quantity - 1 };
            await token.actor.updateEmbeddedDocuments("Item", [update]);
        } else {
            await itemtools.delete();
        }
    }

    async ShowDoor() {
        if (!this.data.door.have || !this.data.door.found) return;
        let door = canvas.walls.get(this.data.door.have);
        if (!door) return;
        if (this.data.door.found && door.data.door == CONST.WALL_DOOR_TYPES.SECRET) {
            this.data.door.secret = CONST.WALL_DOOR_TYPES.DOOR;
            await door.update({ door: CONST.WALL_DOOR_TYPES.DOOR });
        }
    }

    async OpenDoor() {
        if (!this.data.lock.have || this.data.keys.have || this.data.lock.disarm || this.data.lock.broke) {
            let door = canvas.walls.get(this.data.door.have);
            if (!door) return;
            if ((this.data.door.found && door.data.door == CONST.WALL_DOOR_TYPES.SECRET) || door.data.door != CONST.WALL_DOOR_TYPES.SECRET) {
                let ds = (this.data.door.locked == CONST.WALL_DOOR_STATES.LOCKED) ? CONST.WALL_DOOR_STATES.OPEN : CONST.WALL_DOOR_STATES.CLOSED//this.data.door.locked;
                ds = (this.data.lock.broke) ? CONST.WALL_DOOR_STATES.OPEN : ds;
                console.log(door, "DOOR")
                await door.document.update({ ds: ds });
            }
        }
    }
}