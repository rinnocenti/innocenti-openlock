import { OpenLocks } from "./openlocks.js";

const openDoorTab = [];

export class OpenDoorTab {

    static bind(app, html, data) {
        //let acceptedTypes = ['feat'];
        //if (acceptedTypes.includes(data.entity.type) || data.entity.data.consumableType == 'lock') {
        if (data.object.door > 0) {
            let tab = openDoorTab[app.id];
            if (!tab) {
                tab = new OpenDoorTab(app);
                openDoorTab[app.id] = tab;
            }
            tab.init(html, data);
        }
    }

    constructor(app) {
        this.app = app;
        this.item = app.object;

        //this.hack(this.app);

        this.activate = false;
    }

    init(html) {
        this.html = html;
        this.openlock = new OpenLocks(this.item.data.flags['innocenti-openlock']);

        //if (html[0].localName !== "div") {
        //    this.html = $(html[0].parentElement.parentElement);
        //} else {
        //    this.html = html;
        //}

        let tabs = this.html.find(`.form-group`).last();
        tabs.after($(
            '<hr/><div class="form-group open-lock" data-group="primary" data-tab="innocenti-openlock"></div>'
        ));

        //$(this.html.find(`.sheet-body`)).append($(
        //    '<div class="tab open-lock" data-group="primary" data-tab="innocenti-openlock"></div>'
        //));
        this.render();
    }

    //hack(app) {
    //    app.setPosition = function (position = {}) {
    //        position.height = this._sheetTab === "details" || "openlock" ? "auto" : this.options.height;
    //        position.width = 600;
    //        return this.__proto__.__proto__.setPosition.apply(this, [position])
    //    };
    //}

    async render() {
        let template = await renderTemplate('modules/innocenti-openlock/templates/open-lock-tab.html', this.openlock);
        let el = this.html.find(`.open-lock-content`);
        if (el.length) {
            el.replaceWith(template);
        } else {
            this.html.find('.form-group.open-lock').append(template);
        }

        //let openLockEnabled = this.html.find('.open-lock-enabled');
        //if (this.openlock.enabled) {
        //    openLockEnabled.show();
        //} else {
        //    openLockEnabled.hide();
        //}


        //this.handleEvents();

        this.app.setPosition({
            height: 590,
            width: 520
        });
    }

    handleEvents() {

        this.html.find('.open-lock-content input[type="text"]').change(evt => {
            this.activate = true;
        });
    }
}