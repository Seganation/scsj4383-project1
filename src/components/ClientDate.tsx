"use client";

export function ClientDate({ date }: { date: string }) {
  return <>{new Intl.DateTimeFormat('en-US').format(new Date(date))}</>;
} 