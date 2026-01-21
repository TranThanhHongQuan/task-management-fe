import { QRCodeCanvas } from "qrcode.react";

export default function QrPage() {
  const url = window.location.origin;

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h2>Scan to open</h2>
      <QRCodeCanvas value={url} size={200} />
    </div>
  );
}
