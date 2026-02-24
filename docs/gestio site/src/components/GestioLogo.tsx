const GestioLogo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="40" height="40" rx="10" fill="url(#logoGrad)" />
    <path d="M12 28V12h6v16h-6zM22 28V18h6v10h-6z" fill="white" />
    <defs>
      <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40">
        <stop stopColor="#10B981" />
        <stop offset="1" stopColor="#059669" />
      </linearGradient>
    </defs>
  </svg>
);

export default GestioLogo;
