import os
import sys

tag = sys.argv[1]
windows_url = f"https://github.com/mdjabi2005-commits/gestio/releases/download/{tag}/Gestio-Setup-{tag}.exe"
script_url = f"https://github.com/mdjabi2005-commits/gestio/releases/download/{tag}/install-mac-linux.sh"
raw_script_url = f"https://raw.githubusercontent.com/mdjabi2005-commits/gestio/{tag}/install-mac-linux.sh"

content = f'''import {{ Download, Terminal }} from "lucide-react";
import Reveal from "./Reveal";

const DownloadSection = () => (
  <section className="py-[60px] bg-gradient-download" id="telecharger">
    <div className="container">
      <Reveal>
        <div className="text-center max-w-[700px] mx-auto mb-12">
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

      <Reveal>
        <div className="bg-card border border-border rounded-2xl p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-[64px] h-[64px] bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-10 h-10 fill-primary">
                <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
              </svg>
            </div>
            <div className="flex-grow text-center md:text-left">
              <h3 className="text-foreground text-xl font-semibold mb-1">Windows</h3>
              <p className="text-muted-foreground text-sm">Windows 10/11 (64-bit) — Installeur</p>
            </div>
            <a
              href="{windows_url}"
              className="inline-flex items-center justify-center gap-2 bg-gradient-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold shadow-primary hover:-translate-y-1 hover:shadow-primary-hover transition-all no-underline flex-shrink-0"
            >
              <Download className="w-4 h-4" />
              Télécharger pour Windows
            </a>
          </div>
        </div>
      </Reveal>

      <Reveal delay={{100}}>
        <div className="bg-card border border-border rounded-2xl p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex gap-3 flex-shrink-0">
              <div className="w-[64px] h-[64px] bg-primary/10 rounded-2xl flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-10 h-10 fill-primary">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
              </div>
              <div className="w-[64px] h-[64px] bg-primary/10 rounded-2xl flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-10 h-10 fill-primary">
                  <path d="M12.504 0c-.155 0-.311.002-.465.006-.787.024-1.585.137-2.353.396-.763.258-1.48.645-2.119 1.136a6.31 6.31 0 00-1.612 1.768c-.43.722-.747 1.518-.925 2.35-.178.832-.236 1.692-.155 2.54.081.849.295 1.68.634 2.458.339.78.8 1.498 1.366 2.126.566.629 1.234 1.166 1.98 1.58.745.412 1.562.701 2.404.843.422.07.85.11 1.279.11.154 0 .309-.003.463-.008.787-.024 1.585-.137 2.353-.396.763-.258 1.48-.645 2.119-1.136a6.31 6.31 0 001.612-1.768c.43-.722.747-1.518.925-2.35.178-.832.236-1.692.155-2.54a7.07 7.07 0 00-.634-2.458 6.657 6.657 0 00-1.366-2.126 6.454 6.454 0 00-1.98-1.58A6.847 6.847 0 0012.97.117 7.75 7.75 0 0012.504 0z" />
                </svg>
              </div>
            </div>
            <div className="flex-grow text-center md:text-left">
              <h3 className="text-foreground text-xl font-semibold mb-1">macOS & Linux</h3>
              <p className="text-muted-foreground text-sm">Installation via script — Fonctionne sur macOS et Linux</p>
            </div>
            <div className="flex-shrink-0">
              <a
                href="{script_url}"
                className="inline-flex items-center justify-center gap-2 bg-card border border-border text-foreground px-6 py-3 rounded-xl font-semibold hover:bg-muted hover:border-primary transition-all no-underline"
              >
                <Terminal className="w-4 h-4" />
                Script d'installation
              </a>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={{200}}>
        <div className="bg-card/50 border border-border rounded-xl p-6">
          <h4 className="text-foreground font-semibold mb-3 flex items-center gap-2">
            <Terminal className="w-5 h-5 text-primary" />
            Comment installer sur macOS / Linux
          </h4>
          <div className="bg-background rounded-lg p-4 font-mono text-sm">
            <p className="text-muted-foreground mb-2">1. Ouvrez un terminal</p>
            <p className="text-muted-foreground mb-2">2. Téléchargez et lancez le script :</p>
            <code className="text-primary block bg-primary/10 px-3 py-2 rounded mt-2">
              curl -sSL {raw_script_url} | bash
            </code>
            <p className="text-muted-foreground mt-3">
              Le script installe automatiquement <strong className="text-foreground">uv</strong> et Gestio.
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={{300}}>
        <div className="bg-card border border-border rounded-2xl p-8 mt-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-[64px] h-[64px] bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-10 h-10 fill-primary">
                <path d="M12 2C8.13 2 5 5.13 5 9v6c0 3.87 3.13 7 7 7s7-3.13 7-7V9c0-3.87-3.13-7-7-7zm0 2c2.76 0 5 2.24 5 5v6c0 2.76-2.24 5-5 5s-5-2.24-5-5V9c0-2.76 2.24-5 5-5zm0 2c-1.66 0-3 1.34-3 3v1c0 .55.45 1 1 1h4c.55 0 1-.45 1-1V9c0-1.66-1.34-3-3-3z"/>
              </svg>
            </div>
            <div className="flex-grow text-center md:text-left">
              <h3 className="text-foreground text-xl font-semibold mb-1">Application Mobile</h3>
              <p className="text-muted-foreground text-sm">Progressive Web App (PWA) — Fonctionne sur Android & iOS</p>
            </div>
            <a
              href="#mobile"
              className="inline-flex items-center justify-center gap-2 bg-gradient-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold shadow-primary hover:-translate-y-1 hover:shadow-primary-hover transition-all no-underline flex-shrink-0"
            >
              <Download className="w-4 h-4" />
              Découvrir
            </a>
          </div>
        </div>
      </Reveal>

      <Reveal delay={{400}}>
        <div className="text-center mt-8">
          <p className="text-muted-foreground text-sm">
            Version {tag}
          </p>
        </div>
      </Reveal>
    </div>
  </section>
);

export default DownloadSection;
'''

os.makedirs("site-web/code-source/src/components", exist_ok=True)
with open("site-web/code-source/src/components/DownloadSection.tsx", "w") as f:
    f.write(content)

print(f"Updated DownloadSection.tsx with version {tag}")
print(f"Windows URL: {windows_url}")
print(f"Script URL: {script_url}")
