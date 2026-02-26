const GestioLogo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <img
    src="/logo.png"
    alt="Gestio logo"
    className={className}
    style={{ objectFit: "contain" }}
  />
);

export default GestioLogo;

