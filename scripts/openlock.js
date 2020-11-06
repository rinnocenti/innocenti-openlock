import { DialogActions } from './openlockDialogs.js';
const moduleName = 'innocenti-openlock'
export class ActionLock {
    constructor(actions) {
        if (canvas.tokens.controlled.length === 0) {
            return ui.notifications.error(game.i18n.localize('OpenLock.Errors.noSelect'));
        }
        if (!game.user.targets.values().next().value) {
            return ui.notifications.warn(game.i18n.localize('OpenLock.Errors.noToken'));
        }
        this.actor = canvas.tokens.controlled[0].actor;
        this.options = {};
        for (this.targetToken of game.user.targets) {
            if (this.targetToken.actor.getFlag('lootsheetnpc5e', 'lootsheettype') !== 'Loot')
                return ui.notifications.info(`${this.targetToken.name} ${game.i18n.localize('OpenLock.Errors.novalidLoot')}`);
            if (!CheckDistance(this.targetToken, (actions == 'FindLockTrap'))) return;
            this.HasLock(this.targetToken, this.actor);
            this[actions]().then();
            console.log("Espera terminar");
        }
    }
    HasLock(targetToken, personActor) {
        this.hasLock = targetToken.actor.items.find(a => a.data.flags['innocenti-openlock']);
        this.hasTools = personActor.items.find(a => a.name === `Thieves’ Tools` || a.name === game.i18n.localize('OpenLock.Msg.ThievesTools') || a.name === game.settings.get("innocenti-openlock", "nameThievesTool"));
        if (this.hasLock) {
            this.openlockFlags = this.hasLock.data.flags['innocenti-openlock'];
            this.haveKey = (this.openlockFlags.keylock !== '') ? personActor.items.find(item => item.name === `${this.openlockFlags.keylock}`) : false;
            this.hasTrap = (this.hasLock.data.data.actionType !== '') ? true : false;
        }
    }

    async FindLockTrap() {
        // Testar passiva para Tranca e chave
        //if (this.targetToken.getFlag(`${moduleName}`, `foundTrap.${this.actor.id}`)) return console.log(this.actor.name + " Já usou a busca");
        this.options['foundLock'] = false;
        this.options['foundKey'] = false;
        let roll = false;
        console.log("Check PPassive", this.actor.data.data.skills['prc'].passive, 10);
        if (this.actor.data.data.skills['prc'].passive >= 10) {
            this.options['foundLock'] = (this.hasLock) ? true : false;
            this.options['foundKey'] = (this.hasLock && this.haveKey) ? true : false;
        }
        // testar passiva para armadilha
        this.options['foundTrap'] = (this.targetToken.getFlag(`${moduleName}`, `foundTrap.${this.actor.id}`)) ? true : false;
        if (!this.options['foundTrap'] && this.openlockFlags && this.openlockFlags.enabled) {
            console.log("Check PPassive", this.actor.data.data.skills['prc'].passive, this.openlockFlags.findTrap);
            if (this.actor.data.data.skills['prc'].passive >= this.openlockFlags.findTrap) {
                this.options['foundTrap'] = (this.hasTrap) ? true : false;
            } else {
                roll = true;
                await this.actor.rollSkill('prc').then((result) => {
                    console.log("Check Percepção", result.total, this.openlockFlags.findTrap);
                    if (result.total >= this.openlockFlags.findTrap) {
                        this.options['foundTrap'] = (this.hasTrap) ? true : false;
                    }
                });
            }
        }
        // Registrar no TARGET o que encontrou.
        //// TODO melhorar isso 
        if (roll && game.modules.get('dice-so-nice')?.active) {
            Hooks.on('diceSoNiceRollComplete', (messageId) => {
                this.FindChatResults(game.i18n.localize('OpenLock.MsgChat.SearchTitle'));
            });
        } else {
            this.FindChatResults(game.i18n.localize('OpenLock.MsgChat.SearchTitle'));
        }
        await GMActions({
            actorid: this.actor.id,
            tokenTargetId: this.targetToken.id,
            trap: { found: this.options['foundTrap'], have: this.hasTrap },
            keys: { found: this.options['foundKey'], have: this.haveKey?.id },
            lock: { found: this.options['foundLock'], have: this.hasLock?.id },
            action: 'FindLockTrap'
        })
        console.log('Find Trap and Locks', this);
    }
    async FindChatResults(title) {
        let foundLock = `<p>${game.i18n.localize('OpenLock.MsgChat.hasLock')}${spanColor(this.options['foundLock'])}<p>`;
        let nkey = (this.openlockFlags) ? this.openlockFlags?.keylock : this.openlockFlags;
        let needKey = `<p>${game.i18n.localize('OpenLock.MsgChat.NeedKey')}${spanColor(nkey)}<p>`;
        let foundKey = (this.haveKey) ? `<p><img src=\"${this.haveKey.img}\" width=\"30px\" /><strong>${this.haveKey.name}</strong><p>` : '';
        let foundTrap = `<p>${game.i18n.localize('OpenLock.MsgChat.haveTrap')}${spanColor(this.options['foundTrap'])}<p>`;
        let content = foundLock.concat(needKey, foundKey, foundTrap)
        await this.ChatResults(title, content);
    }

    async ChatResults(title, content) {
        await ChatMessage.create({
            content: content,
            type: CONST.CHAT_MESSAGE_TYPES.EMOTE,
            speaker: ChatMessage.getSpeaker(),
            flavor: `<h2>${title}</h2>`
        });
    }
}
///// TOOLS /////
export async function GMActions(data = {}) {
    if (!game.user.isGM) {
        await game.socket.emit(`module.${moduleName}`, data);
    } else {
        console.log("SALVANDO...", data);
        if (data.action === 'FindLockTrap') {
            let targetToken = canvas.tokens.get(data.tokenTargetId);
            if (data.trap.found && !targetToken.getFlag(`${moduleName}`, `foundTrap.${data.actorid}`)) {
                targetToken.setFlag(`${moduleName}`, `foundTrap.${data.actorid}`, true);
                console.log("flag save");
            }
        }
    }
}
let spanColor = (test, positive = game.i18n.localize('OpenLock.MsgChat.Yes'), negative = game.i18n.localize('OpenLock.MsgChat.No')) => {
    let color = (test) ? "style=\"color: green\"" : "style=\"color: red\"";
    return `<span ${color}>${(test) ? positive : negative}</span>`;
}
function CheckDistance(targetToken, distClose = false) {
    let minDistance = (distClose) ? game.settings.get("innocenti-openlock", "perceptionDistance") : game.settings.get("innocenti-openlock", "interactDistance");
    let gridDistance = (minDistance < 1) ? 1 : minDistance;
    // minimo de distancia 1
    let distance = Math.ceil(canvas.grid.measureDistance(canvas.tokens.controlled[0], targetToken, { gridSpaces: true }));
    let nGrids = Math.floor(distance / canvas.scene.data.gridDistance);
    if (nGrids <= gridDistance) return true;
    ui.notifications.warn(game.i18n.format("OpenLock.Errors.invalidDistance", { dist: gridDistance }));
    return false;
}