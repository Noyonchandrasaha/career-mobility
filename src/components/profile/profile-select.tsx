import { NativeSelect } from "@/components/ui/native-select"
export function ProfileSelect(
  props: React.ComponentProps<typeof NativeSelect>
) {
  return (
    <NativeSelect
      {...props}
      className="w-full [&_select]:min-h-11 [&_select]:text-base"
    />
  )
}
