export class SettingsManager {
    constructor() {
        this.clearSettings();
    }

    getSettings(){
        return this.Settings;
    };

    clearSettings(){
        this.Settings = {
            BriefingPreview: {},
            Stories: {},
            ProfileEditor: {}
        };
    };
}
