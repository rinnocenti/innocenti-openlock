export class DialogActions {
    constructor(title, content) {
        this.dialogBase = this.BaseDialog(title, content);
    }
    BaseDialog(title, content, close) {
        let base = {
            title: title,
            content: content,
            close: () => close
        }
        return base;
    }
    async DialogCheckTrapsButton(callOpen, callDisarm) {
        let btnone = this.ButtonOpenLock(callOpen);
        let btntwo = (count[1] !== undefined && count[1] === 'dex') ? this.ButtonTools(calldex) : this.ButtonKey(callkey);
        let btntree = this.ButtonKey(callkey);
        let a;
        if (count.length < 2) a = { buttons: { one: btnone }, default: 'one' };
        if (count.length == 2) a = { buttons: { one: btnone, two: btntwo }, default: 'one' };
        if (count.length > 2) a = { buttons: { one: btnone, two: btntwo, tree: btntree }, default: 'one' };
        this.dialogBase = Object.assign(this.dialogBase, a);
    }
    ButtonOpenLock(callback) {
        let a = {
            icon: '<i class="fas fa-unlock"></i>',
            label: game.i18n.localize('OpenLock.Btn.OpenChest'),
            callback: callback
        }
        return a;
    }
    ButtonDisarmTrap(callback) {
        let a = {
            icon: '<i class="fas fa-cogs"></i>',
            label: game.i18n.localize('OpenLock.Btn.DisarmTrap'),
            callback: callback
        }
        return a;
    }
    ButtonBreakLock(callback) {
        let a = {
            icon: '<i class="fas fa-fist-raised"></i>',
            label: game.i18n.localize('OpenLock.Btn.Strangth'),
            callback: callback
        }
        return a;
    }
    ButtonPickLock(callback) {
        let a = {
            icon: '<i class="fas fa-user-lock"></i>',
            label: game.i18n.localize('OpenLock.Btn.ThievesTools'),
            callback: callback
        }
        return a;
    }
}