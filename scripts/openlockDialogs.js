export class DialogActions {
    constructor(title, content, callClose) {
        this.dialogBase = this.BaseDialog(title, content, callClose);
    }
    BaseDialog(title, content, callClose) {
        let base = {
            title: title,
            content: content,
            close: callClose
        }
        return base;
    }
    async DialogButtons(data) {
        let btns = {
            buttons: {},
            default: data.default
        }        
        for (let btn in data.buttons) {
            btns.buttons[btn] = this.ButtonOpenLock(btn, data.buttons[btn]);
        }
        this.dialogBase = Object.assign(this.dialogBase, btns);
    }
    ButtonOpenLock(type, callback) {
        let buttonsIcons = {
            'OpenChest': '<i class="fas fa-unlock"></i>',
            'DisarmTrap': '<i class="fas fa-cogs"></i>',
            'BreakLock': '<i class="fas fa-fist-raised"></i>',
            'PickLock': '<i class="fas fa-user-lock"></i>'
        }
        return {
            icon: buttonsIcons[type],
            label: game.i18n.localize(`OpenLock.Btn.${type}`),
            callback: callback
        }
    }
}