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
            .setName("Regular expression")
            .setDesc("regular expression to match the literature")
            .addText((text) =>
                text.setPlaceholder("regular expression")
                    .setValue(this.plugin.settings.regExp)
                    .onChange(async (value) => {
                        this.plugin.settings.regExp = value;
                        this.plugin.paperRecognizer.pattern = value;
                        await this.plugin.saveSettings();
                    })
            );
        new Setting(containerEl)
            .setName("Output format")
            .setDesc("output format after update the note")
            .addTextArea((text) =>
                text.setPlaceholder("output format")
                    .setValue(this.plugin.settings.outputFormat)
                    .onChange(async (value) => {
                        this.plugin.settings.outputFormat = value;
                        await this.plugin.saveSettings();
                    })
            );
        
        // new Setting(containerEl)
        //     .setName("Default setting")
        //     .setDesc("set the default setting")
        //     .addButton((btn) =>
        //         btn.setButtonText("Set default")
        //             .onClick(async () => {
        //                 this.plugin.settings = this.plugin.defaultSettings;
        //                 await this.plugin.saveSettings();
        //             }
        //             )
        //     )
    }
}