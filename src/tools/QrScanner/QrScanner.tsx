import { createSignal, onCleanup } from "solid-js";
import { Html5Qrcode } from "html5-qrcode";
import { Box } from "@suid/material";
import { styled } from "solid-styled-components";

const Container = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Tabs = styled("div")`
  display: flex;
  margin-bottom: 1rem;
  border-bottom: 1px solid #ccc;
`;

const TabButton = styled("button")<{ active: boolean }>`
  padding: 0.75rem 1.5rem;
  border: none;
  background-color: transparent;
  cursor: pointer;
  font-size: 1rem;
  color: ${(props) => (props.active ? props.theme?.colors.primary : "inherit")};
  border-bottom: 2px solid
    ${(props) => (props.active ? props.theme?.colors.primary : "transparent")};
  margin-bottom: -1px;
`;

const ReaderContainer = styled("div")`
  width: 100%;
  max-height: 400px;
  border: 1px solid #ccc;

  @media (max-width: 600px) {
    width: 100%;
  }
`;

const DropZone = styled("div")`
  border: 2px dashed #ccc;
  border-radius: 5px;
  padding: 20px;
  text-align: center;
  cursor: pointer;

  &.drag-over {
    border-color: ${(props) => props.theme?.colors.primary};
  }
`;

const Button = styled("button")`
  background-color: ${(props) => props.theme?.colors.primary};
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

const FileInputWrapper = styled("label")`
  background-color: ${(props) => props.theme?.colors.primary};
  color: white;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  display: inline-block;
  text-align: center;

  &:hover {
    opacity: 0.9;
  }

  input[type="file"] {
    display: none;
  }
`;

const qrcodeRegionId = "qr-code-reader";

export const QrScanner = () => {
  const [activeTab, setActiveTab] = createSignal<"camera" | "file">("camera");
  const [scanResult, setScanResult] = createSignal("");
  const [isDragOver, setIsDragOver] = createSignal(false);
  let html5QrCode: Html5Qrcode | null = null;

  const onScanSuccess = (decodedText: string) => {
    setScanResult(decodedText);
    stopScan();
  };

  const onScanFailure = () => {
    // ignore scan failure
  };

  const startCameraScan = () => {
    if (html5QrCode?.isScanning) return;

    html5QrCode = new Html5Qrcode(qrcodeRegionId);
    html5QrCode
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        onScanSuccess,
        onScanFailure
      )
      .catch((err) => {
        console.log(`Unable to start scanning, error: ${err}`);
      });
  };

  const handleFile = (file: File) => {
    if (html5QrCode?.isScanning) {
      stopScan();
    }

    const fileScanner = new Html5Qrcode(qrcodeRegionId, false);
    fileScanner
      .scanFile(file, true)
      .then(onScanSuccess)
      .catch((err) => {
        setScanResult(`Error scanning file. ${err}`);
      })
      .finally(() => {
        fileScanner.clear();
      });
  };

  const copyToClipboard = () => {
    if (scanResult()) {
      navigator.clipboard.writeText(scanResult());
      html5QrCode = null;
    }
  };

  const stopScan = () => {
    if (html5QrCode && html5QrCode.isScanning) {
      html5QrCode
        .stop()
        .then(() => {
          html5QrCode?.clear();
          html5QrCode = null;
        })
        .catch((err) => console.error(err));
    }
  };

  const handleFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      handleFile(target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  onCleanup(() => {
    if (html5QrCode?.isScanning) {
      stopScan();
    }
  });

  return (
    <Box sx={{ width: "100%", maxWidth: 800, margin: "auto" }}>
      <Container>
        <h2>QR Code Scanner</h2>
        <Tabs>
          <TabButton active={activeTab() === "camera"} onClick={() => setActiveTab("camera")}>
            Camera
          </TabButton>
          <TabButton active={activeTab() === "file"} onClick={() => setActiveTab("file")}>
            File
          </TabButton>
        </Tabs>

        <ReaderContainer
          id={qrcodeRegionId}
          style={{ display: activeTab() === "camera" ? "block" : "none" }}
        />

        {activeTab() === "camera" && (
          <>
            <Button onClick={startCameraScan}>Scan with Camera</Button>
            <Button onClick={stopScan}>Stop Scan</Button>
          </>
        )}

        {activeTab() === "file" && (
          <DropZone
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            classList={{ "drag-over": isDragOver() }}
          >
            <p>Drag and drop an image here or</p>
            <FileInputWrapper>
              Select File
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </FileInputWrapper>
          </DropZone>
        )}

        {scanResult() && (
          <div>
            <h3>Scan Result:</h3>
            <p>{scanResult()}</p>
            <Button onClick={copyToClipboard}>Copy</Button>
          </div>
        )}
      </Container>
    </Box>
  );
};
