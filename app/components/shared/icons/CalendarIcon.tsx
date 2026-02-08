import { cn } from "@/app/lib/utils";

interface CalendarIconProps {
    className?: string;
}

export function CalendarIcon({ className }: CalendarIconProps) {
    return (
        <svg
            width="24"
            height="24"
            viewBox="310 54 20 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("w-5 h-5", className)}
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M312.5 75.0856C312.003 75.0856 311.6 74.6828 311.6 74.1856V58.4806C311.6 57.9833 312.003 57.5806 312.5 57.5806H329.487C329.984 57.5806 330.387 57.9833 330.387 58.4806V74.1856C330.387 74.6828 329.984 75.0856 329.487 75.0856H312.5Z"
                stroke="currentColor"
                strokeWidth="1.75"
            />
            <path d="M316.232 60.161V55" stroke="currentColor" strokeWidth="1.75" />
            <path d="M325.755 60.161V55" stroke="currentColor" strokeWidth="1.75" />
            <path d="M327.26 70.9477H325.131" stroke="currentColor" strokeWidth="1.75" />
        </svg>
    );
}
