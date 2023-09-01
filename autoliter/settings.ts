import AutoLiter from "../main";
import { App, PluginSettingTab, Setting } from "obsidian";

export class AutoLiterSettingTab extends PluginSettingTab {
    plugin: AutoLiter;

    constructor(app: App, plugin: AutoLiter) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        let { containerEl } = this;

        containerEl.empty();

        new Setting(containerEl)
            .setName("Output format")
            .setDesc("output format after update the note")
            .addText((text) =>
                text
                    .setPlaceholder("output format")
                    .setValue(this.plugin.settings.outputFormat)
                    .onChange(async (value) => {
                        this.plugin.settings.outputFormat = value;
                        await this.plugin.saveSettings();
                    })
            );
    }
}