// 뱃지 하나의 데이터 구조
export interface Badge {
    name: string;
    icon: string;
    backgroundColor: string;
    accentColor: string;
    hasBorder: boolean; // <<< 이 줄을 추가하세요.
}

// 플러그인 전체 설정의 데이터 구조
export interface BadgePluginSettings {
    badges: Badge[];
}

// 플러그인 설치 시 기본으로 생성될 뱃지 설정
export const DEFAULT_SETTINGS: BadgePluginSettings = {
    badges: [
        { name: 'idea', icon: 'lightbulb', backgroundColor: '#2C3E50', accentColor: '#FFD700', hasBorder: true }, // hasBorder 추가
        { name: 'question', icon: 'help-circle', backgroundColor: '#2C3E50', accentColor: '#87CEEB', hasBorder: true }, // hasBorder 추가
    ]
}