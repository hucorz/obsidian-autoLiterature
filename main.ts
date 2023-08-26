import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, Vault} from 'obsidian';
import PatternRecognizer from 'autoliter/patternRecognizer';
import {getReplaceDict} from 'autoliter/utils'

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class AutoLiter extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();
		const paperRecognizer = new PatternRecognizer(/- \{.{3,}\}/g); // g is must

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('book-down', 'AutoLiter', async (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('start updating vault.');
			await Promise.all(this.app.vault.getMarkdownFiles().map(file => this.updateNote(file, paperRecognizer)));
			new Notice("finish updating vault.");
		});;
	}

	onunload() {
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async updateNote(file: TFile, paperRecognizer: PatternRecognizer) {
		const content = await this.app.vault.read(file);
		const m = paperRecognizer.findAll(content);
		if (m && m.length != 0) {
			const replaceDict = await getReplaceDict(m, file);
			this.update(this.app.vault, file, replaceDict);
		}
	}

	update(vault: Vault, file: TFile, repalceDict: { [key: string]: string }): Promise<string> {
		return vault.process(file, (data) => {
			Object.keys(repalceDict).forEach( key => {
				data = data.replace(key, repalceDict[key]);
			})
			return data;
		})
	}
}

