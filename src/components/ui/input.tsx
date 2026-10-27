import * as React from "react"

import { cn } from "@/lib/utils"

const fieldBase =
  "w-full min-w-0 rounded-md border bg-transparent px-3.5 text-[15px] transition-[border-color,box-shadow] outline-none placeholder:text-current/40 focus-visible:border-glow focus-visible:ring-[3px] focus-visible:ring-glow/25 aria-invalid:border-destructive aria-invalid:ring-destructive/20 disabled:opacity-50"

function Input({ className, type = "text", ...props }: React.ComponentProps<"input">) {
  return <input type={type} data-slot="input" className={cn(fieldBase, "h-12", className)} {...props} />
}

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea data-slot="textarea" className={cn(fieldBase, "min-h-24 resize-y py-3", className)} {...props} />
}

export { Input, Textarea }
