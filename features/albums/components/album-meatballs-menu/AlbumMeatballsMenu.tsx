import { OverflowMenu } from "@/features/common";

interface AlbumMeatballsMenuProps {
  onEdit: () => void;
  onMarkAsCurrent: () => void;
  markingAsCurrent?: boolean;
}

export const AlbumMeatballsMenu = ({
  onEdit,
  onMarkAsCurrent,
  markingAsCurrent = false,
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
      ]}
    />
  );
};
