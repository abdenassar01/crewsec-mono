"use client"
import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { type DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps {
  value: { from: number | undefined; to: number | undefined }
  onChange: (range: { from: number | undefined; to: number | undefined }) => void
  className?: string
  placeholder?: string
}

export function DateRangePicker({
  value,
  onChange,
  className,
  placeholder = "Pick a date range",
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [pending, setPending] = React.useState<DateRange | undefined>(undefined)

  const committed = React.useMemo<DateRange | undefined>(() => {
    if (value.from) {
      return {
        from: new Date(value.from),
        to: value.to ? new Date(value.to) : undefined,
      }
    }
    return undefined
  }, [value.from, value.to])

  const calendarRange = pending ?? committed

  const handleSelect = (range: DateRange | undefined) => {
    if (!range?.from) {
      setPending(undefined)
      return
    }
    setPending(range)
    if (range.from && range.to) {
      setPending(undefined)
      setOpen(false)
      onChange({
        from: new Date(range.from.getFullYear(), range.from.getMonth(), range.from.getDate(), 0, 0, 0, 0).getTime(),
        to: new Date(range.to.getFullYear(), range.to.getMonth(), range.to.getDate(), 23, 59, 59, 999).getTime(),
      })
    }
  }

  const displayFrom = value.from
  const displayTo = value.to

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setPending(undefined) }}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-start text-left font-normal", !displayFrom && "text-muted-foreground", className)}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayFrom ? (
            displayTo ? (
              <>{format(new Date(displayFrom), "MMM d, yyyy")} – {format(new Date(displayTo), "MMM d, yyyy")}</>
            ) : (
              format(new Date(displayFrom), "MMM d, yyyy")
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={calendarRange?.from}
          selected={calendarRange}
          onSelect={handleSelect}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  )
}
