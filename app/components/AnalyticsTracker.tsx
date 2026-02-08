'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { analytics } from '@/app/lib/analytics';

const SCREEN_NAME_MAP: Record<string, string> = {
    '/': 'main',
    '/balance-care': 'recommend_1',
    '/goal-care': 'recommend_2',
    '/part-care': 'recommend_3',
    '/history': 'calendar',
    '/onboarding': 'onboarding', // Added for completeness
    '/profile': 'profile',       // Added for completeness
};

export function AnalyticsTracker() {
    const pathname = usePathname();
    const prevPathname = useRef<string | null>(null);

    useEffect(() => {
        // Prevent duplicate logging if pathname hasn't actually changed (though Next.js handles this well usually)
        if (prevPathname.current === pathname) return;
        prevPathname.current = pathname;

        const screenName = SCREEN_NAME_MAP[pathname];

        if (screenName) {
            analytics.logEvent('pageview', {
                screen_name: screenName
            });
        }
        // Note: 'workout' and 'workout_result' screens (runner pages) are tracked internally within those pages
        // because they are SPA-style states, not URL changes.

    }, [pathname]);

    return null;
}
