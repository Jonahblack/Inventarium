import React, { useCallback, useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import type { IScannerControls } from "@zxing/browser";
import type { Result } from "@zxing/library";

interface Props {
  onDetected: (value: string) => void;
  onClose: () => void;
}

const BarcodeScanner: React.FC<Props> = ({ onDetected, onClose }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  const stopScanner = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    BrowserMultiFormatReader.releaseAllStreams();
  }, []);

  const handleClose = useCallback(() => {
    stopScanner();
    onClose();
  }, [onClose, stopScanner]);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    let isMounted = true;

    const startScanner = async () => {
      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        if (!isMounted) return;
        const deviceId = devices[0]?.deviceId;

        if (!deviceId) {
          setError("No camera device found");
          setInitializing(false);
          return;
        }

        const videoElement = videoRef.current;
        if (!videoElement) {
          setError("Unable to access camera preview element");
          setInitializing(false);
          return;
        }

        const controls = await codeReader.decodeFromVideoDevice(
          deviceId,
          videoElement,
          (result: Result | undefined, _err, controlsInstance) => {
            if (controlsInstance && !controlsRef.current) {
              controlsRef.current = controlsInstance;
            }
            if (result) {
              onDetected(result.getText());
              handleClose();
            }
            // Ignore decode errors while scanning
          }
        );

        if (!isMounted) {
          controls.stop();
          return;
        }

        controlsRef.current = controls;
        setInitializing(false);
      } catch (err) {
        if (!isMounted) return;
        console.error(err);
        setError(
          "Unable to access camera. Please allow camera permission or enter the barcode manually."
        );
        setInitializing(false);
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      stopScanner();
    };
  }, [onDetected, handleClose, stopScanner]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-80">
      <div className="relative w-full max-w-md rounded-lg bg-gray-900 p-4 text-white">
        <h2 className="mb-2 text-lg font-semibold">Scan barcode</h2>
        {initializing && (
          <p className="text-sm text-gray-300">Starting camera...</p>
        )}
        {error && <p className="mb-2 text-sm text-red-400">{error}</p>}
        <div className="mt-2 flex justify-center">
          <video
            ref={videoRef}
            className="h-64 w-full rounded-md bg-black object-cover"
          />
        </div>
        <p className="mt-2 text-xs text-gray-300">
          Point the barcode into the frame. This scanner supports common 1D
          codes like EAN-13, UPC-A/E, and Code 128.
        </p>
        <button
          onClick={handleClose}
          className="mt-4 w-full rounded-md border border-gray-500 px-4 py-2 text-sm hover:bg-gray-800"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default BarcodeScanner;
