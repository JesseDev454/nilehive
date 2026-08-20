import { useState } from "react";
import { AlertCircle, FileText, FileX2, HelpCircle, RefreshCw, UploadCloud, X } from "lucide-react";
import { Button } from "@/shared/components/Button";
import { Card, CardContent } from "@/shared/components/Card";

interface ReceiptUploadErrorScreenProps {
  errorType?: "too_large" | "invalid_type";
  fileName?: string;
  fileSize?: string;
  maxSize?: string;
  onSelectAnotherFile?: () => void;
  onDismiss?: () => void;
}

export function ReceiptUploadErrorScreen({
  errorType = "too_large",
  fileName = "bank_transfer_receipt_scanned_highres.pdf",
  fileSize = "14.2 MB",
  maxSize = "5.0 MB",
  onSelectAnotherFile,
  onDismiss
}: ReceiptUploadErrorScreenProps) {
  return (
    <div className="flex min-h-[500px] w-full items-center justify-center p-4 sm:p-6 bg-background text-foreground">
      <Card className="w-full max-w-lg border-destructive/30 bg-card shadow-sm overflow-hidden text-left">
        <div className="bg-destructive/10 border-b border-destructive/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileX2 className="h-5 w-5 text-destructive" />
            <span className="font-bold text-sm tracking-tight text-foreground">Receipt Verification Failed</span>
          </div>
          <span className="text-[10px] font-bold text-destructive bg-destructive/15 border border-destructive/25 px-2 py-0.5 rounded-full uppercase">
            {errorType === "too_large" ? "Size Exceeded" : "Unsupported Format"}
          </span>
        </div>

        <CardContent className="p-6 sm:p-8 space-y-5">
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {errorType === "too_large" ? "File Size Exceeds Allowed Limit" : "Invalid File Type for Receipt"}
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {errorType === "too_large"
                ? `The document you selected exceeds the maximum allowable upload size of ${maxSize}.`
                : "Payment receipts must be uploaded as clean PDF documents or clear JPG/PNG images."}
            </p>
          </div>

          {/* Rejected file detail card */}
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3.5 space-y-2 text-xs">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-destructive shrink-0" />
                <span className="font-mono font-bold text-foreground text-xs truncate max-w-[220px]">
                  {fileName}
                </span>
              </div>
              <span className="font-mono text-destructive font-bold text-xs">{fileSize}</span>
            </div>

            <p className="text-[11px] text-muted-foreground pt-1 border-t border-destructive/15">
              {errorType === "too_large"
                ? `Allowed maximum: ${maxSize}. Please compress or downscale the file before uploading.`
                : "Accepted formats: PDF (.pdf), JPEG (.jpg, .jpeg), PNG (.png)."}
            </p>
          </div>

          {/* Guidelines */}
          <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5 space-y-2 text-xs">
            <span className="font-bold text-foreground block text-xs">
              Receipt Upload Guidelines:
            </span>
            <ul className="space-y-1 text-[11px] text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span>Ensure transaction reference number &amp; amount are clearly legible</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span>Files up to 5 MB are processed instantly for Treasury reconciliation</span>
              </li>
            </ul>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <Button
              className="w-full sm:flex-1 h-10 text-xs font-bold gap-2 shadow-xs"
              onClick={onSelectAnotherFile}
            >
              <UploadCloud className="h-4 w-4" />
              <span>Choose Another File</span>
            </Button>

            {onDismiss && (
              <Button
                variant="outline"
                className="w-full sm:w-auto h-10 text-xs font-semibold"
                onClick={onDismiss}
              >
                <span>Dismiss</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
