import { useCallback, useMemo, useState } from "react";
import type { Element } from "easy-email-pro-core";
import type { ThemeConfigProps } from "easy-email-pro-theme";

type UniversalElementSetting = NonNullable<
  ThemeConfigProps["universalElementSetting"]
>;

// What we persist: each saved element plus its name and thumbnail
type StoredUniversalElement = {
  name: string;
  thumbnail: string; // data URL
  element: Element;
};

const STORAGE_KEY = "easy-email-pro:universal-elements";
const LIST_LABEL = "Saved blocks";

function load(): Record<string, StoredUniversalElement> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function save(store: Record<string, StoredUniversalElement>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

/**
 * Universal (reusable) blocks, stored in localStorage.
 * To move to a backend, replace load()/save() with API calls.
 */
export function useUniversalElements(): UniversalElementSetting {
  const [store, setStore] = useState(load);

  const update = useCallback(
    (
      change: (
        prev: Record<string, StoredUniversalElement>,
      ) => Record<string, StoredUniversalElement>,
    ) =>
      setStore((prev) => {
        const next = change(prev);
        save(next);
        return next;
      }),
    [],
  );

  // Called when a block is saved as universal; must return it with a uid
  const onAddElement: UniversalElementSetting["onAddElement"] = useCallback(
    async ({ name, element, thumbnail }) => {
      const uid = crypto.randomUUID();
      const saved = { ...element, uid } as Element;
      const thumbnailUrl = await blobToDataUrl(thumbnail);
      update((prev) => ({
        ...prev,
        [uid]: { name, thumbnail: thumbnailUrl, element: saved },
      }));
      return saved;
    },
    [update],
  );

  // Called after editing a universal block (paid plans only)
  const onUpdateElement: UniversalElementSetting["onUpdateElement"] =
    useCallback(
      async ({ uid, element, thumbnail }) => {
        const thumbnailUrl = await blobToDataUrl(thumbnail);
        update((prev) => {
          if (!prev[uid]) throw new Error(`Unknown universal block ${uid}`);
          return {
            ...prev,
            [uid]: { ...prev[uid], thumbnail: thumbnailUrl, element },
          };
        });
      },
      [update],
    );

  return useMemo(() => {
    const entries = Object.values(store);
    return {
      // Lets templates that reference a uid render the saved content
      elements: Object.fromEntries(
        entries.map(({ element }) => [element.uid!, element]),
      ),
      // What the Universal tab lists
      list: [
        {
          label: LIST_LABEL,
          elements: entries.map(({ element, thumbnail }) => ({
            element,
            thumbnail,
          })),
        },
      ],
      onAddElement,
      onUpdateElement,
    };
  }, [store, onAddElement, onUpdateElement]);
}
