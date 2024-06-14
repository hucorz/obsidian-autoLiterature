import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	TFile,
	Vault,
	requestUrl,
} from "obsidian";
import PatternRecognizer from "autoliter/patternRecognizer";
import { getReplaceDict } from "autoliter/utils";
import { AutoLiterSettingTab } from "autoliter/settings";

interface AutoLiterSettings {
	outputFormat: string;
	regExp: string;
	autoDownloadPDF: boolean;
	pdfDownloadPathCalculation: string;
	pdfDownloadPath: string;
}

const DEFAULT_SETTINGS: AutoLiterSettings = {
	// example: "------\n**${title}** ([link](${url}))\n\t- *${author} et.al.*\n\t- ${journal}\n\t- ${pubDate}\n\n------\n"
	outputFormat:
		"- **${title}** ([link](${url}))\n\t- *${author} et.al.*\n\t- ${journal}\n\t- ${pubDate}",
	regExp: "- {.{3,}}",
	autoDownloadPDF: false,
	pdfDownloadPathCalculation: "vault",
	pdfDownloadPath: "pdfs",
};

export default class AutoLiter extends Plugin {
	settings: AutoLiterSettings;
	paperRecognizer: PatternRecognizer;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new AutoLiterSettingTab(this.app, this));

		this.paperRecognizer = new PatternRecognizer(`${this.settings.regExp}`); // g is must

		// Icon in the left ribbon: update active file
		const ribbonIconEl = this.addRibbonIcon(
			"book-down",
			"AutoLiter",
			async (evt: MouseEvent) => {
				new Notice("start updating vault.");
				const activeFile = this.app.workspace.getActiveFile();
				if (activeFile) {
					await this.updateFile(activeFile, this.paperRecognizer);
				}
				new Notice("finish updating vault.");
			}
		);

		// Command: update the whole vault
		this.addCommand({
			id: "update-vault",
			name: "Update the whole vault",
			editorCallback: async (editor: Editor) => {
				new Notice("start updating vault.");
				await Promise.all(
					this.app.vault
						.getMarkdownFiles()
						.map((file) =>
							this.updateFile(file, this.paperRecognizer)
						)
				);
				new Notice("finish updating vault.");
			},
		});

		// Command: update selected text
		this.addCommand({
			id: "update-selected",
			name: "Update selected text",
			editorCallback: async (editor: Editor) => {
				new Notice("start updating selection.");
				const selection = editor.getSelection();
				editor.replaceSelection(
					await this.updateSelected(selection, this.paperRecognizer)
				);
				new Notice("finish updating selection.");
			},
		});
	}

	onunload() {}

	async updateFile(file: TFile, paperRecognizer: PatternRecognizer) {
		const content = await this.app.vault.read(file);
		const m = paperRecognizer.findAll(content);
		console.log(this.app.workspace.getActiveFile());

		if (m && m.length != 0) {
			const progressNotice = new Notice(`Updating ${file.path}...`);
			const [replaceDict, pdfUrls, paperInfo] = await getReplaceDict(
				m,
				this.settings.outputFormat
			);
			console.log(replaceDict);
			this.app.vault.process(file, (data) => {
				Object.keys(replaceDict).forEach((key, idx) => {
					data = data.replace(key, replaceDict[key] as string);
					try {
						this.settings.autoDownloadPDF &&
							this.downloadPdf(
								pdfUrls[idx],
								`${paperInfo[idx].title}.pdf`
							);
					} catch (error) {}
				});
				return data;
			});
		}
	}

	async updateSelected(
		selection: string,
		paperRecognizer: PatternRecognizer
	) {
		const m = paperRecognizer.findAll(selection);
		if (m && m.length != 0) {
			const progressNotice = new Notice(`Updating selection...`);
			const [replaceDict, pdfUrls, paperInfo] = await getReplaceDict(
				m,
				this.settings.outputFormat
			);
			Object.keys(replaceDict).forEach((key) => {
				selection = selection.replace(key, replaceDict[key] as string);
			});
		}
		return selection;
	}

	async downloadPdf(pdfUrl: string, fileName: string): Promise<void> {
		try {
			const response = await requestUrl({
				url: pdfUrl,
				method: "GET",
				contentType: "application/pdf",
			});

			// 将 response 数据转换为 Uint8Array
			const uint8Array = new Uint8Array(response.arrayBuffer);

			const vault = this.app.vault;
			let folderPath = null;
			try {
				if (this.settings.pdfDownloadPathCalculation === "mdFile") {
					const activeFile = this.app.workspace.getActiveFile();
					// activeFile 的文件夹
					if (activeFile) {
						const activeFileFolder = activeFile.path
							.split("/")
							.slice(0, -1)
							.join("/");
						folderPath = this.joinPaths(
							activeFileFolder,
							this.settings.pdfDownloadPath
						);
						await vault.createFolder(folderPath);
					}
				} else {
					folderPath = this.settings.pdfDownloadPath;
					await vault.createFolder(this.settings.pdfDownloadPath);
				}
			} catch (error) {
				// Ignore if folder already exists
			}

			fileName = fileName.replace(/[/\\?%*:|"<>]/g, "-");
			const filePath = this.joinPaths(folderPath as string, fileName);

			// 保存文件到 vault 中
			await vault.createBinary(filePath, uint8Array);
			new Notice(`Downloaded PDF: ${fileName}`);
		} catch (error) {
			throw new Notice(`Error downloading PDF: ${error.message}`);
		}
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	joinPaths(basePath: string, relativePath: string) {
		if (relativePath.startsWith("./")) {
			return basePath + relativePath.slice(1);
		} else {
			return basePath + "/" + relativePath;
		}
	}
}
