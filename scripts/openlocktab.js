import { OpenLooks } from "./openchest.js";

const openLockTab = [];

export class OpenLockTab {

    static bind(app, html, data) {
        let acceptedTypes = ['feat'];
        if(acceptedTypes.includes(data.entity.type)) {
            let tab = openLockTab[app.id];
            if(!tab) {
                tab = new OpenLockTab(app);
                openLockTab[app.id] = tab;
            }
            tab.init(html, data);
        }
    }

    constructor(app) {
        this.app = app;
        this.item = app.item;

        this.hack(this.app);

        this.activate = false;
    }

    init(html) {

        this.openlock = new OpenLooks(this.item.data.flags['innocenti-openlock']); 

        if (html[0].localName !== "div") {
            this.html = $(html[0].parentElement.parentElement);
        } else {
            this.html = html;
        }

        let tabs = this.html.find(`form nav.sheet-navigation.tabs`);
        tabs.append($(
            '<a class="item" data-tab="innocenti-openlock">Open Lock</a>'
        ));

        $(this.html.find(`.sheet-body`)).append($(
            '<div class="tab open-lock" data-group="primary" data-tab="innocenti-openlock"></div>'
        ));

        this.render();
    }

    hack(app) {
        app.setPosition = function(position={}) {
            position.height = this._sheetTab === "details" || "openlock" ? "auto" : this.options.height;
            position.width = 600;
            return this.__proto__.__proto__.setPosition.apply(this, [position])
        };
    }

    async render() {
        let template = await renderTemplate('modules/innocenti-openlock/templates/open-lock-tab.html', this.openlock);
        let el = this.html.find(`.open-lock-content`);
        if(el.length) {
            el.replaceWith(template);
        } else {
            this.html.find('.tab.open-lock').append(template);
        }

        let openLockEnabled = this.html.find('.open-lock-enabled');
        if (this.openlock.enabled) {
            openLockEnabled.show();
        } else {
            openLockEnabled.hide();
        }


        this.handleEvents();

        this.app.setPosition();

        if(this.activate) {
            this.app._tabs[0].activate("innocenti-openlock");
            this.activate = false;
        }
    }

    handleEvents() {
        
        this.html.find('.open-lock-content input[type="text"]').change(evt => {
            this.activate = true;
        });
        //this.html.find('.open-lock-content select').change(evt => {
        //    this.activate = true;
        //});

        //this.html.find('input[name="flags.magicitems.enabled"]').click(evt => {
        //    this.magicItem.toggleEnabled(evt.target.checked);
        //    this.render();
        //});
        //this.html.find('input[name="flags.magicitems.charges"]').change(evt => {
        //    this.magicItem.charges = MAGICITEMS.numeric(evt.target.value, this.magicItem.charges);
        //});
        //this.html.find('input[name="flags.magicitems.chargeType"]').change(evt => {
        //    this.magicItem.chargeType = MAGICITEMS.numeric(evt.target.value, this.magicItem.chargeType);
        //});
        //this.html.find('input[name="flags.magicitems.rechargeable"]').change(evt => {
        //    this.magicItem.toggleRechargeable(evt.target.checked);
        //    this.render();
        //});
        //this.html.find('input[name="flags.magicitems.recharge"]').change(evt => {
        //    this.magicItem.recharge = evt.target.value;
        //});
        //this.html.find('select[name="flags.magicitems.rechargeType"]').change(evt => {
        //    this.magicItem.rechargeType = evt.target.value;
        //});
        //this.html.find('select[name="flags.magicitems.rechargeUnit"]').change(evt => {
        //    this.magicItem.rechargeUnit = evt.target.value;
        //});
        //this.html.find('input[name="flags.magicitems.destroy"]').change(evt => {
        //    this.magicItem.destroy = evt.target.checked;
        //    this.render();
        //});
        //this.html.find('.item-delete.item-spell').click(evt => {
        //    this.magicItem.removeSpell(evt.target.getAttribute("data-spell-idx"));
        //    this.render();
        //});
        //this.html.find('.item-delete.item-feat').click(evt => {
        //    this.magicItem.removeFeat(evt.target.getAttribute("data-feat-idx"));
        //    this.render();
        //});
        //this.html.find('.item-delete.item-table').click(evt => {
        //    this.magicItem.removeTable(evt.target.getAttribute("data-table-idx"));
        //    this.render();
        //});
        //this.magicItem.spells.forEach((spell, idx) => {
        //    this.html.find(`select[name="flags.magicitems.spells.${idx}.level"]`).change(evt => {
        //        spell.level = parseInt(evt.target.value);
        //        this.render();
        //    });
        //    this.html.find(`input[name="flags.magicitems.spells.${idx}.consumption"]`).change(evt => {
        //        spell.consumption = MAGICITEMS.numeric(evt.target.value, spell.consumption);
        //    });
        //    this.html.find(`input[name="flags.magicitems.spells.${idx}.upcast"]`).change(evt => {
        //        spell.upcast = parseInt(evt.target.value);
        //    });
        //    this.html.find(`input[name="flags.magicitems.spells.${idx}.cost"]`).change(evt => {
        //        spell.cost = MAGICITEMS.numeric(evt.target.value, spell.cost);
        //    });
        //    this.html.find(`a[data-spell-idx="${idx}"]`).click(evt => {
        //        spell.renderSheet();
        //    });
        //});
        //this.magicItem.feats.forEach((feat, idx) => {
        //    this.html.find(`input[name="flags.magicitems.feats.${idx}.consumption"]`).change(evt => {
        //        feat.consumption = MAGICITEMS.numeric(evt.target.value, feat.consumption);
        //    });
        //    this.html.find(`a[data-feat-idx="${idx}"]`).click(evt => {
        //        feat.renderSheet();
        //    });
        //});
        //this.magicItem.tables.forEach((table, idx) => {
        //    this.html.find(`input[name="flags.magicitems.tables.${idx}.consumption"]`).change(evt => {
        //        table.consumption = MAGICITEMS.numeric(evt.target.value, table.consumption);
        //    });
        //    this.html.find(`a[data-table-idx="${idx}"]`).click(evt => {
        //        table.renderSheet();
        //    });
        //});
    }

    isActive() {
        return $('a.item[data-tab="innocenti-openlock"]').hasClass("active");
    }
}