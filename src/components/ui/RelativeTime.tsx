"use client";

import { formatRelativeDate } from "@/lib/format";

interface RelativeTimeProps {
  dateTime: string;
  className?: string;
}

export default function RelativeTime({
  dateTime,
  className,
}: RelativeTimeProps) {
  return (
    <time dateTime={dateTime} className={className} suppressHydrationWarning>
      {formatRelativeDate(dateTime)}
    </time>
  );
}
