# -*- mode: python ; coding: utf-8 -*-
"""
PyInstaller spec — Mini-Launcher Gestio (Tkinter only)

Compile UNIQUEMENT le launcher.py + Tkinter en un petit EXE (~5-10 Mo).
Streamlit, pandas, onnxruntime, etc. sont geres par uv dans le venv.
"""
import sys

a = Analysis(
    ['launcher.py'],
    pathex=[],
    binaries=[],
    datas=[],
    hiddenimports=[
        'tkinter',
        'tkinter.scrolledtext',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        # Exclure TOUT ce qui n'est pas Tkinter
        'streamlit', 'pandas', 'numpy', 'plotly', 'matplotlib',
        'PIL', 'cv2', 'onnxruntime', 'rapidocr_onnxruntime',
        'pdfminer', 'pydantic', 'requests', 'cryptography',
        'altair', 'psutil', 'ollama', 'groq',
        'pytest', 'unittest', 'doctest', 'IPython', 'jupyter',
    ],
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='GestioLauncher',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=['vcruntime140.dll', 'python*.dll'],
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon='resources/icons/gestio.ico' if sys.platform == 'win32' else None,
)

