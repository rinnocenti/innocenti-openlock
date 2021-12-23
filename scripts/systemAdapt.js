export let SkillName = (sistem,skill) => {
    switch (sistem) {
        case 'dnd5e':
            return game.dnd5e.config.skills[`${skill}`];
            break;
        default:
    }   
};

export let OptionsSkillFind = (sistem) => {
    switch (sistem) {
        case 'dnd5e':
            return [
                { key: 'prc', value: game.dnd5e.config.skills.prc, selected: "" },
                { key: 'inv', value: game.dnd5e.config.skills.inv, selected: "" }
            ];
            break;
        default:
    }
}

export let OptionsAbilityCheck = (sistem) => {
    switch (sistem) {
        case 'dnd5e':
            return Object.keys(game.dnd5e.config.abilities).map(x => { return { key: x, value: game.dnd5e.config.abilities[x], selected: "" } });
            break;
        default:
    }
}

/**
     * Check the distance of the token and the target to see if it is within the allowed range.
     * the limit distance is configured in the module settings
     * @param {any} token
     * @param {any} targetToken
     * @param {number} limitSquere
     */
export let CheckDistance = (token, targetToken, limitSquere) => {
    let gridDistance = (limitSquere < 1) ? 1 : limitSquere;
    // minimo de distancia 1
    let distance = Math.ceil(canvas.grid.measureDistance(token, targetToken, { gridSpaces: true }));
    let nGrids = Math.floor(distance / canvas.scene.data.gridDistance);
    if (nGrids <= gridDistance) return true;
    //ui.notifications.warn(game.i18n.format("Looting.Errors.invalidDistance", { dist: gridDistance }));
    return false;
}