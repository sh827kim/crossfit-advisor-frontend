'use client';

type EventType = 'pageview' | 'click';

interface BaseParams {
    screen_name: string;
    uu: string;
    device: string;
    ts?: number;
    path?: string;
}

interface PageViewParams extends BaseParams {
    // No extra params in Final Spec
}

interface ClickParams extends BaseParams {
    target: string;
    event_category?: string; // Optional in interface but required by spec logic if strict
    target_no?: number; // Not in Final Spec table explicitly, but useful? Final Spec removed target_no.
    // Final Spec Table columns: screen_name, event_category, target, params
    // So target_no is gone.
    time_select?: string | number;
    time_result?: string | number;
    selected_wod?: string;
    selected_goal?: string;
    selected_target?: string;
}

type EventParams = PageViewParams | ClickParams;

const STORAGE_KEY_UU = 'crossfit_advisor_uu';

declare global {
    interface Window {
        gtag: (...args: any[]) => void;
    }
}

class AnalyticsService {
    private static instance: AnalyticsService;
    private uu: string = '';
    private device: string = '';

    private constructor() {
        if (typeof window !== 'undefined') {
            this.initUU();
            this.initDevice();
        }
    }

    public static getInstance(): AnalyticsService {
        if (!AnalyticsService.instance) {
            AnalyticsService.instance = new AnalyticsService();
        }
        return AnalyticsService.instance;
    }

    private initUU() {
        const storedUU = localStorage.getItem(STORAGE_KEY_UU);
        if (storedUU) {
            this.uu = storedUU;
        } else {
            this.uu = crypto.randomUUID();
            localStorage.setItem(STORAGE_KEY_UU, this.uu);
        }
    }

    private initDevice() {
        const ua = navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod/.test(ua)) {
            this.device = 'ios';
        } else if (/android/.test(ua)) {
            this.device = 'android';
        } else if (/mac os/.test(ua)) {
            this.device = 'mac';
        } else if (/windows/.test(ua)) {
            this.device = 'window';
        } else {
            this.device = 'unknown';
        }
    }

    public logEvent(eventType: 'pageview', params: Omit<PageViewParams, 'uu' | 'device'>): void;
    public logEvent(eventType: 'click', params: Omit<ClickParams, 'uu' | 'device'>): void;
    public logEvent(eventType: EventType, params: any) {
        if (typeof window === 'undefined') return;

        const fullParams = {
            ...params,
            uu: this.uu,
            device: this.device,
            ts: Date.now(),
        };

        // Console Logging (Development / Preview)
        if (process.env.NODE_ENV === 'development') {
            console.log(`%c[Analytics] ${eventType}`, 'color: #00ff00; font-weight: bold;', fullParams);
        }

        // Send to GA4
        this.sendToGA4(eventType, fullParams);
    }

    private sendToGA4(eventType: EventType, params: any) {
        if (typeof window === 'undefined' || !window.gtag) return;

        // GA4 Event Mapping
        if (eventType === 'pageview') {
            window.gtag('event', 'page_view', {
                page_title: params.screen_name,
                screen_name: params.screen_name,
                ...params
            });
        } else if (eventType === 'click') {
            window.gtag('event', 'click', {
                event_category: params.event_category,
                event_label: params.target,
                ...params
            });
        }
    }
}

export const analytics = AnalyticsService.getInstance();
