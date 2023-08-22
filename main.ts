import * as fs from 'fs';
import * as path from 'path';

import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, Vault} from 'obsidian';
import PatternRecognizer from 'autoliter/patternRecognizer';
import {getReplaceDcit} from 'autoliter/utils'

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();
		const paperRecognizer = new PatternRecognizer(/- \{.{3,}\}/g); // g is must

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('book-down', 'AutoLiter', async (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			const notice = new Notice('start updating vault.');
			
			const files = this.app.vault.getMarkdownFiles()

			const tasks: Promise<void>[] = [];
			for (let i = 0; i < files.length; i++) {
				tasks.push(this.updateLiter(files[i], paperRecognizer));
			}
			await Promise.all(tasks);
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

	async updateLiter(file: TFile, paperRecognizer: PatternRecognizer) {
		const vaultBasePath = this.app.vault.adapter.basePath!;
		const filePath = path.resolve(vaultBasePath, file.path)
		const content = await fs.promises.readFile(filePath, { encoding: 'utf-8', flag: 'r' });
	
		const m = paperRecognizer.findAll(content);
		
		if (m.length != 0) {
			const replaceDict = await getReplaceDcit(m, file);
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

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

