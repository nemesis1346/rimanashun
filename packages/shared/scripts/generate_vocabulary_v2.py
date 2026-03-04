"""
generate_vocabulary_v2.py

Reads vocabulary.json, assigns a categoryId to each word based on the
SPANISH translation using whole-word matching. categories.json is left untouched.

Run from repo root:
    python3 packages/shared/scripts/generate_vocabulary_v2.py
"""

import json
import re
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"

# ---------------------------------------------------------------------------
# Spanish rules per category — matched against the Spanish translation only.
# Order matters: first match wins. Put more specific categories first.
# All terms use whole-word regex matching (no partial hits).
# ---------------------------------------------------------------------------
SPANISH_RULES = {
    "greetings": [
        "buenos dias", "buenas tardes", "buenas noches", "hasta luego",
        "gracias", "bienvenido", "saludo", "adios", "disculpa", "permiso",
    ],
    "numbers": [
        "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho",
        "nueve", "diez", "cien", "mil", "millon", "numero",
    ],
    "colors": [
        "rojo", "azul", "verde", "amarillo", "blanco", "negro", "naranja",
        "morado", "rosado", "color", "colorido", "colorear", "plomo",
        "varios colores", "parecido al negro",
    ],
    "family": [
        "madrina", "padrino", "abuela", "abuelo", "madre", "padre",
        "hermana", "hermano", "esposa", "esposo", "familia", "pariente",
        "nieto", "nieta", "yerno", "nuera", "suegro", "suegra",
        "cunado", "cuñado", "hijo menor", "biologico",
        "joven mujer", "joven hombre",
        "casarse", "casado", "soltera", "enamorada", "enamorado",
    ],
    "body": [
        "cabeza", "cara", "ojo", "nariz", "boca", "oreja", "mano",
        "pie", "patas", "brazo", "pierna", "corazon", "corazón",
        "pelo", "diente", "lengua", "dedo", "rodilla", "espalda",
        "garganta", "cuello", "pecho", "hueso", "flaco",
    ],
    "food": [
        "almuerzo", "desayuno", "cena", "comida",
        "carne", "pescado", "pan", "sal", "leche", "huevo", "sopa",
        "chicha", "mote", "colada", "tostado", "tostar", "hervir",
        "crudo", "madurar", "fermentar", "chochos", "cebolla", "culantro",
        "jugo", "cerveza", "aceite", "manteca", "cocinar", "cocinero",
        "cocinera",
    ],
    "animals": [
        "perro", "gato", "vaca", "oveja", "gallina", "pajaro", "pájaro",
        "pato", "chancho", "cerdo salvaje", "raton", "ratón",
        "cuy", "cobayo", "conejo", "tortola", "tórtola", "piojo", "burro",
        "toro", "dueño de perro",
    ],
    "nature": [
        "tierra", "terreno", "rio", "río", "lago", "laguna", "montaña",
        "viento", "nieve", "lluvia", "nube", "niebla", "cielo",
        "flor", "hierba", "planta", "matorral", "vertiente", "loma",
        "sendero", "pedregoso", "lodo", "paja", "sembrar", "siembra",
        "cosecha", "cosechar", "maiz", "maíz", "deshierbar", "abonar",
        "surco", "sementeria", "sementería", "piedra", "raiz", "raíz",
        "frio", "frío",
    ],
    "house": [
        "casa", "baño", "bano", "dormitorio", "sala", "cuarto",
        "habitacion", "habitación", "escalera", "patio", "edificio",
        "construir", "mochila", "collar", "falda", "faja", "vestimenta",
        "vestir", "blusa", "pantalon", "pantalón", "calzado", "alpargate",
        "arete", "tela", "poncho", "tejer", "tejedora", "telar", "hilar",
        "libro", "escuela", "colegio", "capilla", "iglesia",
        "centro de salud", "comunal", "sector", "oficina",
    ],
    "actions": [
        "llevar", "traer", "cargar", "halar", "botar", "arrojar",
        "lavar", "limpiar", "regar", "barrer",
        "trabajar", "aprender", "ensenar", "enseñar", "empezar", "comenzar",
        "terminar", "llegar", "salir", "entrar", "subir", "bajar", "andar",
        "sentarse", "levantarse", "acostarse", "descansar", "dormir",
        "bailar", "jugar", "reirse", "reírse", "llorar",
        "esperar", "escuchar", "hablar", "conversar", "avisar",
        "encontrar", "perder", "perderse", "quedar", "quedarse",
        "dejar", "recibir", "mandar", "guardar", "repartir",
        "compartir", "regalar", "comprar", "curar", "lastimar",
        "enfermar", "crecer", "secar", "envolver", "abrazar",
        "molestar", "ayudar", "poder", "creer", "intentar",
        "mentir", "callar", "mirar", "aparecer", "transformar",
        "rascar", "oler", "sacar", "cortar", "coser",
        "correr", "caminar", "volar", "pescar", "tejer", "hilar",
        "sembrar", "cosechar", "mejorar", "pagar", "valer", "costar",
        "abrir", "cerrar", "poner", "quitar", "quitarse",
        "preguntar", "decir", "llamar", "aceptar",
        "hacer reir", "hacer vestir", "hacer llegar", "hacer cargar",
        "hacer bañar", "hacer parar", "hacer enojar", "hacer apagar",
    ],
}


def normalize(text: str) -> str:
    text = text.lower().strip()
    replacements = {"á": "a", "é": "e", "í": "i", "ó": "o", "ú": "u",
                    "ñ": "n", "ü": "u"}
    for src, dst in replacements.items():
        text = text.replace(src, dst)
    return text


def word_match(keyword: str, text: str) -> bool:
    """Whole-word match of keyword in text using regex boundaries."""
    pattern = r'(?<![a-záéíóúüñ])' + re.escape(normalize(keyword)) + r'(?![a-záéíóúüñ])'
    return bool(re.search(pattern, normalize(text)))


def assign_category(word: dict) -> str:
    spanish = word.get("spanish", "")

    for cat_id, keywords in SPANISH_RULES.items():
        for kw in keywords:
            if word_match(kw, spanish):
                return cat_id

    return "general"


def main():
    vocab_path = DATA_DIR / "vocabulary.json"
    out_path = DATA_DIR / "vocabulary_v2.json"
    cats_path = DATA_DIR / "categories.json"

    with open(vocab_path, encoding="utf-8") as f:
        words = json.load(f)

    with open(cats_path, encoding="utf-8") as f:
        categories = json.load(f)

    cat_lookup = {c["id"]: c["name"] for c in categories}
    cat_lookup["general"] = "General"

    stats = {}
    result = []

    for word in words:
        cat_id = assign_category(word)
        stats[cat_id] = stats.get(cat_id, 0) + 1
        result.append({
            "kichwa": word.get("kichwa", ""),
            "spanish": word.get("spanish", ""),
            "categoryId": cat_id,
        })

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"Written {len(result)} words to {out_path}\n")
    print("Category distribution:")
    for cat_id, count in sorted(stats.items(), key=lambda x: -x[1]):
        name = cat_lookup.get(cat_id, cat_id)
        bar = "█" * (count // 5)
        print(f"  {cat_id:<12} ({name}): {count:>3}  {bar}")


if __name__ == "__main__":
    main()
