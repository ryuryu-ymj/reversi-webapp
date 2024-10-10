export function IconButton(
  { iconName, onClick }: {
    iconName: string;
    onClick: () => void;
  },
) {
  return (
    <button className="icon-button" onClick={onClick}>
      <span className="material-symbols-outlined icon">
        {iconName}
      </span>
    </button>
  );
}
