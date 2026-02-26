import { Download, Copy, Check } from "lucide-react";
import { useState } from "react";
import Reveal from "./Reveal";

const platforms = [
  {
    name: "Windows",
    desc: "Windows 10/11 (64-bit)",
    type: "exe",
    icon: (
      <svg viewBox="0 0 24 24" className="w-10 h-10 fill-primary">
        <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
      </svg>
    ),
  },
  {
    name: "macOS",
    desc: "macOS 11+ (Intel & Apple Silicon)",
    type: "script",
    icon: (
      <svg viewBox="0 0 24 24" className="w-10 h-10 fill-primary">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
    ),
  },
  {
    name: "Linux",
    desc: "Ubuntu, Fedora, Debian (64-bit)",
    type: "script",
    icon: (
      <svg viewBox="0 0 24 24" className="w-10 h-10 fill-primary">
        <path d="M12.504 0c-.155 0-.311.002-.465.006-.787.024-1.585.137-2.353.396-.763.258-1.48.645-2.119 1.136a6.31 6.31 0 00-1.612 1.768c-.43.722-.747 1.518-.925 2.35-.178.832-.236 1.692-.155 2.54.081.849.295 1.68.634 2.458.339.78.8 1.498 1.366 2.126.566.629 1.234 1.166 1.98 1.58.745.412 1.562.701 2.404.843.422.07.85.11 1.279.11.154 0 .309-.003.463-.008.787-.024 1.585-.137 2.353-.396.763-.258 1.48-.645 2.119-1.136a6.31 6.31 0 001.612-1.768c.43-.722.747-1.518.925-2.35.178-.832.236-1.692.155-2.54a7.07 7.07 0 00-.634-2.458 6.657 6.657 0 00-1.366-2.126 6.454 6.454 0 00-1.98-1.58A6.847 6.847 0 0012.97.117 7.75 7.75 0 0012.504 0z" />
      </svg>
    ),
  },
];

const INSTALL_SCRIPT = "curl -sSL https://github.com/mdjabi2005-commits/gestio/releases/latest/download/install_mac_linux.sh | bash";

const DownloadSection = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(INSTALL_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-[120px] bg-gradient-download" id="telecharger">
      <div className="container">
        <Reveal>
          <div className="text-center max-w-[700px] mx-auto mb-16">
            <div className="inline-flex items-center gap-2 text-primary text-sm font-semibold uppercase tracking-wider mb-4">
              Télécharger
            </div>
            <h2 className="text-foreground text-[clamp(2rem,4vw,3rem)] font-bold mb-4">
              Disponible sur toutes les plateformes
            </h2>
            <p className="text-muted-foreground text-lg">
              Téléchargez Gestio gratuitement et commencez à reprendre le contrôle de vos finances.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {platforms.map((p, i) => (
            <Reveal key={p.name} delay={i * 100}>
              <div className="bg-card border border-border rounded-2xl p-10 text-center transition-all hover:-translate-y-2 hover:border-primary hover:shadow-[0_24px_48px_rgba(0,0,0,0.3)] h-full flex flex-col">
                <div className="w-[72px] h-[72px] mx-auto mb-6 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                  {p.icon}
                </div>
                <h3 className="text-foreground text-2xl font-semibold mb-2">{p.name}</h3>
                <p className="text-muted-foreground text-sm mb-6 flex-1">{p.desc}</p>

                {p.type === "exe" ? (
                  <a
                    href="https://github.com/mdjabi2005-commits/gestio/releases/download/v4.0.0/Gestio-Setup-v4.0.exe"
                    className="inline-flex items-center justify-center gap-2.5 w-full bg-gradient-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold shadow-primary hover:-translate-y-1 hover:shadow-primary-hover transition-all no-underline shrink-0"
                  >
                    <Download className="w-5 h-5" />
                    Télécharger .exe
                  </a>
                ) : (
                  <div className="w-full shrink-0">
                    <p className="text-xs text-muted-foreground text-left mb-2 font-medium">Copier dans le terminal :</p>
                    <div className="relative">
                      <div className="bg-background border border-border rounded-xl p-4 pr-12 text-left">
                        <code className="text-[0.75rem] text-foreground font-mono break-all leading-relaxed opacity-90">
                          {INSTALL_SCRIPT}
                        </code>
                      </div>
                      <button
                        onClick={handleCopy}
                        className="absolute right-2 top-2 w-8 h-8 flex items-center justify-center rounded-lg bg-muted text-foreground hover:bg-primary hover:text-primary-foreground transition-colors border border-border shrink-0"
                        aria-label="Copier la commande"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DownloadSection;
