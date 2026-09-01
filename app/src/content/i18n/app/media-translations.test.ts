import { describe, expect, it } from "vitest";

import en from "./en";
import es from "./es";
import fr from "./fr";

type TranslationValue = string | number | boolean | null | ((...args: never[]) => unknown) | TranslationTree;
type TranslationTree = { readonly [key: string]: TranslationValue };

function shape(value: TranslationValue): unknown {
  if (typeof value === "function") return "function";
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, shape(child as TranslationValue)]),
    );
  }
  return typeof value;
}

function strings(value: TranslationValue): string[] {
  if (typeof value === "string") return [value];
  if (!value || typeof value !== "object") return [];
  return Object.values(value).flatMap((child) => strings(child as TranslationValue));
}

describe("media translations", () => {
  it("keeps the complete media translation contract aligned in English, French, and Spanish", () => {
    expect(shape(fr.media as TranslationTree)).toEqual(shape(en.media as TranslationTree));
    expect(shape(es.media as TranslationTree)).toEqual(shape(en.media as TranslationTree));
  });

  it("contains no replacement characters or common UTF-8 mojibake in static media copy", () => {
    for (const locale of [en, fr, es]) {
      expect(strings(locale.media as TranslationTree).filter((value) => /[ÃÂ�]/u.test(value))).toEqual([]);
    }
  });

  it("provides localized labels for every plugin-owned library form", () => {
    expect(fr.media.library.uploadMedia).toBe("Téléverser un média");
    expect(es.media.library.views.tree).toBe("Árbol");
    expect(fr.media.library.transfer.importStatuses.linked).toBe("Lié");
    expect(es.media.library.upload.form.categoryPicker.clearAll).toBe("Borrar todo");
    expect(fr.media.library.allCategories).toBe("Toutes les catégories");
    expect(es.media.library.allCategories).toBe("Todas las categorías");
  });
});
