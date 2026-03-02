"""
RapidOCR Engine - Wrapper pour rapidocr_onnxruntime
Remplace EasyOCR pour une exécution plus rapide et légère.
"""

import logging
import sys

try:
    # noinspection PyUnusedImports
    from rapidocr_onnxruntime import RapidOCR

    RAPIDOCR_AVAILABLE = True
except ImportError as _import_err:
    RAPIDOCR_AVAILABLE = False
    _rapidocr_error = str(_import_err)

logger = logging.getLogger(__name__)


class RapidOCREngine:
    """
    Moteur OCR basé sur RapidOCR (ONNX Runtime).
    Rapide, léger, et efficace pour les tickets.
    """

    def __init__(self):
        if not RAPIDOCR_AVAILABLE:
            frozen = getattr(sys, 'frozen', False)
            logger.error(
                f"rapidocr_onnxruntime import échoué (frozen={frozen}): {_rapidocr_error}"
            )
            raise ImportError(
                f"rapidocr_onnxruntime n'est pas disponible. "
                f"Mode frozen={frozen}. Erreur: {_rapidocr_error}"
            )

        # Initialisation du moteur
        try:
            self.engine = RapidOCR()
            logger.info("RapidOCR engine initialisé avec succès")
        except Exception as e:
            logger.error(f"Erreur lors de l'init de RapidOCR: {e}", exc_info=True)
            raise

    def extract_text(self, image_path: str) -> str:
        """
        Extrait le texte d'une image.
        """
        import time
        t0 = time.time()
        logger.info(f"[OCR] extract_text démarré pour : {image_path}")

        try:
            logger.info(f"[OCR] Appel RapidOCR engine... ({time.time()-t0:.2f}s)")
            result, elapse = self.engine(image_path)
            logger.info(f"[OCR] RapidOCR terminé en {time.time()-t0:.2f}s — résultat: {type(result)}, nb lignes: {len(result) if result else 0}")

            if not result:
                logger.warning(f"[OCR] Aucun texte détecté pour {image_path} ({time.time()-t0:.2f}s)")
                return ""

            text_lines = [line[1] for line in result]
            full_text = "\n".join(text_lines)
            total_time = sum(elapse) if isinstance(elapse, list) else float(elapse or 0.0)
            logger.info(f"[OCR] {len(text_lines)} lignes extraites, temps ONNX={total_time:.3f}s, total={time.time()-t0:.2f}s")
            return full_text

        except Exception as e:
            logger.error(f"[OCR] Erreur RapidOCR après {time.time()-t0:.2f}s : {e}")
            raise ValueError(f"Echec extraction OCR: {e}")
