import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Camera, ScanLine, AlertTriangle } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onDetected: (code: string) => void;
};

export function BarcodeScanner({ open, onClose, onDetected }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState<string | undefined>();

  useEffect(() => {
    if (!open) return;
    setError(null);
    const reader = new BrowserMultiFormatReader();
    let cancelled = false;

    (async () => {
      try {
        const cams = await BrowserMultiFormatReader.listVideoInputDevices();
        if (cancelled) return;
        setDevices(cams);
        const back = cams.find(c => /back|rear|environment/i.test(c.label)) ?? cams[0];
        const useId = deviceId ?? back?.deviceId;
        setDeviceId(useId);

        const controls = await reader.decodeFromVideoDevice(useId, videoRef.current!, (result, err) => {
          if (result) {
            const text = result.getText();
            controls.stop();
            onDetected(text);
          }
        });
        controlsRef.current = controls;
      } catch (e: any) {
        setError(e?.message ?? "Unable to access camera. Please grant permission.");
      }
    })();

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
    };
  }, [open, deviceId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-foreground/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md p-4 shadow-elevated relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/15 grid place-items-center">
              <ScanLine className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold leading-tight">Scan barcode</h3>
              <p className="text-xs text-muted-foreground">EAN, UPC, ISBN, QR & more</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>

        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black">
          <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" muted playsInline />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-32 border-2 border-primary/80 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]">
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-primary animate-pulse" />
            </div>
          </div>
          {error && (
            <div className="absolute inset-0 grid place-items-center p-6 text-center bg-background/95">
              <div>
                <AlertTriangle className="h-8 w-8 text-warning mx-auto mb-2" />
                <p className="text-sm font-medium">Camera unavailable</p>
                <p className="text-xs text-muted-foreground mt-1">{error}</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          {devices.length > 1 ? (
            <select
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              className="text-xs h-9 rounded-md border bg-background px-2 flex-1 min-w-0"
            >
              {devices.map(d => <option key={d.deviceId} value={d.deviceId}>{d.label || "Camera"}</option>)}
            </select>
          ) : (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Camera className="h-3 w-3" />Point camera at a barcode</p>
          )}
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
        </div>
      </Card>
    </div>
  );
}
