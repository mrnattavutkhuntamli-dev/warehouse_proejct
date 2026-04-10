import { useRef, useState, useCallback, useEffect } from "react";

/**
 * useBarcodeScanner — abstracts html5-qrcode camera scanning
 *
 * Usage:
 *   const { scannerRef, isScanning, startScan, stopScan, lastResult, error } = useBarcodeScanner({ onScan });
 *   <div ref={scannerRef} />
 */
export function useBarcodeScanner({ onScan, containerId = "qr-reader" } = {}) {
  const scannerRef  = useRef(null);
  const html5Ref    = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading,  setIsLoading]  = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [error,      setError]      = useState(null);
  const [cameras,    setCameras]    = useState([]);
  const [activeCam,  setActiveCam]  = useState(null);

  // Lazy-load html5-qrcode to avoid SSR/build issues
  const getLib = useCallback(async () => {
    const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import("html5-qrcode");
    return { Html5Qrcode, Html5QrcodeSupportedFormats };
  }, []);

  // Enumerate cameras
  const loadCameras = useCallback(async () => {
    try {
      const { Html5Qrcode } = await getLib();
      const devices = await Html5Qrcode.getCameras();
      setCameras(devices);
      // prefer back camera
      const back = devices.find(d =>
        d.label.toLowerCase().includes("back") ||
        d.label.toLowerCase().includes("rear") ||
        d.label.toLowerCase().includes("environment")
      );
      setActiveCam(back?.id ?? devices[0]?.id ?? null);
      return devices;
    } catch (err) {
      setError("ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาต Camera Permission");
      return [];
    }
  }, [getLib]);

  const startScan = useCallback(async (camId) => {
    if (isScanning) return;
    setError(null);
    setIsLoading(true);
    try {
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await getLib();

      // Create scanner instance on the div
      const scanner = new Html5Qrcode(containerId, { verbose: false });
      html5Ref.current = scanner;

      const targetCamId = camId ?? activeCam;
      await scanner.start(
        targetCamId
          ? { deviceId: { exact: targetCamId } }
          : { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 240, height: 240 },
          aspectRatio: 1.0,
          supportedScanTypes: [
            Html5QrcodeSupportedFormats.QR_CODE,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
          ],
        },
        (decodedText) => {
          setLastResult(decodedText);
          onScan?.(decodedText);
        },
        () => {} // silent error on each frame miss
      );
      setIsScanning(true);
    } catch (err) {
      setError(err?.message ?? "เริ่มกล้องไม่ได้ ลองอีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  }, [isScanning, activeCam, containerId, getLib, onScan]);

  const stopScan = useCallback(async () => {
    try {
      if (html5Ref.current?.isScanning) {
        await html5Ref.current.stop();
      }
    } catch (_) {}
    html5Ref.current = null;
    setIsScanning(false);
  }, []);

  const switchCamera = useCallback(async (camId) => {
    setActiveCam(camId);
    if (isScanning) {
      await stopScan();
      await startScan(camId);
    }
  }, [isScanning, stopScan, startScan]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { stopScan(); };
  }, [stopScan]);

  return {
    scannerRef,
    containerId,
    isScanning,
    isLoading,
    lastResult,
    error,
    cameras,
    activeCam,
    loadCameras,
    startScan,
    stopScan,
    switchCamera,
    clearResult: () => setLastResult(null),
  };
}
