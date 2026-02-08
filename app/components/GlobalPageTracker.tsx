'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { analytics } from '@/app/lib/analytics';

// Module-level variable to prevent duplicate logging (e.g. React Strict Mode in dev)
let lastLoggedPath: string | null = null;

function PageTrackerContent() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Simple deduping: if path and params haven't changed, ignore.
        // This handles React Strict Mode double-invocation in dev.
        const currentPathKey = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');

        if (lastLoggedPath === currentPathKey) {
            return;
        }

        // Update last logged path immediately
        lastLoggedPath = currentPathKey;

        // Map paths to screen names
        let screenName = 'unknown';

        if (pathname === '/') {
            screenName = 'main';
        } else if (pathname === '/balance-care') {
            screenName = 'recommend_1';
        } else if (pathname === '/goal-care') {
            screenName = 'recommend_2';
        } else if (pathname === '/part-care') {
            screenName = 'recommend_3';
        } else if (pathname === '/history') {
            screenName = 'calendar';
        } else if (pathname === '/profile') {
            screenName = 'profile';
        } else if (pathname === '/onboarding') {
            screenName = 'onboarding';
        } else if (pathname.includes('/runner')) {
            // Runner pages handled internally
            return;
        } else {
            return; // Don't log unknown paths
        }

        analytics.logEvent('pageview', {
            screen_name: screenName,
            path: pathname
        });

    }, [pathname, searchParams]);

    return null;
}

export function GlobalPageTracker() {
    return (
        <Suspense fallback={null}>
            <PageTrackerContent />
        </Suspense>
    );
}
