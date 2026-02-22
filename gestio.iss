; Gestio V4 - Script Inno Setup
; Build : iscc gestio.iss
; Resultat : dist\installer\Gestio-Setup-v4.0.exe

#define AppName      "Gestio"
#define AppVersion   "4.0"
#define AppPublisher "Djabi"
#define AppURL       "https://github.com/djabi/gestio"
#define AppExeName   "GestioV4.exe"

[Setup]
AppId={{A1B2C3D4-E5F6-7890-ABCD-EF1234567890}
AppName={#AppName}
AppVersion={#AppVersion}
AppVerName={#AppName} v{#AppVersion}
AppPublisher={#AppPublisher}
AppPublisherURL={#AppURL}
AppSupportURL={#AppURL}/issues
AppUpdatesURL={#AppURL}/releases
DefaultDirName={autopf}\{#AppName}
DefaultGroupName={#AppName}
DisableDirPage=no
DisableProgramGroupPage=yes
PrivilegesRequired=admin
PrivilegesRequiredOverridesAllowed=commandline
OutputDir=dist\installer
OutputBaseFilename=Gestio-Setup-v{#AppVersion}
SetupIconFile=resources\icons\gestio.ico
UninstallDisplayIcon={app}\{#AppExeName}
Compression=lzma2/ultra64
SolidCompression=yes
LZMANumBlockThreads=4
WizardStyle=modern
WizardSmallImageFile=resources\icons\gestio.ico
ShowLanguageDialog=no
LanguageDetectionMethod=locale
MinVersion=10.0
VersionInfoVersion={#AppVersion}.0.0
VersionInfoCompany={#AppPublisher}
VersionInfoDescription={#AppName} - Gestion Financiere Personnelle
VersionInfoCopyright=Copyright (C) 2025 {#AppPublisher}

[Languages]
Name: "french";  MessagesFile: "compiler:Languages\French.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
Source: "dist\GestioV4\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs; Excludes: "*.pyc,__pycache__"
Source: "resources\icons\gestio.ico"; DestDir: "{app}\resources\icons"; Flags: ignoreversion

[Icons]
Name: "{group}\{#AppName}"; Filename: "{app}\{#AppExeName}"; IconFilename: "{app}\resources\icons\gestio.ico"; Comment: "Gestio - Gestion Financiere Personnelle"
Name: "{autodesktop}\{#AppName}"; Filename: "{app}\{#AppExeName}"; IconFilename: "{app}\resources\icons\gestio.ico"; Tasks: desktopicon
Name: "{userstartup}\{#AppName}"; Filename: "{app}\{#AppExeName}"; Tasks: startupicon

[Tasks]
Name: "desktopicon"; Description: "Creer un raccourci sur le &Bureau"; GroupDescription: "Raccourcis :"; Flags: unchecked
Name: "startupicon"; Description: "Lancer {#AppName} au &demarrage de Windows"; GroupDescription: "Raccourcis :"; Flags: unchecked

[Dirs]
Name: "{userdocs}\Gestio\analyse"
Name: "{userdocs}\Gestio\analyse\tickets_a_scanner"
Name: "{userdocs}\Gestio\analyse\tickets_tries"
Name: "{userdocs}\Gestio\analyse\revenus_a_traiter"
Name: "{userdocs}\Gestio\analyse\revenus_traites"
Name: "{userdocs}\Gestio\analyse\logs"
Name: "{userdocs}\Gestio\analyse\exports"

[Registry]
Root: HKLM; Subkey: "SOFTWARE\{#AppPublisher}\{#AppName}"; ValueType: string; ValueName: "InstallPath"; ValueData: "{app}"; Flags: uninsdeletekey
Root: HKLM; Subkey: "SOFTWARE\{#AppPublisher}\{#AppName}"; ValueType: string; ValueName: "Version"; ValueData: "{#AppVersion}"

[UninstallDelete]
Type: filesandordirs; Name: "{app}\_internal\__pycache__"

[Messages]
WelcomeLabel1=Bienvenue dans l'assistant d'installation de [name]
WelcomeLabel2=Gestio - Gestion Financiere Personnelle.%n%nVos donnees restent 100%% sur votre machine.%n%nCliquez sur Suivant pour continuer.

[Code]
function InitializeSetup(): Boolean;
var
  UninstPath: string;
  UninstExe: string;
  ResultCode: Integer;
begin
  Result := True;
  if RegQueryStringValue(HKLM, 'SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\{A1B2C3D4-E5F6-7890-ABCD-EF1234567890}_is1', 'UninstallString', UninstPath) then
  begin
    if MsgBox('Une version precedente de Gestio est installee.' + #13#10 + 'Voulez-vous la desinstaller avant de continuer ?', mbConfirmation, MB_YESNO) = IDYES then
    begin
      UninstExe := RemoveQuotes(UninstPath);
      Exec(UninstExe, '/SILENT /NORESTART', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);
    end;
  end;
end;

procedure CurStepChanged(CurStep: TSetupStep);
var
  ResultCode: Integer;
begin
  if CurStep = ssDone then
  begin
    if MsgBox('Installation terminee !' + #13#10#13#10 + 'Voulez-vous lancer Gestio maintenant ?', mbInformation, MB_YESNO) = IDYES then
    begin
      Exec(ExpandConstant('{app}\{#AppExeName}'), '', '', SW_SHOW, ewNoWait, ResultCode);
    end;
  end;
end;
