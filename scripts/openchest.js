//TODO: Pegar os ND da folha de item
//TODO: Verificar a Distancia dos tokens
export let OpenLock = async function () {
    if (CheckTokentarget() === false) return
    const actor = canvas.tokens.controlled[0].actor;
    for (let targetToken of game.user.targets) {
        // Checagem de distancia:
        if (CheckDistance(targetToken, game.settings.get("innocenti-openlock", "interactDistance")) === false) return;
        if (targetToken.actor.getFlag('lootsheetnpc5e', 'lootsheettype') === 'Loot') {
            if (CheckPermission(targetToken) === true) return setTimeout(function () { targetToken._onClickLeft2() }, 500);
            // Checagem se o loot possui uma tranca a ser aberta.
            let hasLock = await HasLock(targetToken.actor);
            if (hasLock === false) {
                let options = { open: true, trap: false, disarm: false, remove: false };
                let msg = {
                    SearchTitile: game.i18n.localize('OpenLock.MsgChat.OpenTitle'),
                    content: `<p>${game.i18n.localize('OpenLock.MsgChat.NotLock')}</p>`
                }
                await OpenChest(targetToken, hasLock, false, options, msg);
                return;
            }
            //Tem uma trance então verificar se possui a chave ou se precisa de uma.
            // Tem um a tranca, não possuo uma chave, então verificar se há uma armadilha.
            let hasKey = HasKey(hasLock, actor);
            if (hasKey) {
                // Se precisa de uma chave e eu tenho a chave não preciso checar mais nada.
                let options = { open: true, trap: false, disarm: false, remove: false }
                let msg = {
                    SearchTitile: game.i18n.localize('OpenLock.MsgChat.OpenTitle'),
                    content: `<hr /><h4>${game.i18n.localize('OpenLock.MsgChat.Used')} <img src=\"${hasKey.img}\" width=\"30px\" /> ${hasKey.name}</h4>`
                }
                await OpenChest(targetToken, hasLock, hasKey, options, msg);
                return;
            }
            let hasOpen = false; let trapDisarm = false; let trapRemove = false; let toolsbreak = false;// Se tem tranca então esta fechado para quem não tem permissão ou a chave
            // Verificar se há alguma armadilha configurada
            let haveTrap = (hasLock.data.data.actionType !== '') ? true : false;
            // Daqui em diante Supões-se esta fechado trancado e pode haver ou não uma armadilha
            const openlockFlags = GetFlagsChecks(hasLock);
            //const activation = PrepareActivations(hasLock.data.data.activation['condition']);
            // Verifica se possui um tool para arrombar a tranca
            let tool = await HasTool(actor);
            //console.log("tenho tool?", tool);
            // Configura o dialogo para arrombar
            let inbutton = false;
            let btnone = {
                icon: '<i class="fas fa-fist-raised"></i>',
                label: game.i18n.localize('OpenLock.Btn.Strangth'),
                callback: async () => {
                    await actor.rollAbilityTest(`str`).then((result) => {
                        inbutton = true;
                        if (result.total >= openlockFlags.forceLock) {
                            hasOpen = true; trapDisarm = true; trapRemove = true; haveTrap = false;
                        }
                        let options = { open: hasOpen, trap: haveTrap, disarm: trapDisarm, remove: trapRemove }
                        let msg = {
                            SearchTitile: game.i18n.localize('OpenLock.MsgChat.OpenTitle'),
                            content: `<p>${game.i18n.localize('OpenLock.MsgChat.StranghtOpen')}<span style=\"color:${(hasOpen) ? "green" : "red"}\">${(hasOpen) ? game.i18n.localize('OpenLock.MsgChat.Yes') : game.i18n.localize('OpenLock.MsgChat.No')}</span></p>`
                        }
                        if (haveTrap == true && trapDisarm == false) {
                            msg['content'] = msg['content'] + `<h3><span style=\"color: red\">${game.i18n.localize('OpenLock.MsgChat.TrapOnOpen')}</span></h3>`;
                        }
                        OpenChest(targetToken, hasLock, hasKey, options, msg);
                    });
                    console.log("bau foi aberto?", hasOpen);
                }
            };
            let btntwo = {
                icon: '<i class="fas fa-user-lock"></i>',
                label: game.i18n.localize('OpenLock.Btn.ThievesTools'),
                callback: async () => {
                    
                    inbutton = true;
                    await tool.rollToolCheck().then((result) => {
                        console.log(result.total, openlockFlags.openLock, openlockFlags.toolsBreak)
                        if (result.total >= openlockFlags.openLock) {
                            hasOpen = true; trapDisarm = true; haveTrap = false;
                        }
                        if (result.total < openlockFlags.toolsBreak) {
                            toolsbreak = true;
                        }
                        let options = { open: hasOpen, trap: haveTrap, disarm: trapDisarm, remove: trapRemove, toolsbreak: toolsbreak }
                        console.log("Abrindo fechadura", options);
                        let msg = {
                            SearchTitile: game.i18n.localize('OpenLock.MsgChat.OpenTitle'),
                            content: `<p>${game.i18n.localize('OpenLock.MsgChat.ToolOpen')}<span style=\"color:${(hasOpen) ? "green" : "red"}\">${(hasOpen) ? game.i18n.localize('OpenLock.MsgChat.Yes') : game.i18n.localize('OpenLock.MsgChat.No')}</span></p>`
                        }
                        if (haveTrap == true && trapDisarm == false) {
                            msg['content'] = msg['content'] + `<h3><span style=\"color: red\">${game.i18n.localize('OpenLock.MsgChat.TrapOnOpen')}</span></h3>`;
                        }
                        if (haveTrap == true && toolsbreak == true) {
                            msg['content'] = msg['content'] + `<h3><img src=\"${tool.img}\" width=\"30px\" /><span style=\"color: red\"> ${game.i18n.localize('OpenLock.MsgChat.BreakTools')}</span></h3>`;
                        }
                        OpenChest(targetToken, hasLock, hasKey, options, msg);
                    });
                    
                }
            };
            let buttons = (tool) ? { buttons: { one: btnone, two: btntwo }, default: 'two' } : { buttons: { one: btnone }, default: 'one' };

            let dialogBase = Object.assign({
                title: game.i18n.localize('OpenLock.MsgDialog.Title'),
                content: `<p>${game.i18n.localize('OpenLock.MsgDialog.Content')}</p>`,
                close: async () => {
                    if (!inbutton) {
                        let options = { open: hasOpen, trap: haveTrap, disarm: trapDisarm, remove: trapRemove }
                        let msg = {
                            SearchTitile: game.i18n.localize('OpenLock.MsgChat.OpenTitle'),
                            content: `<h3><span style=\"color: red\">${game.i18n.localize('OpenLock.MsgChat.TrapOnOpen')}</span></h3>`
                        }
                        await OpenChest(targetToken, hasLock, hasKey, options, msg);
                    }
                }
            }, buttons);

            let d = new Dialog(dialogBase);
            await d.render(true);
        } else {
            return ui.notifications.info(`${targetToken.name} ${game.i18n.localize('OpenLock.Errors.novalidLoot')}`);
        }
    }
}

export let CheckForTraps = async function () {
    if (CheckTokentarget() === false) return
    const actor = canvas.tokens.controlled[0].actor;
    for (let targetToken of game.user.targets) {
        if (CheckDistance(targetToken, game.settings.get("innocenti-openlock", "perceptionDistance")) === false) return;
        if (targetToken.actor.getFlag('lootsheetnpc5e', 'lootsheettype') === 'Loot') {
            if (CheckPermission(targetToken) === true) return setTimeout(function () { targetToken._onClickLeft2() }, 500);
            // Checagem se o loot possui uma tranca a ser aberta.
            let hasLock = await HasLock(targetToken.actor);
            if (hasLock === false) {
                let options = { open: true, trap: false, disarm: false, remove: false };
                let msg = {
                    SearchTitile: game.i18n.localize('OpenLock.MsgChat.SearchTitle'),
                    content: `<p>${game.i18n.localize('OpenLock.MsgChat.NotLock')}</p>`
                }
                await OpenChest(targetToken, hasLock, false, options, msg);
                return;
            }
            let hasKey = await HasKey(hasLock, actor);
            let foundTrap = false;
            let foundKey = false;
            let haveTrap = (hasLock.data.data.actionType !== '') ? true : false;
            let tool = await HasTool(actor);
            const openlockFlags = GetFlagsChecks(hasLock);
            ///PASSIVE PERCEPTION FOR FIND TRAP AND LOCKED
            if (actor.data.data.skills['prc'].passive >= openlockFlags.findTrap && hasLock.data.actionType !== '') {
                foundTrap = (haveTrap) ? true : false;
                foundKey = (hasKey) ? true : false;
            } else {
                await actor.rollSkill(`prc`).then((result) => {
                    if (result.total >= openlockFlags.findTrap) {
                        foundTrap = (haveTrap) ? true : false;
                        foundKey = (hasKey) ? true : false;
                    } else {
                        foundTrap = false;
                        foundKey = false;
                    }
                });
            }
            await CheckForTrapsChat(foundTrap, foundKey);
            /// Dialog create
            let btnone = {
                icon: '<i class="fas fa-unlock"></i>',
                label: game.i18n.localize('OpenLock.Btn.OpenChest'),
                callback: OpenLock
            };
            let btntwo = {
                icon: '<i class="fas fa-cogs"></i>',
                label: game.i18n.localize('OpenLock.Btn.DisarmTrap'),
                callback: async () => {
                    let toolsbreak = false;
                    await tool.rollToolCheck().then((result) => {
                        let disarm = false;
                        if (result.total >= openlockFlags.disarmTrap) {
                            disarm = true;
                        }
                        if (result.total < openlockFlags.toolsBreak) {
                            toolsbreak = true;
                        }
                        let options = { open: false, trap: haveTrap, disarm: disarm, remove: false, toolsbreak: toolsbreak };
                        let msg = { SearchTitile: game.i18n.localize('OpenLock.MsgChat.TitleDisarm'), content: `<p>${game.i18n.localize('OpenLock.MsgChat.TrapDisarm')}<span style=\"color:${(disarm) ? "green" : "red"}\">${(disarm) ? game.i18n.localize('OpenLock.MsgChat.Yes') : game.i18n.localize('OpenLock.MsgChat.No')}</span></p>` }
                        if (haveTrap == true && toolsbreak == true) {
                            msg['content'] = msg['content'] + `<h3><img src=\"${tool.img}\" width=\"30px\" /><span style=\"color: red\"> ${game.i18n.localize('OpenLock.MsgChat.BreakTools')}</span></h3>`;
                        }
                        OpenChest(targetToken, hasLock, hasKey, options, msg);
                    });
                }
            };

            let buttons = (tool && foundTrap === true && haveTrap === true) ? { buttons: { one: btnone, two: btntwo }, default: 'two' } : { buttons: { one: btnone }, default: 'one' };
            let trapAlert = (foundTrap === true) ? `<p>${game.i18n.localize('OpenLock.MsgDialog.TrapAlert')}</p>` : '';
            let dialogBase = Object.assign({
                title: game.i18n.localize('OpenLock.MsgDialog.TitleCheck'),
                content: `<p>${game.i18n.localize('OpenLock.MsgDialog.ContentCheck')}</p>${trapAlert}`,
                close: () => console.log("Don't touch this")
            }, buttons);

            let d = new Dialog(dialogBase);
            await d.render(true);
        } else {
            return ui.notifications.info(`${targetToken.name} ${game.i18n.localize('OpenLock.Errors.novalidLoot')}`);
        }
    }
}

async function CheckForTrapsChat(foundTrap, foundKey) {
    let content = `<p>${game.i18n.localize('OpenLock.MsgChat.hasLock')}<span style=\"color:red\">${game.i18n.localize('OpenLock.MsgChat.Yes')}</span></p>`;
    content = content + `<p>${game.i18n.localize('OpenLock.MsgChat.haveKey')}<span style=\"color:${(foundKey) ? "green" : "red"}\">${(foundKey) ? game.i18n.localize('OpenLock.MsgChat.Yes') : game.i18n.localize('OpenLock.MsgChat.Dontfound')}</span></p>`;
    content = content + `<p>${game.i18n.localize('OpenLock.MsgChat.haveTrap')}<span style=\"color:${(foundTrap) ? "red" : "green"}\">${(foundTrap) ? game.i18n.localize('OpenLock.MsgChat.Yes') : game.i18n.localize('OpenLock.MsgChat.Dontfound')}</span></p>`;

    await ChatMessage.create({
        content: content,
        type: CONST.CHAT_MESSAGE_TYPES.EMOTE,
        speaker: ChatMessage.getSpeaker(),
        flavor: `<h2>${game.i18n.localize('OpenLock.MsgChat.SearchTitle')}</h2>`
    });
}
let CheckTokentarget = () => {
    if (canvas.tokens.controlled.length === 0) {
        ui.notifications.error(game.i18n.localize('OpenLock.Errors.noSelect'));
        return false;
    }
    if (!game.user.targets.values().next().value) {
        ui.notifications.warn(game.i18n.localize('OpenLock.Errors.noToken'));
        return false;
    }
    return true;
}
let HasTool = async (actor) => {
    return await actor.items.find(a => a.name === `Thieves’ Tools` || a.name === game.i18n.localize('OpenLock.Msg.ThievesTools') || a.name === game.settings.get("innocenti-openlock", "nameThievesTool"));
}
let HasKey = (lock, actor) => {
    let keylock = lock.getFlag('innocenti-openlock', "keylock");
    return (keylock !== '') ? actor.items.find(item => item.name === `${keylock}`) : false;
}
let HasLock = async (actor) => {
    let lock = await actor.items.find(a => a.data.flags['innocenti-openlock']);
    if (!lock) return false;
    return (lock.getFlag('innocenti-openlock', "enabled") === true) ? lock : false;
}
let CheckPermission = async (targetToken) => {
    let entityTarget = await game.actors.entities.find(a => a.id === targetToken.actor.id);
    let perm = entityTarget.data.permission;
    // Se já tenho permissão não preciso testar nada.
    if (perm[`${game.user.id}`]) return true
    //console.log("Não tenho permissão");
    return false;
}
function GetFlagsChecks(haslock) {
    return haslock.data.flags['innocenti-openlock'];
}
function PrepareActivations(itemActivation) {
    let activation = {};
    const activations = itemActivation.split(';').map(a => a.split(' '));
    activations.forEach((array) => {
        const [key, ...newData] = array;
        activation[key] = parseInt(newData.filter(i => !!i));
    });
    return activation;
}
async function OpenChest(targetToken, lockitem, chestKey = false, options, msgs) {
    let imgToken = targetToken.data.img || targetToken.actor.img;
    let content = `<h3><img src=\"${imgToken}\" width=\"30px\" /></h3>` + msgs.content;
    await game.socket.emit("module.innocenti-openlock", {
        actorTargetid: targetToken.actor.id,
        token: canvas.tokens.controlled[0].id,
        targetToken: targetToken.id,
        userid: game.user.id,
        item_id: lockitem?.id,
        chestKey: chestKey,
        trap: options.trap,
        disarm: options.disarm,
        remove: options.remove,
        open: options.open,
        toolsbreak: options.toolsbreak
    });

    await ChatMessage.create({
        content: content,
        type: CONST.CHAT_MESSAGE_TYPES.EMOTE,
        speaker: ChatMessage.getSpeaker(),
        flavor: `<h2>${msgs.SearchTitile}</h2>`
    });
    if (options.open === true)
        await setTimeout(function () { targetToken._onClickLeft2() }, 500);
}

let CheckDistance = (targetToken, minDistance = 1) => {
    let gridDistance = (minDistance < 1) ? 1 : minDistance;
    // minimo de distancia 1
    let distance = Math.ceil(canvas.grid.measureDistance(canvas.tokens.controlled[0], targetToken, { gridSpaces: true }));
    let nGrids = Math.floor(distance / canvas.scene.data.gridDistance);
    if (nGrids <= gridDistance) return true;
    ui.notifications.warn(game.i18n.format("OpenLock.Errors.invalidDistance", { dist: gridDistance }));
    return false;
}

export class OpenLooks {

    constructor(flags) {
        this.data = mergeObject(this.defaultData(), flags || {}, { inplace: false });

        this.enabled = this.data.enabled;
        this.disarmTrap = parseInt(this.data.disarmTrap);
        this.findTrap = parseInt(this.data.findTrap);
        this.forceLock = parseInt(this.data.forceLock);
        this.openLock = parseInt(this.data.openLock);
        this.keylock = this.data.keylock;
        this.toolsBreak = parseInt(this.data.toolsBreak);
        this.resetTrap = this.data.resetTrap;
    }

    defaultData() {
        return {
            enabled: false,
            disarmTrap: 10,
            findTrap: 10,
            forceLock: 12,
            openLock: 10,
            toolsBreak: 5,
            keylock: '',
            resetTrap: false
        }
    }
    toggleEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            mergeObject(this, this.defaultData());
        }
    }

}