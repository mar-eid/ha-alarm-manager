/**
 * Lazy-loading of Home Assistant's own UI components.
 *
 * HA registers components like ha-form, ha-selector, ha-entity-picker and ha-dialog only
 * when some part of its UI needs them. Inside HA's card-editor dialog they are already
 * there, but a Lovelace card (the Alarm Center) may run before anything loaded them.
 * Asking for the built-in `entities` card's config element pulls in HA's form stack.
 */

let loading: Promise<void> | undefined;

const timeout = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const ensureHaComponents = (): Promise<void> => {
  if (!loading) {
    loading = (async () => {
      if (customElements.get("ha-form") && customElements.get("ha-entity-picker")) return;
      try {
        const helpers = await (window as any).loadCardHelpers?.();
        if (!helpers) return;
        const card = await helpers.createCardElement({ type: "entities", entities: [] });
        // Triggers HA's lazy import of the entities-card editor, which registers ha-form,
        // ha-entity-picker and friends. They upgrade automatically once defined; don't
        // await registration of a specific tag (a future HA build might not register it here).
        await card?.constructor?.getConfigElement?.();
      } catch (_e) {
        // Fall back to whatever is already registered.
      }
    })();
  }
  return loading;
};

/** Resolves true once `tag` is defined, false after `ms` (never hangs). */
export const whenDefined = async (tag: string, ms = 3000): Promise<boolean> => {
  if (customElements.get(tag)) return true;
  await Promise.race([customElements.whenDefined(tag), timeout(ms)]);
  return !!customElements.get(tag);
};
