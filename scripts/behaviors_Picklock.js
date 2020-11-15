import { SETTINGS } from './settings.js';
import { OpenLock } from './behaviors_OpenLock.js';
import { Behaviors } from './behaviors.js';

export class Picklock extends OpenLock {
    constructor(target, token) {
        super(target, token);
        this.options.action = 'Picklock';
        this.content = '';
    }
    async RealCheck() {
        super.RealCheck();
        if (!this.denied) {
            this.options.lock.attempts += 1;
            if (!this.lock.lock || !this.lock.settings?.enabled || this.options.lock.disarm || this.options.lock.broke) return;
            if (this.options.lock.have && this.lock.tools != undefined) {
                this.roll = true;
                await this.lock.tools.rollToolCheck().then((result) => {
                    if (result.total >= this.lock.settings.openLock) {
                        this.options.lock.disarm = true;
                    } else {
                        if (result.total <= (this.lock.settings.openLock - this.lock.settings.toolsBreak)) {
                            this.options.tool.broke = true;
                        }
                    }
                    if (this.options.trap.have && !this.options.trap.disarm) {
                        this.options.trap.trigger = true;
                    }
                });
                console.log("Fim do roll", this.options);
            } else {
                ui.notifications.warn(game.i18n.format("OpenLock.Errors.notHaveTools", { tools: game.i18n.localize('OpenLock.Settings.ThievesTool') }));
                this.denied = true;
                return;
            }
        }
    }
    async ModelDialog() {}

    async ModelData() {
        super.ModelData();
        let disarmLock = `<p>${game.i18n.localize('OpenLock.MsgChat.ToolOpen')} ${this.SpanColor(this.options.lock.disarm)}</p>`;
        let brokeTool = (this.options.tool.broke) ? `<p><hr/><img src=\"${this.lock.tools.img}\" width=\"30px\" /><strong> ${game.i18n.localize('OpenLock.MsgChat.BreakTools')}</strong></p>` : '';
        let triggerTrap = `<p>${game.i18n.localize('OpenLock.MsgChat.TrapOnOpen')} ${this.SpanColor(this.options.trap.trigger && !this.options.trap.disarm)}</p>`;
        this.content = disarmLock.concat(triggerTrap, brokeTool);
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