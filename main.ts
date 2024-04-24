import { ConfirmReplaceModal } from "modal";
import { TargetLink } from "d";
import { Plugin, Notice } from "obsidian";
import OuterLinkerSettingsTab, {
	DEFAULT_SETTINGS,
	OuterLinkerPluginSettings,
} from "settings";

export default class OuterLinkerPlugin extends Plugin {
	settings: OuterLinkerPluginSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new OuterLinkerSettingsTab(this.app, this));

		this.addCommand({
			id: "accept-links",
			name: "Accept Links",
			callback: () => this.acceptLinks(),
		});
		this.addStatusBarItem()
			.createEl("span", {
				text: "Replace Links",
				cls: "status-bar-item",
			})
			.addEventListener("click", () => this.acceptLinks());
	}

	async onunload() {
		console.log("Unloading OuterLinker plugin");
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

	async acceptLinks() {
		const targetLinks = this.getTargetLinks();
		if (targetLinks.length === 0) {
			new Notice("No links Found");
			return;
		}
		const modal = new ConfirmReplaceModal(this.app, targetLinks, this);
		modal.open();
	}

	getTargetLinks(): TargetLink[] {
		// 获取当前编辑窗口
		const editor = this.app.workspace.activeEditor?.editor;

		if (!editor) return [];

		// 获取编辑窗口中的内容
		const content = editor.getValue();

		// 获取设置中的正则表达式和搜索文件夹
		const { regularExpressions, folder } = this.settings;

		// 在指定文件夹中搜索匹配的文件
		const files = this.app.vault.getFiles();
		const matchingFiles = files.filter((file) =>
			file.path.startsWith(folder)
		);

		// 使用正则表达式匹配内容
		const results: TargetLink[] = [];

		regularExpressions.forEach((regexStr) => {
			const regexp = new RegExp(`(?<!\\[)${regexStr}(?!\\])`, "g");

			let match;
			while ((match = regexp.exec(content)) !== null) {
				const pre = Math.max(0, match.index - 10);
				const pos = match.index + match[0].length;
				const preContent = content.slice(pre, match.index);
				const targetContent = content.slice(match.index, pos);
				const postContent = content.slice(pos, pos + 10);

				// 查找匹配的文件
				const matchingFile = matchingFiles.find((file) => {
					if (file.basename === match[0]) return true;
					const fileCache = this.app.metadataCache.getFileCache(file);
					const alias = fileCache?.frontmatter?.alias;
					if (alias === match[0]) return true;
					return false;
				});

				if (matchingFile) {
					results.push({
						file: matchingFile,
						matches: [
							{
								preContent: preContent,
								targetContent: targetContent,
								postContent: postContent,
								checked: true,
							},
						],
					});
				}
			}
		});

		return results;
	}
}
