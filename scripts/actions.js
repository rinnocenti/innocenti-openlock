import { SETTINGS } from './settings.js';
import { GMActions } from './gmactions.js';
import { FindLockTrap } from './behaviors_FindLockTrap.js';
import { OpenLock } from './behaviors_OpenLock.js';
import { DisarmTraps } from './behaviors_DisarmTraps.js';
import { Picklock } from './behaviors_Picklock.js';

export class ActionLock {
    constructor(behaviors) {
        if (canvas.tokens.controlled.length === 0) {
            return ui.notifications.error(game.i18n.localize('OpenLock.Errors.noSelect'));
        }
        if (!game.user.targets.values().next().value) {
            return ui.notifications.warn(game.i18n.localize('OpenLock.Errors.noToken'));
        }
        this.token = canvas.tokens.controlled[0];
        this.Actions(behaviors);
    }

    async Actions(behaviors) {
        for (let targetToken of game.user.targets) {
            if (targetToken.actor.getFlag(SETTINGS.MODULE_LOOT_SHEET, SETTINGS.LOOT_SHEET) !== SETTINGS.TYPE_LOOT_SHEET)
                return ui.notifications.info(`${targetToken.name} ${game.i18n.localize('OpenLock.Errors.novalidLoot')}`);
            let actions = eval(behaviors);
            let action = new actions(targetToken, this.token);
            await action.RealCheck();
            //await action.ModelDialog();
            await action.ModelData();            
            if (game.modules.get('dice-so-nice')?.active && action.roll) {
                Hooks.on('diceSoNiceRollComplete', (messageId) => {
                    if (!this.msg) {
                        action.ModelDialog();
                        this.msg = messageId;
                        console.log("DICESONICE:", messageId);
                        action.ModelChatMessager();
                    }
                });
            } else {
                await action.ModelDialog();
                await action.ModelChatMessager();
            }
            if(!action.denied)
            await game.socket.emit(`module.${SETTINGS.MODULE_NAME}`, action.options);
            console.log("Depois do GM", action);
        }
    }

}