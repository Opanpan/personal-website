import type { TFunction } from 'i18next';
import type { Interactable } from '../config';

/** Human-readable name for an interactable, used in prompts, toasts and the map. */
export function interactableTitle(it: Interactable, t: TFunction) {
  switch (it.kind) {
    case 'experience':
      return t(`experience.positions.${it.ref}.company`);
    case 'project':
      return t(`projects.items.${it.ref}.title`);
    default:
      return t(`world.items.${it.kind}`);
  }
}
