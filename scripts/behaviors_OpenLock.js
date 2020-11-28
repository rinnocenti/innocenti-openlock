import { SETTINGS } from './settings.js';
import { Behaviors, LootLock } from './behaviors.js';

export class OpenLock extends Behaviors {
    constructor(target, token) {
        let lock = new LootLock(target, token);
        super(lock, target, token);
        this.options.action = 'OpenLock';
        this.Check();
    }
    async OpenLock() {
        console.log("tentativa de abrir");
        if (this.lock.door) return;
        if (this.lock.lock?.id === undefined || this.lock.keylock?.id !== undefined || this.options.lock.broke || this.options.lock.disarm) {
            await setTimeout(this.target._onClickLeft2(), 3000);
        }
    }
    async Check(distclose = false) {
        super.Check(this.target, this.token, distclose);
    }
    async RealCheck() {
        if (!this.denied) {
            if (this.lock.lock?.id === undefined || this.lock.keylock?.id !== undefined) {
                this.options.lock.disarm = true;
                return;
            }
            if (this.options.lock.broke || this.options.lock.disarm) return;
            if (!game.user.isGM) {
                let permission = await this.CheckPermission(this.target);
                if (permission) return;
            }
        }
    }
    async ModelDialog() {
        if (this.denied || this.options.lock.broke || this.options.lock.disarm) return;
        let dialogData = {
            title: game.i18n.localize("OpenLock.MsgDialog.Title"),
            content: game.i18n.localize("OpenLock.MsgDialog.Content"),
            callClose: () => { },
            buttons: {
                'BreakLock': this.BreakButton
            },
            default: 'BreakLock'
        }
        console.log(this.options);
        if (this.options.tool.have && !this.options.lock.disarm && !this.options.tool.broke) {
            dialogData.buttons['PickLock'] = this.PickButton;
        }
        
        if (this.options.trap.disarm) {
            dialogData.content = dialogData.content + `<p><span style=\"color: green\">${game.i18n.localize("OpenLock.MsgDialog.TrapDisarm")}</span></p>`;
        } else if (this.lock.trap && this.options.trap.found && !this.options.trap.disarm) {
            dialogData.content = dialogData.content + `<p><span style=\"color: red\">${game.i18n.localize("OpenLock.MsgDialog.TrapAlert")}</span></p>`;
            if (this.lock.tools) {
                dialogData.buttons['DisarmTrap'] = this.DisarmButton;
            }
        }
        await super.ModelDialog(dialogData)
        console.log("Depois do dialogo");
    }

    BreakButton() { new InnocentiOpenLock.Actions('Breaklock');}
    PickButton() { new InnocentiOpenLock.Actions('Picklock');}
    DisarmButton() { new InnocentiOpenLock.Actions('DisarmTraps');}

    async ModelChatMessager() {
        if (!this.denied)
        await this.OpenLock();
    }
}