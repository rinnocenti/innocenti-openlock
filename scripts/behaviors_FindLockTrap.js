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
        
        if (!this.lock.lock || this.denied == true || (this.options.attemptsChecks >= 1 && !game.settings.get(SETTINGS.MODULE_NAME, "repeatCheck"))) return;
        //if (!game.settings.get(SETTINGS.MODULE_NAME, "repeatCheck") && this.target.getFlag(SETTINGS.MODULE_NAME, this.token.actor.id) !== undefined) return;
        this.options.attemptsChecks += 1;
        let skills = this.token.actor.data.data.skills;
        if (this.PassiveCheck(skills['prc'].passive, this.lock)) return;

        if (this.options.trap.found !== true && this.lock.settings?.enabled) {
            if (this.token.actor.data.data.skills[this.lock.settings.skillfindTrap].passive >= this.lock.settings.findTrap) {
                this.options.trap.found = (this.lock.trap) ? true : false;
                this.options.lock.found = (this.lock.lock) ? true : false;
                this.options.keys.found = (this.lock?.keylock) ? true : false;
            } else {
                this.roll = true;
                await this.token.actor.rollSkill(this.lock.settings.skillfindTrap).then((result) => {
                    if (result.total >= this.lock.settings.findTrap) {
                        this.options.trap.found = (this.lock.trap) ? true : false;
                        this.options.lock.found = (this.lock.lock) ? true : false;
                        this.options.keys.found = (this.lock?.keylock) ? true : false;
                    }
                });
            }
        }
        console.log("Segue adiante", this.options);
    }
    PassiveCheck(tokenSkill, lock) {
        if (this.denied == true || (this.options.attemptsChecks >= 1 && !game.settings.get(SETTINGS.MODULE_NAME, "repeatCheck"))) return;
        if (tokenSkill >= lock.settings.passive) {
            this.options.lock.found = (lock.lock) ? true : false;
            this.options.keys.found = (lock && lock.keylock) ? true : false;
            return true;
        }
    }
    async ModelDialog() {}
    async ModelChatMessager() {
        let foundLock = `<p>${game.i18n.localize('OpenLock.MsgChat.hasLock')}${this.SpanColor(this.options.lock.found)}<p>`;
        let nkey = (typeof String(this.lock.keylock)) ? this.lock.keylock : this.lock.keylock;
        let needKey = `<p>${game.i18n.localize('OpenLock.MsgChat.NeedKey')}${this.SpanColor(this.lock.keylock)}</p>`;
        let foundKey = (this.options.keys.have) ? `<p><img src=\"${this.lock.keylock.img}\" width=\"30px\" /><strong>${this.lock.keylock.name}</strong></p>` : '';
        let foundTrap = `<p>${game.i18n.localize('OpenLock.MsgChat.haveTrap')}${this.SpanColor(this.options.trap.found)}</p>`;
        let content = foundLock.concat(needKey, foundKey, foundTrap);
        let title = `${game.i18n.localize('OpenLock.MsgChat.SearchTitle')} - ${this.target.name}`;
        super.ModelChatMessager(title, content);
    }
}