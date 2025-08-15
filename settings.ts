import { App, PluginSettingTab, Setting, setIcon, ColorComponent, SuggestModal } from 'obsidian';
import BadgePlugin from './main';

const lucideModule = require('lucide-static');
const iconNames: string[] = lucideModule.default || lucideModule || [];


function getAllIconIds(): string[] {
    return ["fas fa-info-circle", "fas fa-pencil-alt", "fas fa-trash-alt", "fas fa-check-circle", "fas fa-exclamation-triangle"];
}

class IconSuggestModal extends SuggestModal<string> {

    onSelect: (iconId: string) => void;

    constructor(app: App, onSelect: (iconId: string) => void) {
        super(app);
        this.onSelect = onSelect;
        this.setPlaceholder("변경할 아이콘을 검색하세요...");
    }

    getSuggestions(query: string): string[] {
        const allIcons = getAllIconIds();
        const lowerCaseQuery = query.toLowerCase();

        return allIcons.filter(icon =>
            icon.toLowerCase().includes(lowerCaseQuery)
        );
    }

    renderSuggestion(iconId: string, el: HTMLElement) {
        el.setText(iconId);
    }


    onChooseSuggestion(item: string, evt: MouseEvent | KeyboardEvent) {
        this.onSelect(item);
    }
}


export class BadgeSettingTab extends PluginSettingTab {
    plugin: BadgePlugin;

    constructor(app: App, plugin: BadgePlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: '뱃지 관리' });
        containerEl.createEl('p', { text: '뱃지관리를 위한 화면', cls: 'badge-setting-title-desc' })

        new Setting(containerEl)
            .setName('새 뱃지 추가')
            .addButton(button => {
                button
                    .setButtonText('추가')
                    .setCta()
                    .onClick(async () => {
                        this.plugin.settings.badges.push({ name: '새 뱃지', icon: 'tag', backgroundColor: '#F4FFDB', accentColor: '#FFFFFF', hasBorder: false });
                        await this.plugin.saveSettings();
                        this.display();
                    });
            });

        this.plugin.settings.badges.forEach((badge, index) => {

            const setting = new Setting(containerEl);

            const previewEl = containerEl.createEl('div', { cls: 'badge-preview' });
            previewEl.style.backgroundColor = badge.backgroundColor;
            if (badge.hasBorder) {
                previewEl.style.borderWidth = '1px';
                previewEl.style.borderColor = badge.accentColor;
            } else {
                previewEl.style.borderWidth = '0';
            }
            const iconEl = previewEl.createSpan({ cls: 'badge-icon' });
            setIcon(iconEl, badge.icon);
            iconEl.style.color = badge.accentColor;

            const nameEl = previewEl.createSpan({ cls: 'badge-name', text: badge.name });
            nameEl.style.color = badge.accentColor;
            setting.controlEl.prepend(previewEl);

            setting
                .addText(text => text
                    .setPlaceholder('뱃지 이름')
                    .setValue(badge.name)
                    .onChange(async (value) => {
                        this.plugin.settings.badges[index].name = value;
                        await this.plugin.saveSettings();
                        this.display();
                    }));

            setting.addExtraButton(button => {
                button
                    .setIcon(badge.icon)
                    .setTooltip('아이콘 변경')
                    .onClick(() => {
                        new IconSuggestModal(this.app, (selectedIcon) => {
                            badge.icon = selectedIcon;
                            button.setIcon(selectedIcon);
                        }).open();
                    });
            });
            setting.addToggle(toggle => {
                toggle
                    .setTooltip('테두리 표시/숨기기')
                    .setValue(badge.hasBorder)
                    .onChange(async (value) => {
                        this.plugin.settings.badges[index].hasBorder = value;
                        await this.plugin.saveSettings();
                        this.display();
                    });
            });
            const colorContainer = setting.controlEl.createDiv({ cls: 'color-pickers-container' });

            const bgColorWrapper = colorContainer.createDiv({ cls: 'color-picker-wrapper' });
            // bgColorWrapper.setAttribute('title', '배경색');
            new ColorComponent(bgColorWrapper)
                .setValue(badge.backgroundColor)
                .onChange(async (value) => {
                    this.plugin.settings.badges[index].backgroundColor = value;
                    await this.plugin.saveSettings();
                    this.display();
                });

            const accentColorWrapper = colorContainer.createDiv({ cls: 'color-picker-wrapper' });
            // accentColorWrapper.setAttribute('title', '강조색');
            new ColorComponent(accentColorWrapper)
                .setValue(badge.accentColor)
                .onChange(async (value) => {
                    this.plugin.settings.badges[index].accentColor = value;
                    await this.plugin.saveSettings();
                    this.display();
                });

            setting.addExtraButton(button => {
                button
                    .setIcon('x')
                    .setTooltip('삭제하기')
                    .onClick(async () => {
                        this.plugin.settings.badges.splice(index, 1);
                        await this.plugin.saveSettings();
                        this.display();
                    });
            });
        });
    }
}