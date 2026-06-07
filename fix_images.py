"""
fix_images.py — Portfolio Alpha Ndiaye
---------------------------------------
Place ce fichier dans le même dossier que ton index.html,
puis lance : python fix_images.py

Le script va :
1. Créer un dossier images/
2. Télécharger toutes les images depuis Google Drive
3. Mettre à jour index.html avec les chemins locaux
4. Supprimer les anciens scripts Drive (qui ralentissaient le site)
"""

import requests
import re
import os
import sys

# ── Images à télécharger ─────────────────────────────────────────────────────
IMAGES = [
    ("14gySoqd3IcfUHH9Bw_fnOHrgfHKLicH6", "photo.jpeg"),
    ("1ocVgYrnqrCMAGlTAkWo6O49rAwpIGghT", "oryx.jpg"),
    ("1f3q10EQocswtaDZYsm53n--fMTFza1A7", "cfts.png"),
    ("1FUDXr_WZErPK5FI1-eO0ICxJpEVt_AXW", "mossane.png"),
    ("11lKPIZ1z_YkL6OqIE8eB0Mh_HSMsCG67", "samachef.png"),
    ("1YE1E1AYaqiTTER3YrBEeTm4Z15lzp8_J", "bitik.png"),
    ("1ZBe7CIe8GX7bABV4NPa-VVyHHn5_ssd4", "dnc.png"),
]

# ── Vérifie que index.html est présent ───────────────────────────────────────
if not os.path.exists("index.html"):
    print("❌ index.html introuvable dans ce dossier.")
    print("   Place ce script dans le même dossier que ton index.html et relance.")
    sys.exit(1)

# ── Crée le dossier images/ ──────────────────────────────────────────────────
os.makedirs("images", exist_ok=True)
print("📁 Dossier images/ prêt\n")

# ── Téléchargement depuis Drive ──────────────────────────────────────────────
def download_drive(file_id, filename):
    path = os.path.join("images", filename)
    url = f"https://drive.google.com/uc?export=download&id={file_id}"
    session = requests.Session()
    response = session.get(url, stream=True)

    # Gère le cookie de confirmation pour les gros fichiers
    token = None
    for key, value in response.cookies.items():
        if key.startswith("download_warning"):
            token = value
            break
    if token:
        response = session.get(url + "&confirm=" + token, stream=True)

    with open(path, "wb") as f:
        for chunk in response.iter_content(32768):
            if chunk:
                f.write(chunk)

    size_kb = os.path.getsize(path) // 1024
    print(f"  ✅ {filename} ({size_kb} Ko)")

print("⬇️  Téléchargement des images depuis Google Drive...")
for drive_id, fname in IMAGES:
    try:
        download_drive(drive_id, fname)
    except Exception as e:
        print(f"  ⚠️  Erreur pour {fname} : {e}")

# ── Mise à jour de index.html ────────────────────────────────────────────────
print("\n📝 Mise à jour de index.html...")

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# Remplacer les URLs Drive par les chemins locaux
REPLACEMENTS = [
    ("14gySoqd3IcfUHH9Bw_fnOHrgfHKLicH6", "images/photo.jpeg"),
    ("1ocVgYrnqrCMAGlTAkWo6O49rAwpIGghT", "images/oryx.jpg"),
    ("1f3q10EQocswtaDZYsm53n--fMTFza1A7", "images/cfts.png"),
    ("1FUDXr_WZErPK5FI1-eO0ICxJpEVt_AXW", "images/mossane.png"),
    ("11lKPIZ1z_YkL6OqIE8eB0Mh_HSMsCG67", "images/samachef.png"),
    ("1YE1E1AYaqiTTER3YrBEeTm4Z15lzp8_J", "images/bitik.png"),
    ("1ZBe7CIe8GX7bABV4NPa-VVyHHn5_ssd4", "images/dnc.png"),
]

for drive_id, local_path in REPLACEMENTS:
    # src="https://drive.google.com/uc?export=view&id=..." (avec & ou &amp;)
    pattern = (
        r'https://drive\.google\.com/uc\?export=view&amp;id=' + re.escape(drive_id)
    )
    content = re.sub(pattern, local_path, content)
    content = content.replace(
        f"https://drive.google.com/uc?export=view&id={drive_id}",
        local_path
    )
    # URLs dans les onclick du panneau admin
    content = content.replace(
        f"https://drive.google.com/uc?export=view&id={drive_id}",
        local_path
    )

# Supprimer les scripts Drive temporaires ajoutés précédemment
scripts_to_remove = [
    # Script thumbnail
    r'<script>\s*document\.addEventListener\(\'DOMContentLoaded\',\s*function\(\)\s*\{[^}]*drive\.google\.com[^<]*\}\);\s*\}\);\s*</script>',
    # Script uc?export=view simple
    r'<script>\s*document\.querySelectorAll\(\'img\'\)[^<]*drive\.google\.com[^<]*\}\);\s*</script>',
]
for pattern in scripts_to_remove:
    content = re.sub(pattern, '', content, flags=re.DOTALL)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(content)

# ── Résumé ───────────────────────────────────────────────────────────────────
print("\n✅ Terminé !\n")
print("═" * 50)
print("PROCHAINES ÉTAPES — GitHub :")
print("═" * 50)
print()
print("1. Sur github.com → ton dépôt zoualphas/alphandiaye")
print("   → Add file → Upload files")
print("   → Glisse TOUS les fichiers du dossier images/")
print("   → Commit changes")
print()
print("2. Ensuite upload le fichier index.html mis à jour")
print("   (remplace l'ancien)")
print()
print("Résultat : ton site affichera toutes les images")
print("depuis GitHub directement — rapide et fiable.")
