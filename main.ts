import { Plugin } from 'obsidian';
import { BadgePluginSettings, DEFAULT_SETTINGS } from './types';
import { BadgeSettingTab } from './settings';

export default class BadgePlugin extends Plugin {
	settings: BadgePluginSettings;

	async onload() {
		await this.loadSettings();

		// 설정 탭 추가
		this.addSettingTab(new BadgeSettingTab(this.app, this));
	}

	onunload() { }

	// 설정 데이터 불러오기
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	// 설정 데이터 저장하기
	async saveSettings() {
		await this.saveData(this.settings);
	}
}