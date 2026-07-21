export default function EyeIcon({ open }) {
  return open ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
      <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
      <path d="M3 3l18 18M10.6 10.6a3 3 0 004.24 4.24M9.36 5.16A10.9 10.9 0 0112 5c7 0 10.5 7 10.5 7a13.2 13.2 0 01-3.17 4.13M6.5 6.68C3.6 8.42 1.5 12 1.5 12a13 13 0 003.32 4.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
