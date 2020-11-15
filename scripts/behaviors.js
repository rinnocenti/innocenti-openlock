import { SETTINGS } from './settings.js';
import { DialogActions } from './openlockDialogs.js';

export class Behaviors {
    constructor(lock, target, token) {
        this.lock = lock;
        this.token = token;
        this.target = target;
        this.roll = false;
        this.denied = false;
        this.options = {
            userid: game.user.id,
            tokenid: token.id,
            targetid: target.id,
            trap: { found: false, have: this.lock.trap || false, disarm: false, trigger: false, attempts: 0 },
            keys: { found: false, have: this.lock.keylock?.id || false },
            lock: { found: false, have: this.lock.lock?.id || false, disarm: false, broke: false, attempts: 0 },
            tool: { have: this.lock.tools?.id || false, broke: false },
            action: '',
            attemptsChecks: 0
        };
    }

    Check(target, token, distclose = false) {
        let distance = this.CheckDistance(target, distclose);
        let flags = target.getFlag(SETTINGS.MODULE_NAME, token.actor.id);
        if (!distance) {
            this.denied = true;
        }

        if (flags !== undefined) {
            this.options.trap = flags.trap;
            this.options.keys = flags.keys;
            this.options.lock = flags.lock;
            this.options.attemptsChecks = flags.attemptsChecks;
        }
    }
    async RealCheck() { }
    async ModelData() {
        this.options = {
            userid: game.user.id,
            tokenid: this.token.id,
            targetid: this.target.id,
            trap: {
                found: this.options.trap.found,
                have: this.lock.trap || false,
                disarm: this.options.trap.disarm || false,
                trigger: this.options.trap.trigger || false,
                attempts: this.options.trap.attempts || 0
            },
            keys: {
                found: this.options.keys.found,
                have: this.lock.keylock?.id || false
            },
            lock: {
                found: this.options.lock.found,
                have: this.lock.lock?.id || false,
                disarm: this.options.lock.disarm || false,
                broke: this.options.lock.broke || false,
                attempts: this.options.lock.attempts || 0
            },
            tool: {
                have: this.lock.tools?.id || false,
                broke: this.options.tool.broke || false
            },
            attemptsChecks: this.options.attemptsChecks,
            action: this.options['action'],
        }
        console.log("DATA", this.options);
    }

    async ModelChatMessager(title, content) {
        if (this.denied == true) return;
        ChatMessage.create({
            content: content,
            type: CONST.CHAT_MESSAGE_TYPES.EMOTE,
            speaker: ChatMessage.getSpeaker(),
            flavor: `<h2>${title}</h2>`
        });
    }
    async ModelDialog(data) {
        if (this.denied == true) return;

        let dialog = new DialogActions(data.title, data.content, data.callClose);
        dialog.DialogButtons(data);

        let d = await new Dialog(dialog.dialogBase);
        await d.render(true);

    }
    CheckDistance(targetToken, distClose = false) {
        let minDistance = (distClose) ? game.settings.get(SETTINGS.MODULE_NAME, "perceptionDistance") : game.settings.get(SETTINGS.MODULE_NAME, "interactDistance");
        let gridDistance = (minDistance < 1) ? 1 : minDistance;
        // minimo de distancia 1
        let distance = Math.ceil(canvas.grid.measureDistance(canvas.tokens.controlled[0], targetToken, { gridSpaces: true }));
        let nGrids = Math.floor(distance / canvas.scene.data.gridDistance);
        if (nGrids <= gridDistance) return true;
        ui.notifications.warn(game.i18n.format("OpenLock.Errors.invalidDistance", { dist: gridDistance }));
        return false;
    }
    SpanColor(test, positive = game.i18n.localize('OpenLock.MsgChat.Yes'), negative = game.i18n.localize('OpenLock.MsgChat.No')) {
        let color = (test) ? "style=\"color: green\"" : "style=\"color: red\"";
        return `<span ${color}>${(test) ? positive : negative}</span>`;
    }
    async CheckPermission(targetToken) {
        let entityTarget = await game.actors.entities.find(a => a.id === targetToken.actor.id);
        let perm = entityTarget.data.permission;
        // Se já tenho permissão não preciso testar nada.
        if (perm[`${game.user.id}`] && perm[`${game.user.id}`] >= 2) return true
        //console.log("N�o tenho permissão");
        return false;
    }
}
export class LootLock {
    constructor(lootToken, charToken) {
        this.lock = lootToken.actor.items.find(a => a.data.flags[SETTINGS.MODULE_NAME]);
        this.tools = this.GetTools(charToken);
        if (this.lock) {
            this.settings = this.lock.data.flags[SETTINGS.MODULE_NAME];
            //console.log('LOCKS', this)
            this.keylock = this.GetLockKey(charToken, this.settings.keylock);
            this.trap = this.GetTrap(this.lock);
        }
    }

    GetTrap(lock) {
        return (lock.data.data.actionType !== '') ? true : false;
    }

    GetLockKey(charToken, keySetting) {
        return (keySetting !== '') ? charToken.actor.items.find(item => item.name === keySetting) || keySetting : false;
    }

    GetTools(charToken) {
        return charToken.actor.items.find(a => a.name === SETTINGS.THIEVESTOOLS || a.name === game.i18n.localize('OpenLock.Msg.ThievesTools') || a.name === game.settings.get(SETTINGS.MODULE_NAME, "nameThievesTool"));
    }
}