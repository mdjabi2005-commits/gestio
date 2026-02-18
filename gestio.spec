# -*- mode: python ; coding: utf-8 -*-
"""
PyInstaller spec file for Gestio V4
"""
from PyInstaller.utils.hooks import collect_data_files, copy_metadata

block_cipher = None

a = Analysis(
    ['launcher.py'],
    pathex=[],
    binaries=[],
    datas=[
        ('main.py', '.'),
        ('resources', 'resources'),
        ('config', 'config'),
        ('domains', 'domains'),
        ('shared', 'shared'),
    ] + collect_data_files('streamlit') + copy_metadata('streamlit') + copy_metadata('altair') + copy_metadata('pandas'),
    hiddenimports=[
        'streamlit',
        'streamlit.runtime.scriptrunner.magic_funcs',
        'streamlit.web.cli',
        'multiprocessing',
        'pandas',
        'numpy',
        'plotly',
        'matplotlib',
        'sqlite3',
        'tkinter',
        'PIL',
        'cv2',
        'yaml',
        'pdfminer',
        'rapidocr_onnxruntime',
        'dateutil',
        'psutil',
        'pydantic',
        'requests',
        'pyjwt',
        'cryptography',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='GestioV4',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,  # Pas de console
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=None,  # Tu peux ajouter une icône ici
    onefile=True,
)
