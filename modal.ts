import { TargetLink } from "d";
import { App, Modal } from "obsidian";
import OuterLinkerPlugin from "main";

export class ConfirmReplaceModal extends Modal {
	plugin: OuterLinkerPlugin;
	targetLinks: TargetLink[];
	constructor(
		app: App,
		targetLinks: TargetLink[],
		plugin: OuterLinkerPlugin
	) {
		super(app);
		this.targetLinks = targetLinks;
		this.plugin = plugin;
		this.open();
	}

	onOpen() {
		const form = document.createElement("div");
		form.addClass("modal-content");

		const title = document.createElement("h1");
		title.setText("Confirm Replace to DoubleLinks");
		form.appendChild(title);

		// Create a table element
		const table = document.createElement("table");

		this.targetLinks.forEach((link) =>
			link.matches.forEach((match) => {
				const linkContainer = document.createElement("tr");

				// Context cell
				const contextCell = document.createElement("td");

				const contextText = document.createElement("div");
				contextText.textContent =
					match.preContent + match.targetContent + match.postContent;
				contextCell.appendChild(contextText);

				const basenameText = document.createElement("div");
				basenameText.classList.add("basename-text-style");

				if (this.plugin.settings.showPath) {
					basenameText.textContent = link.file.path;
				} else {
					basenameText.textContent = link.file.basename;
				}
				contextCell.appendChild(basenameText);

				// Checkbox cell
				const checkboxCell = document.createElement("td");

				const checkbox = document.createElement("input");
				checkbox.setAttribute("type", "checkbox");
				checkbox.addClass("link-container-right-align");
				checkbox.checked = match.checked;
				checkbox.addEventListener("change", () => {
					match.checked = checkbox.checked;
				});
				checkboxCell.appendChild(checkbox);

				linkContainer.appendChild(contextCell);
				linkContainer.appendChild(checkboxCell);
				table.appendChild(linkContainer);
			})
		);

		form.appendChild(table);
		const buttons = document.createElement("div");
		buttons.addClass("modal-button-container");

		const replaceButton = document.createElement("button");
		replaceButton.setText("Replace");
		replaceButton.addEventListener("click", () => this.replaceLinks());
		buttons.appendChild(replaceButton);

		const cancelButton = document.createElement("button");
		cancelButton.setText("Cancel");
		cancelButton.addEventListener("click", () => this.close());
		buttons.appendChild(cancelButton);

		form.appendChild(buttons);

		this.contentEl.appendChild(form);
	}

	replaceLinks() {
		// 遍历选中的链接，并替换为双链形式
		const editor = this.app.workspace.activeEditor?.editor;
		if (!editor) return;
		let content = editor.getValue();

		this.targetLinks.forEach((link) =>
			link.matches.forEach((match) => {
				if (!match.checked) return;
				const originalContent =
					match.preContent + match.targetContent + match.postContent;
				const replacement =
					match.preContent +
					`[[${match.targetContent}]]` +
					match.postContent;

				content = content.replace(originalContent, replacement);
			})
		);
		editor.setValue(content);
		this.close();
	}
}
