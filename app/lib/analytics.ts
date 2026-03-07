'use client';

type EventType =
    | 'request_recommendation'
    | 'start_workout'
    | 'regenerate_plan'
    | 'complete_workout'
    | 'cancel_workout'
    | 'share'
    | 'record_workout'
    | 'view_calendar';

interface BaseParams {
    uu: string;
    ts?: number;
    path?: string;
}

interface CustomEventParams extends BaseParams {
    recommend_type?: 'selected_wod' | 'selected_goal' | 'selected_target';
    time_select?: string | number;
    time_result?: string | number;
    content_type?: string;
}

const STORAGE_KEY_UU = 'crossfit_advisor_uu';

declare global {
    interface Window {
        gtag: (...args: any[]) => void;
    }
}

class AnalyticsService {
    private static instance: AnalyticsService;
    private uu: string = '';

    private constructor() {
        if (typeof window !== 'undefined') {
            this.initUU();
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

    public logEvent(eventType: EventType, params?: Omit<CustomEventParams, 'uu'>): void {
        if (typeof window === 'undefined') return;

        const fullParams = {
            ...params,
            uu: this.uu,
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

        // New Semantic Events
        window.gtag('event', eventType, {
            ...params
        });
    }
}

export const analytics = AnalyticsService.getInstance();
