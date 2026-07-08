import { OverflowMenu } from "@/features/common";

interface AlbumMeatballsMenuProps {
  onEdit: () => void;
  onMarkAsCurrent: () => void;
}

export const AlbumMeatballsMenu = ({ onEdit, onMarkAsCurrent }: AlbumMeatballsMenuProps) => {
  return (
    <OverflowMenu
      options={[
        { label: "Editar álbum", icon: "create-outline", onPress: onEdit },
        { label: "Marcar como actual", icon: "star-outline", onPress: onMarkAsCurrent },
      ]}
    />
  );
};
