import { SETTINGS } from './settings.js';
import { Behaviors, LootLock } from './behaviors.js';
export class FindLockTrap extends Behaviors {
    constructor(target, token) {
        let lock = new LootLock(target, token);
        super(lock, target, token);
        this.options.action = 'FindLockTrap';
        console.log(this.lock);
        this.Check(true);
    }
    Check(distclose = false) {
        // Check a distancia entre tokens
        super.Check(this.target, this.token, distclose);
        if (this.denied) return;
        if (this.options.attemptsChecks >= 1 && !game.settings.get(SETTINGS.MODULE_NAME, "repeatCheck")) {
            ui.notifications.warn(game.i18n.format("OpenLock.Errors.invalidCheck", { token: this.token.name }));
        }
    }
    async RealCheck() {
        // testar passiva para armadilha
        this.options.attemptsChecks++;

        let skills = this.token.actor.data.data.skills;
        if (game.settings.get(SETTINGS.MODULE_NAME, "repeatCheck") || this.options.attemptsChecks <= 1) {
            // passive check
            let passiveDC = (this.lock.lock) ? this.lock.settings.passive : 1000;
            let skillfind = (this.lock.lock) ? this.lock.settings.skillfindTrap : 'prc';
            let findTrap = (this.lock.trap) ? this.lock.settings.findTrap : -1000;

            if (this.lock.door?.id) {
                this.options.lock.found = (this.lock.door?.data?.door == 2) ? false : true;
                this.options.door.found = (this.lock.door?.data?.door == 2) ? false : true;
            } else {
                this.options.lock.found = (this.lock.lock) ? true : false;
            }

            if (passiveDC <= skills['prc'].passive) {
                this.options.keys.found = (this.lock.keylock) ? true : false;
                this.options.trap.found = (this.lock.trap) ? true : false;
                this.options.lock.found = (this.lock.lock) ? true : false;
                if (this.lock.door?.id) this.options.door.found = true;
                return;
            }
            // testar
            this.roll = true;
            await this.token.actor.rollSkill(skillfind).then((result) => {
                if (result.total >= passiveDC) {
                    this.options.lock.found = (this.lock.lock) ? true : false;
                    this.options.keys.found = (this.lock.keylock) ? true : false;
                    if (this.lock.door?.id) this.options.door.found = true;
                }
                if (result.total >= findTrap)
                    this.options.trap.found = (this.lock.trap) ? true : false;
            });
        }
        console.log("Segue adiante", this.options);
    }

    async ModelDialog() { }
    async ModelChatMessager() {
        // è uma porta?
        let foundDoor = (this.lock.door?.id) ? `<p>${game.i18n.localize('OpenLock.MsgChat.Door')}${this.SpanColor(this.options.door.found)}</p>` : '';
        let foundLock = `<p>${game.i18n.localize('OpenLock.MsgChat.hasLock')}${this.SpanColor(this.options.lock.found)}<p>`;
        let haveKey = (this.options.lock.found) ? `<p>${game.i18n.localize('OpenLock.MsgChat.haveKey')}${this.SpanColor(this.options.keys.have)}</p>` : '';
        // achei a chave // sei qual chave usar.
        let imgkey = '';
        if (!this.lock.keylock?.img) {
            let k = game.items.find(key => key.name == this.lock.keylock);
            imgkey = (k) ? `<p><img src=\"${k.img}\" width=\"30px\" />` : '';
        } else {
            imgkey = `<p><img src=\"${this.lock.keylock.img}\" width=\"30px\" />`;
        }
        let foundKey = (this.options.keys.found || this.options.keys.have) ? `${imgkey} <strong>${this.options.keys.name}</strong></p>` : '';
        let foundTrap = `<p>${game.i18n.localize('OpenLock.MsgChat.haveTrap')}${this.SpanColor(this.options.trap.found)}</p>`;
        let content = foundDoor.concat(foundLock, haveKey, foundKey, foundTrap);
        let title = `${game.i18n.localize('OpenLock.MsgChat.SearchTitle')} - ${this.target.name}`;
        if (!this.lock.door || (this.lock.door && this.options.door.found))
            super.ModelChatMessager(title, content);
    }
}