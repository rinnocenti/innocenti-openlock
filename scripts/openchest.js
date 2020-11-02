//TODO: Pegar os ND da folha de item
//TODO: Verificar a Distancia dos tokens
export let OpenLock = async function () {
    if (CheckTokentarget() === false) return
    const actor = canvas.tokens.controlled[0].actor;
    for (let targetToken of game.user.targets) {
        if (targetToken.actor.getFlag('lootsheetnpc5e', 'lootsheettype') === 'Loot') {
            if (CheckPermission(targetToken) === true) return setTimeout(function () { targetToken._onClickLeft2() }, 500);
            // Checagem se o loot possui uma tranca a ser aberta.
            let hasLock = HasLock(targetToken.actor);
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
            let hasKey = false;
            if (hasLock.data.data.requirements) {
                hasKey = HasKey(hasLock, actor);
                if (hasKey) {
                    // Se precisa de uma chave e eu tenho a chave não preciso checar mais nada.
                    let options = { open: true, trap: false, disarm: false, remove: false }
                    let msg = {
                        SearchTitile: game.i18n.localize('OpenLock.MsgChat.OpenTitle'),
                        content: `<hr /><h4>${game.i18n.localize('OpenLock.MsgChat.Used')} <img src=\"${hasKey.data.img}\" width=\"30px\" /> ${hasKey.name}</h4>`
                    }
                    await OpenChest(targetToken, hasLock, hasKey, options, msg);
                    return;
                }
            }
            let hasOpen = false; let trapDisarm = false; let trapRemove = false; // Se tem tranca então esta fechado para quem não tem permissão ou a chave
            // Verificar se há alguma armadilha configurada
            let haveTrap = (hasLock.data.data.actionType !== '') ? true : false;
            // Daqui em diante Supões-se esta fechado trancado e pode haver ou não uma armadilha
            const activation = PrepareActivations(hasLock.data.data.activation['condition']);
            // Verifica se possui um tool para arrombar a tranca
            let tool = HasTool(actor);
            console.log("tenho tool?", tool);
            // Configura o dialogo para arrombar
            let btnone = {
                icon: '<i class="fas fa-fist-raised"></i>',
                label: game.i18n.localize('OpenLock.Btn.Strangth'),
                callback: async () => {
                    if (!activation['str']) {
                        activation['str'] = game.settings.get("innocenti-openlock", "defaultStrenght");
                    }
                    await actor.rollAbilityTest(`str`).then((result) => {
                        if (result.total >= activation['str']) {
                            hasOpen = true; trapDisarm = true; trapRemove = true;
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
                    if (!activation['dex']) {
                        activation['dex'] = game.settings.get("innocenti-openlock", "defaultDexterity");
                    }
                    await tool.rollToolCheck().then((result) => {
                        if (result.total >= activation['dex']) {
                            hasOpen = true; trapDisarm = true;
                        }
                    });
                    let options = { open: hasOpen, trap: haveTrap, disarm: trapDisarm, remove: trapRemove }
                        let msg = {
                            SearchTitile: game.i18n.localize('OpenLock.MsgChat.OpenTitle'),
                            content: `<p>${game.i18n.localize('OpenLock.MsgChat.ToolOpen')}<span style=\"color:${(hasOpen) ? "green" : "red"}\">${(hasOpen) ? game.i18n.localize('OpenLock.MsgChat.Yes') : game.i18n.localize('OpenLock.MsgChat.No')}</span></p>`
                        }
                    if(haveTrap == true && trapDisarm == false) {
                            msg['content'] = msg['content'] + `<h3><span style=\"color: red\">${game.i18n.localize('OpenLock.MsgChat.TrapOnOpen')}</span></h3>`;
                        }
                    await OpenChest(targetToken, hasLock, hasKey, options, msg);
                }
            };
            let buttons = (tool) ? { buttons: { one: btnone, two: btntwo }, default: 'two' } : { buttons: { one: btnone }, default: 'one' };

            let dialogBase = Object.assign({
                title: game.i18n.localize('OpenLock.MsgDialog.Title'),
                content: `<p>${game.i18n.localize('OpenLock.MsgDialog.Content')}</p>`,
                close: async () => {
                    let options = { open: hasOpen, trap: haveTrap, disarm: trapDisarm, remove: trapRemove }
                    let msg = {
                        SearchTitile: game.i18n.localize('OpenLock.MsgChat.OpenTitle'),
                        content: `<h3><span style=\"color: red\">${game.i18n.localize('OpenLock.MsgChat.TrapOnOpen')}</span></h3>`
                    }
                    await OpenChest(targetToken, hasLock, hasKey, options, msg);
                }
            }, buttons);

            let d = new Dialog(dialogBase);
            await d.render(true);
        } else {
            return ui.notifications.info(`${targetToken.nam} não é um Loot Valido`);
        }
    }
}

export let CheckForTraps = async function () {
    if (CheckTokentarget() === false) return
    const actor = canvas.tokens.controlled[0].actor;
    for (let targetToken of game.user.targets) {
        if (targetToken.actor.getFlag('lootsheetnpc5e', 'lootsheettype') === 'Loot') {
            if (CheckPermission(targetToken) === true) return setTimeout(function () { targetToken._onClickLeft2() }, 500);
            // Checagem se o loot possui uma tranca a ser aberta.
            let hasLock = HasLock(targetToken.actor);
            if (hasLock === false) {
                let options = { open: true, trap: false, disarm: false, remove: false };
                let msg = {
                    SearchTitile: game.i18n.localize('OpenLock.MsgChat.SearchTitle'),
                    content: `<p>${game.i18n.localize('OpenLock.MsgChat.NotLock')}</p>`
                }
                await OpenChest(targetToken, hasLock, false, options, msg);
                return;
            }
            let hasKey = HasKey(hasLock, actor);
            let foundTrap = false;
            let foundKey = false;
            let haveTrap = (hasLock.data.data.actionType !== '') ? true : false;
            let tool = HasTool(actor);
            const activation = PrepareActivations(hasLock.data.data.activation['condition']);
            ///PASSIVE PERCEPTION FOR FIND TRAP AND LOCKED
            if (!activation['prc']) {
                activation['prc'] = game.settings.get("innocenti-openlock", "defaultPerception");
            }
            if (actor.data.data.skills['prc'].passive >= activation['prc'] && hasLock.data.actionType !== '') {
                foundTrap = (haveTrap) ? true : false;
                foundKey = (hasKey) ? true : false;
            } else {
                await actor.rollSkill(`prc`).then((result) => {
                    if (result.total >= activation['prc']) {
                        foundTrap = (haveTrap) ? true : false;
                        foundKey = (hasKey) ? true : false;
                    } else {
                        foundTrap = false;
                        foundKey = false;
                    }
                });
            }
            await CheckForTrapsChat(foundTrap, foundKey);

            let btnone = {
                icon: '<i class="fas fa-unlock"></i>',
                label: game.i18n.localize('OpenLock.Btn.OpenChest'),
                callback: OpenLock
            };
            let btntwo = {
                icon: '<i class="fas fa-cogs"></i>',
                label: game.i18n.localize('OpenLock.Btn.DisarmTrap'),
                callback: async () => {
                    if (!activation['disarm']) {
                        activation['disarm'] = game.settings.get("innocenti-openlock", "defaultDexterity");
                    }
                    await tool.rollToolCheck().then((result) => {
                        let disarm = false;
                        if (result.total >= activation['disarm']) {
                            disarm = true;
                        }
                        let options = { open: false, trap: haveTrap, disarm: disarm, remove: false };
                        let msg = { SearchTitile: game.i18n.localize('OpenLock.MsgChat.TitleDisarm'), content: `<p>${game.i18n.localize('OpenLock.MsgChat.TrapDisarm')}<span style=\"color:${(disarm) ? "green" : "red"}\">${(disarm) ? game.i18n.localize('OpenLock.MsgChat.Yes') : game.i18n.localize('OpenLock.MsgChat.No')}</span></p>` }
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
            return ui.notifications.info(`${targetToken.nam} não é um Loot Valido`);
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
        ui.notifications.error("Select a token");
        return false;
    }
    if (!game.user.targets.values().next().value) {
        ui.notifications.warn("No token is targeted");
        return false;
    }
    return true;
}
let HasTool = (actor) => {
    return actor.items.find(a => a.name === `Thieves’ Tools` || a.name === game.i18n.localize('OpenLock.Msg.ThievesTools') || a.name === game.settings.get("innocenti-openlock", "nameThievesTool"));
}
let HasKey = (lock, actor) => {
    return (lock.data.data.requirements) ? actor.items.find(item => item.name === `${lock.data.data.requirements}`) : false;
}
let HasLock = (actor) => {
    let lock = actor.items.find(a => a.name === (game.settings.get("innocenti-openlock", "nameLockFeat") || game.settings.get("innocenti-openlock", "nameTrapLockFeat")) && a.type === `feat`);
    return (lock) ? lock : false;
}
let CheckPermission = async (targetToken) => {
    let entityTarget = await game.actors.entities.find(a => a.id === targetToken.actor.id);
    let perm = entityTarget.data.permission;
    // Se já tenho permissão não preciso testar nada.
    if (perm[`${game.user.id}`]) return true
    console.log("Não tenho permissão");
    return false;
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

    let imgActor = targetToken.actor.img || targetToken.data.img;
    let imgToken = targetToken.data.img || targetToken.actor.img;
    let content = `<h3><img src=\"${imgToken}\" width=\"30px\" /></h3>` + msgs.content;

    // Fazer um texto extra dizendo como o bau foi pilhado
    let contentItem = (chestKey) ? `<hr /><h4>${game.i18n.localize('OpenLock.MsgChat.Used')} <img src=\"${chestKey.data.img}\" width=\"30px\" /> ${chestKey.name}</h4>` : '';
    content = content + contentItem;
    console.log(options);
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
        open: options.open
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