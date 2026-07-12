import { OverflowMenu } from "@/features/common";

interface AlbumMeatballsMenuProps {
  onEdit: () => void;
  onMarkAsCurrent: () => void;
  onDelete: () => void;
  markingAsCurrent?: boolean;
  deleting?: boolean;
}

export const AlbumMeatballsMenu = ({
  onEdit,
  onMarkAsCurrent,
  onDelete,
  markingAsCurrent = false,
  deleting = false,
}: AlbumMeatballsMenuProps) => {
  return (
    <OverflowMenu
      options={[
        { label: "Editar álbum", icon: "create-outline", onPress: onEdit },
        {
          label: "Marcar como actual",
          icon: "star-outline",
          onPress: onMarkAsCurrent,
          disabled: markingAsCurrent,
        },
        {
          label: "Eliminar álbum",
          icon: "trash-outline",
          destructive: true,
          onPress: onDelete,
          disabled: deleting,
        },
      ]}
    />
  );
};
