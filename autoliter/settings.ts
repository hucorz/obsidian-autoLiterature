import AutoLiter from "../main";
import { App, PluginSettingTab, Setting, TextComponent } from "obsidian";

export class AutoLiterSettingTab extends PluginSettingTab {
	plugin: AutoLiter;

	constructor(app: App, plugin: AutoLiter) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let { containerEl } = this;

		containerEl.empty();

		// General Settings
		containerEl.createEl('h2', {text: 'General'});

		new Setting(containerEl)
			.setName("Regular expression")
			.setDesc("regular expression to match the literature")
			.addText((text) =>
				text
					.setPlaceholder("regular expression")
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
			.addTextArea(
				(text) =>
					(text
						.setPlaceholder("output format")
						.setValue(this.plugin.settings.outputFormat)
						.onChange(async (value) => {
							this.plugin.settings.outputFormat = value;
							await this.plugin.saveSettings();
						}).inputEl.style.cssText =
						"width: 100%; height: 100px;")
			);

		// PDF Settings
		containerEl.createEl('h2', {text: 'PDF File'});

		new Setting(containerEl)
			.setName("Auto download PDF")
			.setDesc("Automatically download PDFs when updating notes")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.autoDownloadPDF)
					.onChange(async (value) => {
						this.plugin.settings.autoDownloadPDF = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("PDF Storage Path Base")
			.setDesc(
				"Determine the base path for storing downloaded PDF files, relative to the vault or the markdown file."
			)
			.addDropdown((dropdown) =>
				dropdown
					.addOptions({
						vault: "vault",
						mdFile: "mdFile",
					})
					.setValue(this.plugin.settings.pdfDownloadPathBase)
					.onChange(async (value) => {
						this.plugin.settings.pdfDownloadPathBase = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("PDF Storage Path")
			.setDesc("The path for storing downloaded PDF files")
			.addText((text) =>
				text
					.setPlaceholder("path")
					.setValue(this.plugin.settings.pdfDownloadPath)
					.onChange(async (value) => {
						this.plugin.settings.pdfDownloadPath = value;
						await this.plugin.saveSettings();
					})
			);

		let customFormatTextComponent: TextComponent;

		new Setting(containerEl)
			.setName("PDF File Name Format")
			.setDesc("Choose how to name downloaded PDF files")
			.addDropdown((dropdown) =>
				dropdown
					.addOptions({
						title: "Paper Title",
						id: "Paper ID",
						custom: "Custom",
					})
					.setValue(this.plugin.settings.pdfNameFormat)
					.onChange(async (value: "title" | "id" | "custom") => {
						this.plugin.settings.pdfNameFormat = value;
						// 设置自定义格式输入框的禁用状态
						customFormatTextComponent?.setDisabled(
							value !== "custom"
						);
						// 添加或移除禁用状态的样式类
						const inputEl = customFormatTextComponent?.inputEl;
						if (inputEl) {
							if (value !== "custom") {
								inputEl.addClass("setting-disabled");
							} else {
								inputEl.removeClass("setting-disabled");
							}
						}
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setClass("custom-pdf-format-setting")
			.setName("Custom PDF Format")
			.setDesc("Define custom format for PDF file names.")
			.addText((text) => {
				customFormatTextComponent = text
					.setPlaceholder("${title}")
					.setValue(this.plugin.settings.customPdfNameFormat)
					.onChange(async (value) => {
						this.plugin.settings.customPdfNameFormat = value;
						await this.plugin.saveSettings();
					});
				// 初始化时设置禁用状态和样式类
				customFormatTextComponent.setDisabled(
					this.plugin.settings.pdfNameFormat !== "custom"
				);
				if (this.plugin.settings.pdfNameFormat !== "custom") {
					customFormatTextComponent.inputEl.addClass(
						"setting-disabled"
					);
				}
				return customFormatTextComponent;
			});
	}
}
