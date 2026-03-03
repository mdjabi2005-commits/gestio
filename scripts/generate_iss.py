"""
Gestio - Generateur de gestio.iss (mode uv-native)

Genere le script Inno Setup en ASCII pur garanti.
Installe dans %APPDATA%\\Gestio :
  - app/     : sources Python du projet
  - uv/      : binaire uv.exe standalone
  - GestioLauncher.exe : mini-launcher Tkinter

Au premier lancement, uv sync telecharge Python 3.12 + dependances.
Usage : uv run python scripts/generate_iss.py
"""

import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
OUT = ROOT / "gestio.iss"

CONTENT = (
    "; Gestio V4 - Script Inno Setup (uv-native)\r\n"
    "; Build : iscc gestio.iss\r\n"
    "; Resultat : dist\\installer\\Gestio-Setup-v4.0.0.exe\r\n"
    ";\r\n"
    "; Architecture : sources + uv standalone + mini-launcher Tkinter\r\n"
    "; Plus de PyInstaller -- uv gere Python + toutes les dependances\r\n"
    "\r\n"
    '#define AppName      "Gestio"\r\n'
    '#define AppVersion   "4.0.0"\r\n'
    '#define AppPublisher "Djabi"\r\n'
    '#define AppURL       "https://github.com/mdjabi2005-commits/gestio"\r\n'
    '#define AppExeName   "GestioLauncher.exe"\r\n'
    "\r\n"
    "[Setup]\r\n"
    "AppId={{A1B2C3D4-E5F6-7890-ABCD-EF1234567890}\r\n"
    "AppName={#AppName}\r\n"
    "AppVersion={#AppVersion}\r\n"
    "AppVerName={#AppName} v{#AppVersion}\r\n"
    "AppPublisher={#AppPublisher}\r\n"
    "AppPublisherURL={#AppURL}\r\n"
    "AppSupportURL={#AppURL}/issues\r\n"
    "AppUpdatesURL={#AppURL}/releases\r\n"
    "DefaultDirName={userappdata}\\{#AppName}\r\n"
    "DefaultGroupName={#AppName}\r\n"
    "DisableDirPage=yes\r\n"
    "DisableProgramGroupPage=yes\r\n"
    "PrivilegesRequired=lowest\r\n"
    "OutputDir=dist\\installer\r\n"
    "OutputBaseFilename=Gestio-Setup-v{#AppVersion}\r\n"
    "Compression=lzma\r\n"
    "SolidCompression=yes\r\n"
    "LZMANumBlockThreads=4\r\n"
    "WizardStyle=modern\r\n"
    "ShowLanguageDialog=no\r\n"
    "LanguageDetectionMethod=locale\r\n"
    "MinVersion=10.0\r\n"
    "VersionInfoVersion={#AppVersion}.0.0\r\n"
    "VersionInfoCompany={#AppPublisher}\r\n"
    "VersionInfoDescription={#AppName} - Gestion Financiere Personnelle\r\n"
    "VersionInfoCopyright=Copyright (C) 2026 {#AppPublisher}\r\n"
    "\r\n"
    "[Languages]\r\n"
    'Name: "french";  MessagesFile: "compiler:Languages\\French.isl"\r\n'
    'Name: "english"; MessagesFile: "compiler:Default.isl"\r\n'
    "\r\n"
    "[Files]\r\n"
    "; Mini-launcher Tkinter (compile par PyInstaller, ~5-10 Mo)\r\n"
    'Source: "dist\\GestioLauncher.exe"; DestDir: "{app}"; Flags: ignoreversion\r\n'
    "\r\n"
    "; uv standalone (telecharge en CI)\r\n"
    'Source: "dist\\uv\\uv.exe"; DestDir: "{app}\\uv"; Flags: ignoreversion\r\n'
    "\r\n"
    "; Sources Python du projet\r\n"
    'Source: "dist\\app\\*"; DestDir: "{app}\\app"; Flags: ignoreversion recursesubdirs createallsubdirs; Excludes: "*.pyc,__pycache__,.venv,.git"\r\n'
    "\r\n"
    "[Icons]\r\n"
    'Name: "{group}\\{#AppName}"; Filename: "{app}\\{#AppExeName}"\r\n'
    'Name: "{autodesktop}\\{#AppName}"; Filename: "{app}\\{#AppExeName}"; Tasks: desktopicon\r\n'
    'Name: "{userstartup}\\{#AppName}"; Filename: "{app}\\{#AppExeName}"; Tasks: startupicon\r\n'
    "\r\n"
    "[Tasks]\r\n"
    'Name: "desktopicon"; Description: "Creer un raccourci sur le &Bureau"; GroupDescription: "Raccourcis :"; Flags: checked\r\n'
    'Name: "startupicon"; Description: "Lancer {#AppName} au &demarrage de Windows"; GroupDescription: "Raccourcis :"; Flags: unchecked\r\n'
    "\r\n"
    "[Dirs]\r\n"
    "; Dossiers de donnees utilisateur (dans ~/analyse)\r\n"
    'Name: "{userdocs}\\Gestio\\analyse"\r\n'
    'Name: "{userdocs}\\Gestio\\analyse\\tickets_a_scanner"\r\n'
    'Name: "{userdocs}\\Gestio\\analyse\\tickets_tries"\r\n'
    'Name: "{userdocs}\\Gestio\\analyse\\revenus_a_traiter"\r\n'
    'Name: "{userdocs}\\Gestio\\analyse\\revenus_traites"\r\n'
    'Name: "{userdocs}\\Gestio\\analyse\\logs"\r\n'
    'Name: "{userdocs}\\Gestio\\analyse\\exports"\r\n'
    "\r\n"
    "[Registry]\r\n"
    'Root: HKCU; Subkey: "SOFTWARE\\{#AppPublisher}\\{#AppName}"; ValueType: string; ValueName: "InstallPath"; ValueData: "{app}"; Flags: uninsdeletekey\r\n'
    'Root: HKCU; Subkey: "SOFTWARE\\{#AppPublisher}\\{#AppName}"; ValueType: string; ValueName: "Version"; ValueData: "{#AppVersion}"\r\n'
    "\r\n"
    "[UninstallDelete]\r\n"
    'Type: filesandordirs; Name: "{app}\\app\\.venv"\r\n'
    'Type: filesandordirs; Name: "{app}\\app\\__pycache__"\r\n'
    "\r\n"
    "[Messages]\r\n"
    "WelcomeLabel1=Bienvenue dans l'assistant d'installation de [name]\r\n"
    "WelcomeLabel2=Gestio - Gestion Financiere Personnelle.%n%nVos donnees restent 100%% sur votre machine.%n%nUne connexion internet est requise au premier lancement pour installer les dependances Python.%n%nCliquez sur Suivant pour continuer.\r\n"
    "\r\n"
    "[Code]\r\n"
    "function InitializeSetup(): Boolean;\r\n"
    "var\r\n"
    "  UninstPath: string;\r\n"
    "  UninstExe: string;\r\n"
    "  ResultCode: Integer;\r\n"
    "begin\r\n"
    "  Result := True;\r\n"
    "  if RegQueryStringValue(HKCU, 'SOFTWARE\\Djabi\\Gestio', 'InstallPath', UninstPath) then\r\n"
    "  begin\r\n"
    "    if MsgBox('Une version precedente de Gestio est installee.' + #13#10 + 'Voulez-vous la desinstaller avant de continuer ?', mbConfirmation, MB_YESNO) = IDYES then\r\n"
    "    begin\r\n"
    "      UninstExe := UninstPath + '\\unins000.exe';\r\n"
    "      if FileExists(UninstExe) then\r\n"
    "        Exec(UninstExe, '/SILENT /NORESTART', '', SW_HIDE, ewWaitUntilTerminated, ResultCode);\r\n"
    "    end;\r\n"
    "  end;\r\n"
    "end;\r\n"
    "\r\n"
    "procedure CurStepChanged(CurStep: TSetupStep);\r\n"
    "var\r\n"
    "  ResultCode: Integer;\r\n"
    "begin\r\n"
    "  if CurStep = ssDone then\r\n"
    "  begin\r\n"
    "    if MsgBox('Installation terminee !' + #13#10#13#10 + 'Voulez-vous lancer Gestio maintenant ?' + #13#10 + '(Le premier lancement necessite internet pour installer les dependances)', mbInformation, MB_YESNO) = IDYES then\r\n"
    "    begin\r\n"
    "      Exec(ExpandConstant('{app}\\{#AppExeName}'), '', '', SW_SHOW, ewNoWait, ResultCode);\r\n"
    "    end;\r\n"
    "  end;\r\n"
    "end;\r\n"
)


def main() -> None:
    # Ecriture en mode binaire = aucune conversion d'encodage possible
    OUT.write_bytes(CONTENT.encode("ascii"))

    # Verification stricte
    data = OUT.read_bytes()
    bad = [b for b in data if b > 127]
    if bad:
        print(f"ERREUR : {len(bad)} octets non-ASCII detectes !", file=sys.stderr)
        sys.exit(1)

    print(f"OK - gestio.iss genere ({len(data)} octets, 100% ASCII)")


if __name__ == "__main__":
    main()
