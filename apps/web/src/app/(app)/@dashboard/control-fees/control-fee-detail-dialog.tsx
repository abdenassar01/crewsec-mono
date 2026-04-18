"use client";

import type { Doc } from "@convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

const statusColors: Record<string, string> = {
  AWAITING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  CANCELED: "bg-red-100 text-red-800",
  CONFLICT: "bg-orange-100 text-orange-800",
};

type ControlFeeDetailDialogProps = {
  controlFeeId: Doc<"controlFees">["_id"] | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ControlFeeDetailDialog({
  controlFeeId,
  open,
  onOpenChange,
}: ControlFeeDetailDialogProps) {
  const detail = useQuery(
    api.controlFees.getById,
    controlFeeId && open ? { id: controlFeeId } : "skip"
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85svh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Control Fee Details</DialogTitle>
          <DialogDescription>
            Full details for this control fee record.
          </DialogDescription>
        </DialogHeader>

        {!detail ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <DetailField label="Reference" value={detail.reference} />
              <DetailField label="Mark" value={detail.mark} />
              <DetailField
                label="Status"
                value={
                  <Badge className={statusColors[detail.status] ?? ""}>
                    {detail.status}
                  </Badge>
                }
              />
              <DetailField
                label="Price"
                value={detail.violation ? `${detail.violation.price} Kr` : "N/A"}
              />
              <DetailField
                label="Start Date"
                value={new Date(detail.startDate).toLocaleString()}
              />
              <DetailField
                label="End Date"
                value={new Date(detail.endDate).toLocaleString()}
              />
              <DetailField
                label="Signs Checked"
                value={detail.isSignsChecked ? "Yes" : "No"}
              />
              <DetailField
                label="Photos Taken"
                value={detail.isPhotosTaken ? "Yes" : "No"}
              />
              <DetailField
                label="Created At"
                value={
                  detail.createdAt
                    ? new Date(detail.createdAt).toLocaleString()
                    : "N/A"
                }
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Location Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <DetailField label="Town" value={detail.town?.label ?? "N/A"} />
                <DetailField label="Town Number" value={detail.town?.number?.toString() ?? "N/A"} />
                <DetailField label="Location" value={detail.violation?.location?.label ?? "N/A"} />
                <DetailField label="Violation" value={detail.violation?.violation?.label ?? "N/A"} />
                <DetailField label="Violation Number" value={detail.violation?.violation?.number?.toString() ?? "N/A"} />
              </div>
            </div>

            {detail.ticketUrl && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Ticket</h3>
                <a href={detail.ticketUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  View Ticket Document
                </a>
              </div>
            )}

            {detail.gallery && detail.gallery.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Gallery ({detail.gallery.length} images)</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {detail.gallery.map((url, index) => (
                    <a key={index} href={url} target="_blank" rel="noopener noreferrer">
                      <img
                        src={url}
                        alt={`Gallery image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-md border hover:opacity-80 transition-opacity"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetailField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="font-medium mt-0.5">{value}</div>
    </div>
  );
}
