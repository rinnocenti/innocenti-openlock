export let OpenLock = async function () {
    if (canvas.tokens.controlled.length === 0)
        return ui.notifications.error("Select a token");
    const actor = canvas.tokens.controlled[0].actor;
    if (!game.user.targets.values().next().value) {
        ui.notifications.warn("No token is targeted");
        return;
    }
    for (let targetToken of game.user.targets) {
        let flag = targetToken.actor.getFlag('lootsheetnpc5e', 'lootsheettype');
        if (flag === 'Loot') {
            let openChest = false;
            let hasTrap = false;
            let lootkey = false;
            let entityTarget = await game.actors.entities.find(a => a.id === targetToken.actor.id);
            let perm = entityTarget.data.permission;
            // Se já tenho permissão não preciso testar nada.
            if (perm[`${game.user.id}`]) return setTimeout(function () { targetToken._onClickLeft2() }, 500);

            // Checagem se o loot possui uma tranca a ser aberta.
            let lock = targetToken.actor.items.find(a => a.name === (game.settings.get("innocenti-openlock", "nameLockFeat") || game.settings.get("innocenti-openlock", "nameTrapLockFeat")) && a.type === `feat`);
            if (!lock) {
                let options = { open: true, trap: hasTrap, disarm: false, remove: false }
                await OpenChest(targetToken, lock, lootkey, options);
                return;
            }
            //Tem uma trance então verificar se possui a chave ou se precisa de uma.
            // Tem um a tranca, não possuo uma chave, então verificar se há uma armadilha.

            if (lock.data.data.requirements) {
                lootkey = actor.items.find(item => item.name === `${lock.data.data.requirements}`);
                if (lootkey) {
                    // Se precisa de uma chave e eu tenho a chave não preciso checar mais nada.
                    let options = { open: true, trap: hasTrap, disarm: false, remove: false }
                    await OpenChest(targetToken, lock, lootkey, options);
                    return;
                }
            }
            // Verificar se há alguma armadilha configurada
            if (lock.data.data.actionType === '') {
                let options = { open: true, trap: hasTrap, disarm: false, remove: false }
                await OpenChest(targetToken, lock, lootkey, options);
                return;
            }
            // Daqui em diante Supões-se que a tranca esta com um efeito de armadilha
            hasTrap = true;
            const activation = PrepareActivations(lock.data.data.activation['condition']);
            // Verifica se possui um tool para arrombar a tranca
            let tool = actor.items.find(a => a.name === `Thieves’ Tools` || a.name === game.i18n.localize('OpenLock.Msg.ThievesTools') || a.name === game.settings.get("innocenti-openlock", "nameThievesTool"));
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
                            let options = { open: true, trap: hasTrap, disarm: false, remove: true }
                            OpenChest(targetToken, lock, lootkey, options);
                        } else {
                            let options = { open: false, trap: hasTrap, disarm: false, remove: false }
                            OpenChest(targetToken, lock, lootkey, options);
                        }
                    });
                    console.log("bau foi aberto?", openChest);
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
                            openChest = true;
                        }
                    });
                    let options = { open: openChest, trap: hasTrap, disarm: false, remove: false }
                    await OpenChest(targetToken, lock, lootkey, options);
                }
            };
            let buttons = (tool) ? { buttons: { one: btnone, two: btntwo }, default: 'two' } : { buttons: { one: btnone }, default: 'one' };

            let dialogBase = Object.assign({
                title: game.i18n.localize('OpenLock.MsgDialog.Title'),
                content: `<p>${game.i18n.localize('OpenLock.MsgDialog.Content')}</p>`,
                close: async () => {
                    //await OpenChest(targactor, targetToken, lock, lootkey, openChest = false, hasTrap);
                    //return;
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
    if (canvas.tokens.controlled.length === 0)
        return ui.notifications.error("Select a token");
    const actor = canvas.tokens.controlled[0].actor;
    if (!game.user.targets.values().next().value) {
        ui.notifications.warn("No token is targeted");
        return;
    }
    for (let targetToken of game.user.targets) {
        let flag = targetToken.actor.getFlag('lootsheetnpc5e', 'lootsheettype');
        if (flag === 'Loot') {
            let foundTrap = false;
            let entityTarget = await game.actors.entities.find(a => a.id === targetToken.actor.id);
            let perm = entityTarget.data.permission;
            // Se já tenho permissão não preciso testar nada.
            if (perm[`${game.user.id}`]) return setTimeout(function () { targetToken._onClickLeft2() }, 500);
            console.log("Não tenho permissão");
            // Checagem se o loot possui uma tranca a ser aberta.
            let hasLock = targetToken.actor.items.find(a => a.name === (game.settings.get("innocenti-openlock", "nameLockFeat") || game.settings.get("innocenti-openlock", "nameTrapLockFeat")) && a.type === `feat`);
            if (!hasLock) {
                let options = { open: true, trap: false, disarm: false, remove: false }
                await OpenChest(targetToken, hasLock, false, options);
                return;
            }
            console.log("tenho um lock", hasLock);
            let haveKey = (hasLock.data.data.requirements) ? actor.items.find(item => item.name === `${hasLock.data.data.requirements}`) : hasLock.data.data.requirements;
            let haveTrap = (hasLock.data.data.actionType !== '') ? true : false;

            const activation = PrepareActivations(hasLock.data.data.activation['condition']);
            if (!activation['prc']) {
                activation['prc'] = game.settings.get("innocenti-openlock", "defaultPerception");
            }

            // Testar a percepção passiva/ativa.
            if (actor.data.data.skills['prc'].passive >= activation['prc'] && hasLock.data.actionType !== '') {
                foundTrap = (haveTrap) ? true : false;
            } else {
                await actor.rollSkill(`prc`).then((result) => {
                    if (result.total >= activation['prc']) {
                        foundTrap = (haveTrap) ? true : false;
                    }
                });
            }
            console.log("Encontrei uma armadilha", foundTrap);
            console.log("Tem Alguma armadilha?", haveTrap);
            let tool = actor.items.find(a => a.name === `Thieves’ Tools` || a.name === game.i18n.localize('OpenLock.Msg.ThievesTools') || a.name === game.settings.get("innocenti-openlock", "nameThievesTool"));
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
                        if (result.total >= activation['disarm']) {
                            console.log("Conseguiu desarmar", activation['disarm']);
                            let options = { open: false, trap: false, disarm: true, remove: false }
                            OpenChest(targetToken, hasLock, haveKey, options);
                        } else {
                            console.log("Não Desaramou", activation['disarm']);
                            let options = { open: false, trap: true, disarm: false, remove: false }
                            OpenChest(targetToken, hasLock, haveKey, options, true);
                        }
                    });
                }
            };


            let buttons = (tool && foundTrap === true && hasTrap === true) ? { buttons: { one: btnone, two: btntwo }, default: 'two' } : { buttons: { one: btnone }, default: 'one' };
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

function PrepareActivations(itemActivation) {
    let activation = {};
    const activations = itemActivation.split(';').map(a => a.split(' '));
    activations.forEach((array) => {
        const [key, ...newData] = array;
        activation[key] = parseInt(newData.filter(i => !!i));
    });
    return activation;
}

async function OpenChest(targetToken, lockitem, chestKey = false, options, msgs) {//open = true, trap = false, lockdisarm = false, lockremove = false) {

    let imgActor = targetToken.actor.img || targetToken.data.img;
    let imgToken = targetToken.data.img || targetToken.actor.img;

    let msgAction = msgs.title;

    // Fazer um texto extra dizendo como o bau foi pilhado
    let contentItem = (chestKey) ? `<hr /><h4>${game.i18n.localize('OpenLock.MsgChat.Used')} <img src=\"${chestKey.data.img}\" width=\"30px\" /> ${chestKey.name}</h4>` : '';
    await game.socket.emit("module.innocenti-openlock", {
        actorTargetid: targetToken.actor.id,
        token: canvas.tokens.controlled[0].id,
        targetToken: targetToken.id,
        userid: game.user.id,
        item_id: lockitem.id,
        chestKey: chestKey,
        trap: options.trap,
        disarm: options.disarm,
        remove: options.remove,
        open: options.open
    });

    await ChatMessage.create({
        content: `<h3><img src=\"${imgActor}\" width=\"50px\" /> ${game.i18n.localize('OpenLock.MsgChat.Loot')} @Actor[${targetToken.actor.data._id}]{${targetToken.name}}</h3>${contentItem}`,
        type: CONST.CHAT_MESSAGE_TYPES.EMOTE,
        speaker: ChatMessage.getSpeaker(),
        flavor: `<h3><img src=\"${imgToken}\" width=\"30px\" /></h3>`
    });
    if (open === true)
        await setTimeout(function () { targetToken._onClickLeft2() }, 500);
}
