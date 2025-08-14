import { App, PluginSettingTab, Setting, setIcon, ColorComponent, SuggestModal } from 'obsidian';
import BadgePlugin from './main'; // main.ts의 BadgePlugin 클래스를 가져옴

// eslint-disable-next-line @typescript-eslint/no-var-requires
const lucideModule = require('lucide-static');
const iconNames: string[] = lucideModule.default || lucideModule || [];

// 모든 아이콘의 ID 목록을 가져오는 함수 (실제 구현 필요)
// 예: ["fas fa-pencil", "fas fa-trash", "fas fa-star", ...]
function getAllIconIds(): string[] {
    // 이 부분은 플러그인의 아이콘 팩 관리 로직에서
    // 실제 사용 가능한 모든 아이콘 ID 목록을 반환하도록 구현해야 합니다.
    // 여기서는 예시 목록을 사용합니다.
    return ["fas fa-info-circle", "fas fa-pencil-alt", "fas fa-trash-alt", "fas fa-check-circle", "fas fa-exclamation-triangle"];
}
// 1. 아이콘 선택을 위한 SuggestModal 클래스 정의
class IconSuggestModal extends SuggestModal<string> {
    // 사용자가 아이콘을 선택했을 때 실행할 콜백 함수
    onSelect: (iconId: string) => void;

    constructor(app: App, onSelect: (iconId: string) => void) {
        super(app);
        this.onSelect = onSelect;
        this.setPlaceholder("변경할 아이콘을 검색하세요...");
    }

    // 사용자가 입력한 query를 기반으로 제안 목록을 필터링하여 반환
    getSuggestions(query: string): string[] {
        const allIcons = getAllIconIds();
        const lowerCaseQuery = query.toLowerCase();

        // 입력된 텍스트를 포함하는 아이콘 ID만 필터링
        return allIcons.filter(icon =>
            icon.toLowerCase().includes(lowerCaseQuery)
        );
    }

    // 목록의 각 항목(아이콘 ID)을 화면에 렌더링
    renderSuggestion(iconId: string, el: HTMLElement) {
        // 아이콘과 텍스트를 함께 보여주어 사용자 경험을 향상시킬 수 있습니다.
        // 여기서는 간단히 텍스트만 표시합니다.
        el.setText(iconId);
    }

    // 사용자가 제안 목록에서 항목을 선택했을 때 호출됨
    onChooseSuggestion(item: string, evt: MouseEvent | KeyboardEvent) {
        // 콜백 함수를 실행하여 선택된 아이콘 ID를 전달
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

        // 상태가 변경되면 여기서 반복적으로 재랜더링되는듯
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
                            // await this.plugin.saveSettings();
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