import { SegmentedControl } from "@/features/common";
import { useTranslation } from "react-i18next";

export const MEMBER_FILTER_ALL = "all" as const;
export type MemberFilterValue = typeof MEMBER_FILTER_ALL | string;

interface MemberFilterProps {
  value: MemberFilterValue;
  onChange: (value: MemberFilterValue) => void;
  meId: string;
  meLabel?: string;
  partnerId: string;
  partnerLabel: string;
}

export const MemberFilter = ({
  value,
  onChange,
  meId,
  meLabel,
  partnerId,
  partnerLabel,
}: MemberFilterProps) => {
  const { t } = useTranslation();

  return (
    <SegmentedControl
      options={[
        { label: t("calendar.memberFilter.all"), value: MEMBER_FILTER_ALL },
        { label: meLabel ?? t("calendar.memberFilter.me"), value: meId },
        { label: partnerLabel, value: partnerId },
      ]}
      value={value}
      onChange={onChange}
    />
  );
};
