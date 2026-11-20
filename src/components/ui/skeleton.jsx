import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}) {
  return (
    (<div
      className={cn("rounded-lg bg-secondary", className)}
      {...props} />)
  );
}

export { Skeleton }