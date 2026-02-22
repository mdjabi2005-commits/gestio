#!/usr/bin/env python3
"""
Gestio — Générateur d'icônes
Génère gestio.png, gestio.ico et gestio.icns depuis zéro.
Requires : pillow (déjà dans uv.lock)

Usage :
    uv run python resources/icons/generate_icons.py
"""


import io
import struct
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).parent

# Pillow 10+ : LANCZOS est dans Image.Resampling
LANCZOS = Image.Resampling.LANCZOS if hasattr(Image, "Resampling") else Image.LANCZOS  # type: ignore[attr-defined]


# ── 1. Générer gestio.png (512x512) ───────────────────────────────────────────

def generate_png(size: int = 512) -> Image.Image:
    """Génère le logo Gestio : fond sombre + € stylisé."""
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Fond circulaire — couleur primaire du thème (#3b82f6 bleu)
    margin = size // 16
    draw.ellipse(
        [margin, margin, size - margin, size - margin],
        fill=(30, 30, 50, 255),       # Fond sombre
        outline=(59, 130, 246, 255),  # Bordure bleue (--primary)
        width=size // 32,
    )

    # Cercle intérieur accent vert (#10b981)
    inner = size // 5
    draw.ellipse(
        [inner, inner, size - inner, size - inner],
        fill=(16, 185, 129, 30),      # Vert très transparent
    )

    # Symbole € centré
    symbol = "€"
    font_size = size // 2

    # Tenter d'utiliser une police système, sinon fallback PIL default
    font = None
    font_candidates = [
        "arialbd.ttf", "Arial Bold.ttf",      # Windows / macOS
        "DejaVuSans-Bold.ttf",                 # Linux
        "NotoSans-Bold.ttf",
    ]
    for candidate in font_candidates:
        try:
            font = ImageFont.truetype(candidate, font_size)
            break
        except (IOError, OSError):
            continue

    if font is None:
        # Fallback : police bitmap PIL (moins belle mais fonctionnelle)
        font = ImageFont.load_default(size=font_size)

    # Centrer le symbole
    bbox = draw.textbbox((0, 0), symbol, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    x = (size - text_w) // 2 - bbox[0]
    y = (size - text_h) // 2 - bbox[1] - size // 20  # légèrement vers le haut

    # Ombre portée
    draw.text((x + size // 60, y + size // 60), symbol, font=font,
              fill=(0, 0, 0, 180))
    # Texte principal blanc
    draw.text((x, y), symbol, font=font, fill=(255, 255, 255, 255))

    return img


# ── 2. Sauvegarder gestio.png ─────────────────────────────────────────────────

def save_png(img: Image.Image) -> Path:
    path = OUT / "gestio.png"
    img.save(path, "PNG", optimize=True)
    print(f"✅ gestio.png  ({img.size[0]}x{img.size[1]})")
    return path


# ── 3. Générer gestio.ico (multi-résolution) ──────────────────────────────────

def save_ico(img: Image.Image) -> Path:
    """Génère un .ico avec 6 résolutions embarquées."""
    path = OUT / "gestio.ico"
    sizes = [16, 32, 48, 64, 128, 256]
    icons = [img.resize((s, s), LANCZOS) for s in sizes]
    icons[0].save(
        path,
        format="ICO",
        sizes=[(s, s) for s in sizes],
        append_images=icons[1:],
    )
    print(f"✅ gestio.ico  (résolutions : {', '.join(str(s) for s in sizes)})")
    return path


# ── 4. Générer gestio.icns (macOS) ────────────────────────────────────────────

def save_icns(img: Image.Image) -> Path:
    """
    Génère un .icns basique compatible macOS.
    Format : ICNS avec les tailles standard Apple.
    """
    path = OUT / "gestio.icns"

    apple_types = [
        (b'ic07', 128),
        (b'ic08', 256),
        (b'ic09', 512),
        (b'ic10', 1024),
        (b'ic11', 32),
        (b'ic12', 64),
        (b'ic13', 16),
    ]

    chunks = []
    for ostype, size in apple_types:
        resized = img.resize((size, size), LANCZOS)
        buf = io.BytesIO()
        resized.save(buf, format="PNG")
        png_data = buf.getvalue()
        chunk_len = 8 + len(png_data)
        chunks.append(struct.pack(">4sI", ostype, chunk_len) + png_data)

    body = b"".join(chunks)
    total_len = 8 + len(body)
    with open(path, "wb") as f:
        f.write(b"icns" + struct.pack(">I", total_len) + body)

    print(f"✅ gestio.icns (résolutions : {', '.join(str(s[1]) for s in apple_types)})")
    return path


# ── Main ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("\n💰 Gestio — Génération des icônes\n")

    img = generate_png(512)
    save_png(img)
    save_ico(img)
    save_icns(img)

    print(f"\n📁 Icônes générées dans : {OUT.resolve()}")
    print("   → gestio.png  (Linux / AppImage)")
    print("   → gestio.ico  (Windows / Inno Setup)")
    print("   → gestio.icns (macOS / .app bundle)")
    print("\n✨ Tu peux remplacer gestio.png par ton propre logo et relancer ce script.")

