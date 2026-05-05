"use client"

import * as React from "react"
import { Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface TimePickerProps {
  value?: number
  onChange: (timestamp: number) => void
  dateTimestamp?: number
  placeholder?: string
  className?: string
}

export function TimePicker({
  value,
  onChange,
  dateTimestamp,
  placeholder = "Pick a time",
  className,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [hour, setHour] = React.useState<number>(() => {
    if (value !== undefined) return new Date(value).getHours()
    return new Date().getHours()
  })
  const [minute, setMinute] = React.useState<number>(() => {
    if (value !== undefined) return new Date(value).getMinutes()
    return new Date().getMinutes()
  })

  React.useEffect(() => {
    if (value !== undefined) {
      setHour(new Date(value).getHours())
      setMinute(new Date(value).getMinutes())
    }
  }, [value])

  const displayTime = value !== undefined
    ? `${String(new Date(value).getHours()).padStart(2, '0')}:${String(new Date(value).getMinutes()).padStart(2, '0')}`
    : null

  const handleApply = () => {
    const baseDate = dateTimestamp ? new Date(dateTimestamp) : new Date()
    baseDate.setHours(hour, minute, 0, 0)
    onChange(baseDate.getTime())
    setOpen(false)
  }

  const handleHourChange = (val: string) => {
    const h = parseInt(val, 10)
    if (!isNaN(h) && h >= 0 && h <= 23) {
      setHour(h)
    }
  }

  const handleMinuteChange = (val: string) => {
    const m = parseInt(val, 10)
    if (!isNaN(m) && m >= 0 && m <= 59) {
      setMinute(m)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !displayTime && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {displayTime ? <span>{displayTime}</span> : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            max={23}
            value={String(hour).padStart(2, '0')}
            onChange={(e) => handleHourChange(e.target.value)}
            className="w-16 text-center"
          />
          <span className="text-lg font-bold">:</span>
          <Input
            type="number"
            min={0}
            max={59}
            value={String(minute).padStart(2, '0')}
            onChange={(e) => handleMinuteChange(e.target.value)}
            className="w-16 text-center"
          />
        </div>
        <Button
          size="sm"
          className="w-full mt-2"
          onClick={handleApply}
        >
          OK
        </Button>
      </PopoverContent>
    </Popover>
  )
}
