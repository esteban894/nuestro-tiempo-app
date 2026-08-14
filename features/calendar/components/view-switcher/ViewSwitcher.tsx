import { SegmentedControl } from "@/features/common";
import { useTranslation } from "react-i18next";

export type CalendarViewMode = "month" | "week" | "day";

interface ViewSwitcherProps {
  value: CalendarViewMode;
  onChange: (value: CalendarViewMode) => void;
}

export const ViewSwitcher = ({ value, onChange }: ViewSwitcherProps) => {
  const { t } = useTranslation();

  return (
    <SegmentedControl
      options={[
        { label: t("calendar.views.month"), value: "month" },
        { label: t("calendar.views.week"), value: "week" },
        { label: t("calendar.views.day"), value: "day" },
      ]}
      value={value}
      onChange={(next) => onChange(next as CalendarViewMode)}
    />
  );
};
