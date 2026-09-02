type LighthouseMarkProps = {
  className?: string;
};

export function LighthouseMark({ className }: LighthouseMarkProps) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 48 48">
      <path d="M6 20.5 18 16v4L6 25v-4.5ZM42 20.5 30 16v4l12 5v-4.5Z" fill="currentColor" opacity=".45" />
      <path d="M20 15h8l-1.2 5h-5.6L20 15Z" fill="currentColor" />
      <path d="M21 20h6l2.5 19h-11L21 20Z" fill="currentColor" />
      <path d="M17 39h14" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" />
      <path d="M19 14.5h10" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" />
      <path d="M22 10.5h4v4h-4v-4Z" fill="currentColor" />
      <path d="M20.5 10.5h7" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <path d="M24 6v4" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
      <circle cx="24" cy="17" r="1.5" fill="#171717" />
    </svg>
  );
}
