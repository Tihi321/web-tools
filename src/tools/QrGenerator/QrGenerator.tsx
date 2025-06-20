import { createSignal } from "solid-js";
import QRCode from "qrcode";
import { Box } from "@suid/material";
import { styled } from "solid-styled-components";

const Container = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const TextArea = styled("textarea")`
  width: 100%;
  min-height: 150px;
`;

const Button = styled("button")`
  background-color: ${(props) => props.theme?.colors.primary};
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  text-align: center;

  &:hover {
    opacity: 0.9;
  }
`;

const DownloadLink = styled("a")`
  display: inline-block;
  background-color: ${(props) => props.theme?.colors.primary};
  color: white;
  padding: 10px 15px;
  border-radius: 5px;
  text-decoration: none;
  margin-top: 10px;

  &:hover {
    opacity: 0.9;
  }
`;

export const QrGenerator = () => {
  const [text, setText] = createSignal("");
  const [qrCodeUrl, setQrCodeUrl] = createSignal("");

  const generateQrCode = async () => {
    try {
      const url = await QRCode.toDataURL(text());
      setQrCodeUrl(url);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 800, margin: "auto" }}>
      <Container>
        <h2>QR Code Generator</h2>
        <TextArea
          value={text()}
          onInput={(e) => setText(e.currentTarget.value)}
          placeholder="Enter text to generate QR code"
        />
        <Button onClick={generateQrCode}>Generate</Button>
        {qrCodeUrl() && (
          <div>
            <img src={qrCodeUrl()} alt="QR Code" />
            <DownloadLink href={qrCodeUrl()} download="qrcode.png">
              Download
            </DownloadLink>
          </div>
        )}
      </Container>
    </Box>
  );
};
