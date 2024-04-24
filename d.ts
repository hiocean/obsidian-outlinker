import { TFile } from "obsidian";

export interface TargetLink {
	file: TFile;
	matches: RegMatch[];
}
export interface RegMatch {
	preContent: string;
	targetContent: string;
	postContent: string;
	checked: boolean;
}
