export let Chest = async function () {
    if (canvas.tokens.controlled.length === 0)
        return ui.notifications.error("Select a token");
    const target = game.user.targets.values().next().value;
    const actor = canvas.tokens.controlled[0].actor;
    if (!target) {
        ui.notifications.warn("No token is targeted");
        return;
    }
    for (let targetToken of game.user.targets) {
        let flag = targetToken.actor.getFlag('lootsheetnpc5e', 'lootsheettype');
        if (flag === 'Loot') {
            let targactor = await game.actors.entities.find(a => a.id === targetToken.actor.id);
            let perm = targactor.data.permission;
            if (perm[`${game.user.id}`]) return setTimeout(function () { targetToken._onClickLeft2() }, 500);

            // Checagem se possui a chave
            let lock = targetToken.actor.items.find(a => a.name === (`Lock` || `Trap`) && a.type === `feat`);
            const lootkey = actor.items.find(item => item.name === `${lock.data.data.requirements}`);
            if (lootkey) {
                await OpenChest(targactor, targetToken, lootkey);
                console.log("Tenho a Chave e abro com segurança", lootkey);
                return;
            }
            console.log("Não Tenho a Chave =( ", lock);
            // Check for Traps.
            let trapAlert = '';
            const activation = {}
            if (lock.hasAttack || lock.hasDamage) {
                console.log(lock.hasAttack, lock.hasDamage);
                const activations = lock.data.data.activation['condition'].split(';').map(a => a.split(' '));
                activations.forEach((array) => {
                    const [key, ...newData] = array;
                    activation[key] = parseInt(newData.filter(i => !!i));
                });
                //let activation = activations.forEach(a => { let av = a.split(' '); let ab; return ab[av[0]] = av[1] });
                console.log(activation);
                await actor.rollSkill('prc').then((result) => {
                    if (result.total >= activation['prc']) {
                        trapAlert = `<br /> <h3>${game.i18n.localize('OpenLock.MsgDialog.TrapAlert')}</h3>`;
                    }
                });
            }
            let buttons;
            let tool = actor.items.find(a => a.name === `Thieves’ Tools` || a.name === game.i18n.localize('OpenLock.Msg.ThievesTools') || a.name === game.i18n.localize('OpenLock.Settings.ThievesTool'));
            const btnone = {
                icon: '<i class="fas fa-fist-raised"></i>',
                label: game.i18n.localize('OpenLock.Btn.Strangth'),
                callback: async () => {
                    await actor.rollAbilityTest(`str`).then((result) => {
                        if (result.total >= activation['str']) {
                            //this.GMacro(sucess);
                            OpenChest(targactor, targetToken, lootkey);
                            console.log("Chutei e Abri");
                            return;
                        }
                        if (lock.hasAttack || lock.hasDamage)
                            new MidiQOL.TrapWorkflow(targactor, lock, [canvas.tokens.controlled[0]], targetToken.center);
                    });
                }
            };
            const btntwo = {
                icon: '<i class="fas fa-user-lock"></i>',
                label: game.i18n.localize('OpenLock.Btn.ThievesTools'),
                callback: async () => {
                    await tool.rollToolCheck().then((result) => {
                        if (result.total >= activation['dex']) {
                            OpenChest(targactor, targetToken, lootkey);
                            return;
                        }
                        if (lock.hasAttack || lock.hasDamage)
                            new MidiQOL.TrapWorkflow(targactor, lock, [canvas.tokens.controlled[0]], targetToken.center);
                    });
                }
            };
            const btntree = {
                icon: '<i class="fas fa-ban"></i>',
                label: game.i18n.localize('OpenLock.Btn.DontTouch'),
                callback: () => console.log("Chose Tree")
            };
            if (tool) buttons = { buttons: { one: btnone, two: btntwo }, default: 'two', close: () => console.log("Não adianta fechar") };
            if (trapAlert !== '') buttons = { buttons: { one: btnone, two: btntree }, default: 'two' };
            if (trapAlert !== '' && tool) buttons = { buttons: { one: btnone, two: btntwo, tree: btntree }, default: 'tree' };
            let dialogBase = Object.assign({
                title: game.i18n.localize('OpenLock.MsgDialog.Title'),
                content: `<p>${game.i18n.localize('OpenLock.MsgDialog.Content')}</p>${trapAlert}`,
                close: () => console.log("This always is logged no matter which option is chosen")
            }, buttons);

            let d = new Dialog(dialogBase);
            d.render(true);
        }
    }
}
async function OpenChest(targactor, targetToken, item) {
    await game.socket.emit("module.innocenti-openlock", { token: targactor.name, userid: game.user.id });
    let img = targetToken.actor.img || targetToken.data.img;
    let imgtk = targetToken.data.img || targetToken.actor.img;
    // Fazer um texto extra dizendo como o bau foi pilhado
    let contentItem = (item) ? `<hr /><h4>${game.i18n.localize('OpenLock.MsgChat.Used')} <img src=\"${item.data.img}\" width=\"30px\" /> ${item.name}</h4>` : '';

    await ChatMessage.create({
        content: `<h3><img src=\"${img}\" width=\"50px\" /> ${game.i18n.localize('OpenLock.MsgChat.Loot')} @Actor[${targetToken.actor.data._id}]{${targetToken.name}}</h3>${contentItem}`,
        type: CONST.CHAT_MESSAGE_TYPES.EMOTE,
        speaker: ChatMessage.getSpeaker(),
        flavor: `<h3><img src=\"${imgtk}\" width=\"30px\" /></h3>`
    });
    await setTimeout(function () { targetToken._onClickLeft2() }, 500);
}