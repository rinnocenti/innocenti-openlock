import { SETTINGS } from './settings.js';
import { OpenLock } from './behaviors_OpenLock.js';
import { Behaviors } from './behaviors.js';

export class DisarmTraps extends OpenLock {
    constructor(target, token) {
        super(target, token);
        this.options.action = 'DisarmTraps';
        this.content = '';
    }
    async RealCheck() {
        super.RealCheck();
        if (!this.denied) {
            this.options.trap.attempts = + 1;
            if (!this.lock.trap) return;
            if (this.options.trap.disarm) {
                this.options.trap.trigger = false;
                return;
            } else if (this.options.trap.found && this.options.tool.have) {
<<<<<<< HEAD
                this.roll = true;
                await this.lock.tools.rollToolCheck().then((result) => {
                    if (result.total >= this.lock.settings.disarmTrap) {
                        this.options.trap.disarm = true;
                    } else {
                        if (result.total <= (this.lock.settings.disarmTrap - this.lock.settings.toolsBreak)) {
=======
                console.log(this.options.trap.attempts);
                this.roll = true;
                await this.lock.tools.rollToolCheck().then((result) => {
                    console.log(result.total, this.lock.settings.disarmTrap, this.lock.settings.toolsBreak)
                    if (result.total >= this.lock.settings.disarmTrap) {
                        console.log("Conseguiu desarmar");
                        this.options.trap.disarm = true;
                    } else {
                        if (result.total <= (this.lock.settings.disarmTrap - this.lock.settings.toolsBreak)) {
                            console.log("Quebrou o tools")
>>>>>>> v.0.2.0
                            this.options.tool.broke = true;
                        }
                        this.options.trap.trigger = true;
                        this.options.trap.disarm = (this.lock.settings.resetTrap) ? false : true;
<<<<<<< HEAD
=======
                        console.log("Dispara a armadilha");
>>>>>>> v.0.2.0
                    }
                });
                console.log("Fim do roll", this.options);
            } else {
<<<<<<< HEAD
                if (!this.options.tool.have)
                    ui.notifications.warn(game.i18n.format("OpenLock.Errors.notHaveTools", { tools: game.i18n.localize('OpenLock.Settings.ThievesTool') }));
=======
                ui.notifications.warn(game.i18n.format("OpenLock.Errors.notHaveTools", { tools: game.i18n.localize('OpenLock.Settings.ThievesTool') }));
>>>>>>> v.0.2.0
                this.denied = true;
                return;
            }
        }
    }
    async ModelDialog() {
        if (!this.denied && !this.options.lock.disarm || !this.options.lock.broke)
            super.ModelDialog();
    }

    async ModelData() {
        super.ModelData();
        if (this.options.trap.found || this.options.trap.trigger) {
            let disarmTrap = `<p>${game.i18n.localize('OpenLock.MsgChat.TrapDisarm')} ${this.SpanColor(this.options.trap.disarm)}</p>`;
            let brokeTool = (this.options.tool.broke) ? `<p><hr/><img src=\"${this.lock.tools.img}\" width=\"30px\" /><strong> ${game.i18n.localize('OpenLock.MsgChat.BreakTools')}</strong></p>` : '';
            let triggerTrap = `<p>${game.i18n.localize('OpenLock.MsgChat.TrapOnOpen')} ${this.SpanColor(this.options.trap.trigger)}</p>`;
            this.content = disarmTrap.concat(triggerTrap, brokeTool);
        }
    }

    async ModelChatMessager() {
        if (this.denied) return;
        if (this.options.trap.found || this.options.trap.trigger) {
            let title = `${game.i18n.localize('OpenLock.MsgChat.TitleDisarm')} - ${this.target.name}`;
            Behaviors.prototype.ModelChatMessager(title, this.content);
        }
    }
}