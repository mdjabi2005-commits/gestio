#define MyAppName "Gestio"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "Gestio Team"
#define MyAppExeName "launcher.bat"
#define MyAppIcon "favicon.ico"

; ─────────────────────────────────────────────────────────────────────────────
; Structure de l'installation (définie dans backend/config/paths.py)
;
;   {localappdata}\Gestio\           ← DATA_DIR (données utilisateur)
;     ├── finances.db
;     ├── gestio_app.log
;     ├── tickets_tries\
;     ├── revenus_traites\
;     └── objectifs\
;
;   {localappdata}\Gestio\app\       ← code de l'application (INSTALL_FILES)
;     ├── launcher.py
;     ├── pyproject.toml
;     ├── uv.lock
;     ├── backend\
;     └── frontend\out\
; ─────────────────────────────────────────────────────────────────────────────

[Setup]
AppId={{B7A38D4A-98C3-4E82-9694-87A5B6913D5E}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
; L'app est installée dans un sous-dossier "app" — les données utilisateur
; restent dans le parent {localappdata}\Gestio\ (géré par paths.py → DATA_DIR)
DefaultDirName={localappdata}\{#MyAppName}\app
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
PrivilegesRequired=lowest
OutputDir=..\dist\installer
OutputBaseFilename=Gestio-Setup-v{#MyAppVersion}
SetupIconFile={#MyAppIcon}
Compression=lzma
SolidCompression=yes
WizardStyle=modern

[Languages]
Name: "french"; MessagesFile: "compiler:Languages\French.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
; ── Strict minimum d'exécution (voir INSTALL_FILES dans paths.py) ──────────
; Point d'entrée
Source: "..\launcher.py"; DestDir: "{app}"; Flags: ignoreversion
; Wrapper Windows (double-clic → lance uv run python launcher.py)
Source: "..\launcher.bat"; DestDir: "{app}"; Flags: ignoreversion
; Dépendances Python
Source: "..\pyproject.toml"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\uv.lock"; DestDir: "{app}"; Flags: ignoreversion
; Backend FastAPI (sans scripts de dev ni __pycache__)
Source: "..\backend\*"; DestDir: "{app}\backend"; Flags: ignoreversion recursesubdirs createallsubdirs; \
    Excludes: "__pycache__\*,scripts\*,*.pyc,*.pyo"
; Frontend : build statique uniquement (pas src/, pas node_modules/)
Source: "..\frontend\out\*"; DestDir: "{app}\frontend\out"; Flags: ignoreversion recursesubdirs createallsubdirs
; Icône
Source: "{#MyAppIcon}"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\{#MyAppIcon}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; IconFilename: "{app}\{#MyAppIcon}"; Tasks: desktopicon

[Run]
; Lance launcher.bat directement (shellexec ouvre le .bat avec cmd.exe automatiquement)
Filename: "{app}\{#MyAppExeName}"; \
    Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; \
    Flags: shellexec postinstall skipifsilent
