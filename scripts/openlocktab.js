import { OpenLocks } from "./openlocks.js";

const openLockTab = [];

export class OpenLockTab {

    static bind(app, html, data) {
        let acceptedTypes = ['feat'];
        if (acceptedTypes.includes(data.document.type)) {
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

        if (html[0].localName !== "div") {
            html = $(html[0].parentElement.parentElement);
        }

        let tabs = html.find(`form nav.sheet-navigation.tabs`);
        if (tabs.find('a[data-tab=innocenti-openlock]').length > 0) {
            return; // already initialized, duplication bug!
        }

        tabs.append($(
            '<a class="item" data-tab="innocenti-openlock">Open Lock</a>'
        ));

        $(html.find(`.sheet-body`)).append($(
            '<div class="tab open-lock" data-group="primary" data-tab="innocenti-openlock"></div>'
        ));

        this.html = html;

        this.openlock = new OpenLocks(this.item.data.flags['innocenti-openlock']); 

        this.render();
    }
    hack(app) {
        let tab = this;
        app.setPosition = function (position = {}) {
            position.height = tab.isActive() && !position.height ? "auto" : position.height;
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
    }

    isActive() {
        return $('a.item[data-tab="innocenti-openlock"]').hasClass("active");
    }
}