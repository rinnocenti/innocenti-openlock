import { SETTINGS } from './settings.js';
import { OpenLock } from './behaviors_OpenLock.js';
import { Behaviors } from './behaviors.js';

export class Breaklock extends OpenLock {
    constructor(target, token) {
        super(target, token);
        this.options.action = 'Breaklock';
        this.content = '';
    }
    async RealCheck() {
        super.RealCheck();
        if (!this.denied) {
            this.options.lock.attempts += 1;
            if (!this.lock.lock || !this.lock.settings?.enabled || this.options.lock.disarm || this.options.lock.broke) return;
            if (this.options.lock.have) {
                this.roll = true;
                await this.token.actor.rollAbilityTest(`str`).then((result) => {
                    if (result.total >= this.lock.settings.forceLock) {
                        this.options.lock.broke = true;
                        this.options.lock.disarm = true;
                        if (this.options.trap.have && result.total >= (this.lock.settings.forceLock + this.lock.settings.toolsBreak)) {
                            this.options.trap.disarm = true;
                        }
                    }
                    if (this.options.trap.have && !this.options.trap.disarm) {
                        this.options.trap.trigger = true;
                    }
                });
                console.log("Fim do roll", this.options);
            } else {
                this.denied = true;
                return;
            }
        }
    }
    async ModelDialog() {}

    async ModelData() {
        super.ModelData();
        let disarmLock = `<p>${game.i18n.localize('OpenLock.MsgChat.ToolOpen')} ${this.SpanColor(this.options.lock.broke)}</p>`;
        let triggerTrap = `<p>${game.i18n.localize('OpenLock.MsgChat.TrapOnOpen')} ${this.SpanColor(this.options.trap.trigger)}</p>`;
        this.content = disarmLock.concat(triggerTrap);
    }

    async ModelChatMessager() {
        if (this.denied) return;
        if (this.options.lock.have) {
            let title = `${game.i18n.localize('OpenLock.MsgChat.OpenTitle')} - ${this.target.name}`;
            Behaviors.prototype.ModelChatMessager(title, this.content);
            await this.OpenLock();
        }
    }
}