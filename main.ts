import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, Vault } from 'obsidian';
import PatternRecognizer from 'autoliter/patternRecognizer';
import { getReplaceDict } from 'autoliter/utils'
import { AutoLiterSettingTab } from 'autoliter/settings'

interface AutoLiterSettings {
	outputFormat: string;
	regExp: string;
}


const DEFAULT_SETTINGS: AutoLiterSettings = {
	// example: "------\n**${title}** ([link](${url}))\n\t- *${author} et.al.*\n\t- ${journal}\n\t- ${pubDate}\n\n------\n"
	outputFormat: "- **${title}** ([link](${url}))\n\t- *${author} et.al.*\n\t- ${journal}\n\t- ${pubDate}",
	regExp: "- \{.{3,}\}"
}


export default class AutoLiter extends Plugin {
	settings: AutoLiterSettings;
	paperRecognizer: PatternRecognizer;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new AutoLiterSettingTab(this.app, this));

		this.paperRecognizer = new PatternRecognizer(`${this.settings.regExp}`); // g is must

		// Icon in the left ribbon: update active file 
		const ribbonIconEl = this.addRibbonIcon('book-down', 'AutoLiter', async (evt: MouseEvent) => {
			new Notice('start updating vault.');
			const activeFile = this.app.workspace.getActiveFile();
			if (activeFile) {
				await this.updateFile(activeFile, this.paperRecognizer);
			}
			new Notice("finish updating vault.");
		});

		// Command: update the whole vault
		this.addCommand({
			id: "update-vault",
			name: "Update the whole vault",
			editorCallback: async (editor: Editor) => {
				new Notice('start updating vault.');
				await Promise.all(this.app.vault.getMarkdownFiles().map(file => this.updateFile(file, this.paperRecognizer)));
				new Notice("finish updating vault.");
			},
		});

		// Command: update selected text
		this.addCommand({
			id: "update-selected",
			name: "Update selected text",
			editorCallback: async (editor: Editor) => {
				new Notice('start updating selection.');
				const selection = editor.getSelection();
				editor.replaceSelection(await this.updateSelected(selection, this.paperRecognizer));
				new Notice("finish updating selection.");
			},
		});

	}

	onunload() {
	}

	async updateFile(file: TFile, paperRecognizer: PatternRecognizer) {
		const content = await this.app.vault.read(file);
		const m = paperRecognizer.findAll(content);

		if (m && m.length != 0) {
			const progressNotice = new Notice(`Updating ${file.path}...`);
			const replaceDict = await getReplaceDict(m, this.settings.outputFormat);
			this.app.vault.process(file, (data) => {
				Object.keys(replaceDict).forEach(key => {
					data = data.replace(key, replaceDict[key]);
				})
				return data;
			})
		}
	}

	async updateSelected(selection: string, paperRecognizer: PatternRecognizer) {
		const m = paperRecognizer.findAll(selection);
		if (m && m.length != 0) {
			const progressNotice = new Notice(`Updating selection...`);
			const replaceDict = await getReplaceDict(m, this.settings.outputFormat);
			Object.keys(replaceDict).forEach(key => {
				selection = selection.replace(key, replaceDict[key]);
			})
		}
		return selection;
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

