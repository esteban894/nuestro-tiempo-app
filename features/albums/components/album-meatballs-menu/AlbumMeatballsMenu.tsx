import { OverflowMenu } from "@/features/common";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

  return (
    <OverflowMenu
      options={[
        { label: t("albums.meatballsMenu.edit"), icon: "create-outline", onPress: onEdit },
        {
          label: t("albums.meatballsMenu.markAsCurrent"),
          icon: "star-outline",
          onPress: onMarkAsCurrent,
          disabled: markingAsCurrent,
        },
        {
          label: t("albums.meatballsMenu.delete"),
          icon: "trash-outline",
          destructive: true,
          onPress: onDelete,
          disabled: deleting,
        },
      ]}
    />
  );
};
