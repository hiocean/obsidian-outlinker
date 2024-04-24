import OuterLinkerPlugin from "main";
import { App, PluginSettingTab, Setting } from "obsidian";

export interface OuterLinkerPluginSettings {
	regularExpressions: string[];
	folder: string;
	showPath: boolean;
}
export const DEFAULT_SETTINGS: OuterLinkerPluginSettings = {
	regularExpressions: ["\\bexample\\b"],
	folder: "",
	showPath: true,
};

export default class OuterLinkerSettingsTab extends PluginSettingTab {
	plugin: OuterLinkerPlugin;

	constructor(app: App, plugin: OuterLinkerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl("h2", { text: "Outer Linker Settings" });

		new Setting(containerEl)
			.setName("Regular Expressions")
			.setDesc("Enter regular expressions for matching links.")
			.addTextArea((text) => {
				text.setValue(
					this.plugin.settings.regularExpressions.join("\n")
				)
					.setPlaceholder("Enter regex patterns separated by newline")
					.onChange(async (value) => {
						this.plugin.settings.regularExpressions =
							value.split("\n");
						await this.plugin.saveSettings();
					})
					.inputEl.setAttribute(
						"style",
						"min-height: 100px;min-width: 350px;"
					);
			});
		new Setting(containerEl)
			.setName("Search Folder")
			.setDesc("Enter the folder to search for matching files.")
			.addText((text) => {
				text.setValue(this.plugin.settings.folder)
					.setPlaceholder("Enter search folder")
					.onChange(async (value) => {
						this.plugin.settings.folder = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Show Path")
			.setDesc("Toggle to show or hide the path. Default: show the path.")
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.showPath)
					.onChange(async (value) => {
						this.plugin.settings.showPath = value;
						await this.plugin.saveSettings();
					});
			});
	}
}
