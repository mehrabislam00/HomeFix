/**
 * BorderBeam (Magic UI style): a light travelling around the border.
 * Parent must be `relative` and have a border-radius; the beam inherits it.
 * Styles live in globals.css (.border-beam).
 */
export function BorderBeam() {
  return <span aria-hidden className="border-beam" />;
}