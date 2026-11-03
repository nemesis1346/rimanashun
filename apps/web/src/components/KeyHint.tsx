// Small badge showing a button's keyboard shortcut. Hidden on touch devices
// via the .key-hint rule in globals.css.
export default function KeyHint({ label }: { label: string }) {
  return (
    <kbd
      className="key-hint"
      aria-hidden="true"
      style={{
        marginRight: "0.5rem",
        padding: "0.1rem 0.4rem",
        border: "1px solid currentColor",
        borderRadius: "4px",
        fontFamily: "inherit",
        fontSize: "0.8em",
        opacity: 0.7,
      }}
    >
      {label}
    </kbd>
  );
}
