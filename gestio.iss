; ============================================================
; Gestio V4 — Script Inno Setup
; Génère un installeur Windows professionnel depuis dist/GestioV4/
;
; Prérequis :
;   - PyInstaller en mode onedir → dist/GestioV4/
;   - resources/icons/gestio.ico
;   - Inno Setup 6.x (https://jrsoftware.org/isinfo.php)
;
; Build : iscc gestio.iss
; Résultat : dist/installer/Gestio-Setup-v4.0.exe
; ============================================================

#define AppName      "Gestio"
#define AppVersion   "4.0"
#define AppPublisher "Djabi"
#define AppURL       "https://github.com/djabi/gestio"
#define AppExeName   "GestioV4.exe"
#define AppDataDir   "{userdocs}\Gestio"

; ── Métadonnées ───────────────────────────────────────────────────────────────
[Setup]
AppId={{A1B2C3D4-E5F6-7890-ABCD-EF1234567890}
AppName={#AppName}
AppVersion={#AppVersion}
AppVerName={#AppName} v{#AppVersion}
AppPublisher={#AppPublisher}
AppPublisherURL={#AppURL}
AppSupportURL={#AppURL}/issues
AppUpdatesURL={#AppURL}/releases

; Dossier d'installation
DefaultDirName={autopf}\{#AppName}
DefaultGroupName={#AppName}
DisableDirPage=no
DisableProgramGroupPage=yes

; Droits administrateur (requis pour écrire dans Program Files)
PrivilegesRequired=admin
PrivilegesRequiredOverridesAllowed=commandline

; Sortie
OutputDir=dist\installer
OutputBaseFilename=Gestio-Setup-v{#AppVersion}
SetupIconFile=resources\icons\gestio.ico
UninstallDisplayIcon={app}\{#AppExeName}

; Compression
Compression=lzma2/ultra64
SolidCompression=yes
LZMANumBlockThreads=4

; UI
WizardStyle=modern
WizardSmallImageFile=resources\icons\gestio.ico
ShowLanguageDialog=no
LanguageDetectionMethod=locale

; Windows minimum : Windows 10
MinVersion=10.0

; Métadonnées installeur
VersionInfoVersion={#AppVersion}.0.0
VersionInfoCompany={#AppPublisher}
VersionInfoDescription={#AppName} - Gestion Financière Personnelle
VersionInfoCopyright=Copyright (C) 2025 {#AppPublisher}

; ── Signature numérique (Azure Key Vault via AzureSignTool) ──────────────────
; AzureSignTool est appelé automatiquement par GitHub Actions après le build.
; Pour signer manuellement en local :
;   AzureSignTool sign -kvu $AZURE_VAULT_URI -kvi $AZURE_CLIENT_ID \
;     -kvt $AZURE_TENANT_ID -kvs $AZURE_CLIENT_SECRET \
;     -kvc gestio-codesign -tr http://timestamp.digicert.com \
;     -td sha256 -fd sha256 "dist\installer\Gestio-Setup-v4.0.exe"
;
; SignTool (optionnel, si certificat local .pfx disponible) :
; SignTool=AzureSign
; SignedUninstaller=yes

; ── Langue ────────────────────────────────────────────────────────────────────
[Languages]
Name: "french";  MessagesFile: "compiler:Languages\French.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

; ── Fichiers à installer ──────────────────────────────────────────────────────
[Files]
; Contenu complet du build PyInstaller onedir
Source: "dist\GestioV4\*"; \
    DestDir: "{app}"; \
    Flags: ignoreversion recursesubdirs createallsubdirs; \
    Excludes: "*.pyc,__pycache__"

; Icône séparée pour l'affichage dans Ajout/Suppression de programmes
Source: "resources\icons\gestio.ico"; \
    DestDir: "{app}\resources\icons"; \
    Flags: ignoreversion

; ── Raccourcis ────────────────────────────────────────────────────────────────
[Icons]
; Menu Démarrer
Name: "{group}\{#AppName}"; \
    Filename: "{app}\{#AppExeName}"; \
    IconFilename: "{app}\resources\icons\gestio.ico"; \
    Comment: "Gestio — Gestion Financière Personnelle"

; Bureau (optionnel, demandé pendant l'install)
Name: "{autodesktop}\{#AppName}"; \
    Filename: "{app}\{#AppExeName}"; \
    IconFilename: "{app}\resources\icons\gestio.ico"; \
    Tasks: desktopicon

; Lancement rapide
Name: "{userstartup}\{#AppName}"; \
    Filename: "{app}\{#AppExeName}"; \
    Tasks: startupicon

; ── Tâches optionnelles (cases à cocher pendant l'install) ───────────────────
[Tasks]
Name: "desktopicon"; \
    Description: "Créer un raccourci sur le &Bureau"; \
    GroupDescription: "Raccourcis :"; \
    Flags: unchecked

Name: "startupicon"; \
    Description: "Lancer {#AppName} au &démarrage de Windows"; \
    GroupDescription: "Raccourcis :"; \
    Flags: unchecked

; ── Dossiers de données utilisateur ──────────────────────────────────────────
[Dirs]
; Créer le dossier de données utilisateur (~/analyse)
Name: "{userdocs}\Gestio\analyse"
Name: "{userdocs}\Gestio\analyse\tickets_a_scanner"
Name: "{userdocs}\Gestio\analyse\tickets_tries"
Name: "{userdocs}\Gestio\analyse\revenus_a_traiter"
Name: "{userdocs}\Gestio\analyse\revenus_traites"
Name: "{userdocs}\Gestio\analyse\logs"
Name: "{userdocs}\Gestio\analyse\exports"

; ── Registre Windows ──────────────────────────────────────────────────────────
[Registry]
; Ajouter à "Programmes installés" (Ajout/Suppression)
Root: HKLM; \
    Subkey: "SOFTWARE\{#AppPublisher}\{#AppName}"; \
    ValueType: string; ValueName: "InstallPath"; \
    ValueData: "{app}"; \
    Flags: uninsdeletekey

Root: HKLM; \
    Subkey: "SOFTWARE\{#AppPublisher}\{#AppName}"; \
    ValueType: string; ValueName: "Version"; \
    ValueData: "{#AppVersion}"

; ── Désinstallation ───────────────────────────────────────────────────────────
[UninstallDelete]
; Supprimer les fichiers temporaires créés par l'app
Type: filesandordirs; Name: "{app}\_internal\__pycache__"

; ── Messages personnalisés ────────────────────────────────────────────────────
[Messages]
; Écran de bienvenue
WelcomeLabel1=Bienvenue dans l'assistant d'installation de [name]
WelcomeLabel2=Gestio est votre application de gestion financière personnelle.%n%nVos données restent 100%% sur votre machine.%n%nCliquez sur Suivant pour continuer.

; ── Code Pascal — logique d'installation ─────────────────────────────────────
[Code]
// Vérifier si une version précédente est installée et proposer de la désinstaller
function InitializeSetup(): Boolean;
var
  UninstPath: string;
  UninstExe:  string;
  ResultCode: Integer;
begin
  Result := True;

  if RegQueryStringValue(
    HKLM,
    'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\{A1B2C3D4-E5F6-7890-ABCD-EF1234567890}_is1',
    'UninstallString',
    UninstPath
  ) then
  begin
    if MsgBox(
      'Une version précédente de Gestio est installée.' + #13#10 +
      'Voulez-vous la désinstaller avant de continuer ?',
      mbConfirmation, MB_YESNO
    ) = IDYES then
    begin
      UninstExe := RemoveQuotes(UninstPath);
      Exec(UninstExe, '/SILENT /NORESTART', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
    end;
  end;
end;

// Ouvrir Gestio après installation si l'utilisateur le souhaite
procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssDone then
  begin
    if MsgBox(
      'Installation terminée !' + #13#10#13#10 +
      'Voulez-vous lancer Gestio maintenant ?',
      mbInformation, MB_YESNO
    ) = IDYES then
    begin
      Exec(ExpandConstant('{app}\{#AppExeName}'), '', '', SW_SHOW, ewNoWait, ResultCode);
    end;
  end;
end;

