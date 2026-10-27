import { asset, cn } from "@/lib/utils"

/** The bureau's wordmark (from the live site), tinted with `currentColor` through a CSS mask. */
export function Logo({ className }: { className?: string }) {
  const url = `url("${asset("brand/logo-black.svg")}")`
  return (
    <span
      role="img"
      aria-label="Черников Бюро"
      className={cn("block aspect-[649.4/84] bg-current", className)}
      style={{ maskImage: url, WebkitMaskImage: url, maskSize: "contain", WebkitMaskSize: "contain", maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat" }}
    />
  )
}
