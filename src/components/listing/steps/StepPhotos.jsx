import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILES = 12;

export default function StepPhotos({
  initial,
  onChange,
  onNext,
  onBack,
}) {
  const { t } = useTranslation("publish");

  const [photos, setPhotos] = useState(() => {
    if (Array.isArray(initial?.photos)) return initial.photos;
    return [];
  });

  useEffect(() => {
    if (Array.isArray(initial?.photos)) {
      setPhotos(initial.photos);
    }
  }, [initial]);

  const previewItems = useMemo(() => {
    return photos.map((item, index) => {
      if (item?.preview) return { ...item, _idx: index };

      if (typeof item === "string") {
        return {
          file: null,
          name: `photo-${index + 1}`,
          preview: item,
          _idx: index,
        };
      }

      return { ...item, _idx: index };
    });
  }, [photos]);

  const updatePhotos = (nextPhotos) => {
    setPhotos(nextPhotos);
    onChange?.({ photos: nextPhotos });
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const valid = files
      .filter((file) => ACCEPTED_TYPES.includes(file.type))
      .slice(0, MAX_FILES);

    const mapped = valid.map((file) => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: URL.createObjectURL(file),
    }));

    const next = [...photos, ...mapped].slice(0, MAX_FILES);
    updatePhotos(next);

    e.target.value = "";
  };

  const removePhoto = (index) => {
    const target = photos[index];
    if (target?.preview?.startsWith?.("blob:")) {
      URL.revokeObjectURL(target.preview);
    }

    const next = photos.filter((_, i) => i !== index);
    updatePhotos(next);
  };

  const moveToFirst = (index) => {
    if (index === 0) return;
    const next = [...photos];
    const [selected] = next.splice(index, 1);
    next.unshift(selected);
    updatePhotos(next);
  };

  const canNext = photos.length > 0;

  useEffect(() => {
    return () => {
      photos.forEach((item) => {
        if (item?.preview?.startsWith?.("blob:")) {
          URL.revokeObjectURL(item.preview);
        }
      });
    };
  }, []); // nur unmount cleanup

  const sectionCard =
    "rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950";

  const buttonBase =
    "inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition";

  return (
    <div className="space-y-6">
      <div className={sectionCard}>
        <div className="mb-5">
          <div className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
            {t("stepPhotos.stepLabel", { defaultValue: "Schritt 3" })}
          </div>

          <h2 className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
            {t("stepPhotos.titleMain", {
              defaultValue: "Fotos der Immobilie",
            })}
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-slate-300">
            {t("stepPhotos.descriptionMain", {
              defaultValue:
                "Laden Sie hochwertige Bilder hoch. Das erste Bild wird als Titelbild verwendet und ist für Interessent:innen am wichtigsten.",
            })}
          </p>
        </div>

        <div className="rounded-3xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center dark:border-slate-700 dark:bg-slate-900">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-3">
            <div className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              {t("stepPhotos.uploadButton", {
                defaultValue: "Fotos auswählen",
              })}
            </div>

            <div className="text-sm text-gray-600 dark:text-slate-300">
              {t("stepPhotos.uploadHint", {
                defaultValue: "JPG, PNG oder WEBP – bis zu 12 Bilder",
              })}
            </div>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleFiles}
              className="hidden"
            />
          </label>
        </div>

        <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm text-blue-900 dark:border-blue-900/40 dark:bg-blue-900/10 dark:text-blue-200">
          {t("stepPhotos.coverHint", {
            defaultValue:
              "Hinweis: Das erste Bild wird als Titelbild Ihrer Anzeige verwendet.",
          })}
        </div>

        {previewItems.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {previewItems.map((item, index) => (
              <div
                key={`${item.name || "photo"}-${index}`}
                className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="relative">
                  <img
                    src={item.preview}
                    alt={item.name || `photo-${index + 1}`}
                    className="h-52 w-full object-cover"
                    loading="lazy"
                  />

                  {index === 0 && (
                    <div className="absolute left-3 top-3 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow">
                      {t("stepPhotos.coverBadge", {
                        defaultValue: "Titelbild",
                      })}
                    </div>
                  )}
                </div>

                <div className="space-y-3 p-4">
                  <div>
                    <div className="line-clamp-1 text-sm font-semibold text-gray-900 dark:text-white">
                      {item.name ||
                        t("stepPhotos.imageLabel", { defaultValue: "Bild" })}
                    </div>
                    {item.size ? (
                      <div className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                        {(item.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {index !== 0 && (
                      <button
                        type="button"
                        onClick={() => moveToFirst(index)}
                        className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-800 transition hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
                      >
                        {t("stepPhotos.setAsCover", {
                          defaultValue: "Als Titelbild setzen",
                        })}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/30"
                    >
                      {t("stepPhotos.remove", {
                        defaultValue: "Entfernen",
                      })}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-950">
            <p className="text-sm font-medium text-gray-700 dark:text-slate-300">
              {t("stepPhotos.emptyTitle", {
                defaultValue: "Noch keine Fotos ausgewählt",
              })}
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
              {t("stepPhotos.emptyText", {
                defaultValue:
                  "Fügen Sie mindestens ein Bild hinzu, um mit dem nächsten Schritt fortzufahren.",
              })}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className={`${buttonBase} border border-gray-300 bg-white text-gray-800 hover:bg-gray-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800`}
        >
          {t("stepPhotos.back", { defaultValue: "Zurück" })}
        </button>

        <button
          type="button"
          disabled={!canNext}
          onClick={onNext}
          className={`${buttonBase} ${
            canNext
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
              : "cursor-not-allowed bg-gray-200 text-gray-500 dark:bg-slate-800 dark:text-slate-500"
          }`}
        >
          {t("stepPhotos.next", { defaultValue: "Weiter" })}
        </button>
      </div>
    </div>
  );
}