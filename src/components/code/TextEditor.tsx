import { styled } from "solid-styled-components";
import { TextField } from "@suid/material";
import { createSignal } from "solid-js";

const Container = styled.div`
  background-color: ${(props) => props?.theme?.colors.codeBackground};
  color: ${(props) => props?.theme?.colors.text};
  height: 100%;

  .MuiFormControl-root,
  textarea {
    height: 100% !important;
  }

  .MuiInputBase-root {
    color: ${(props) => props?.theme?.colors.text};
    height: 100%;
  }
`;

export const TextEditor = (props: { value: string; onChange: (value: string) => void }) => {
  const [text, setText] = createSignal(props.value);
  return (
    <Container>
      <TextField
        fullWidth
        multiline
        value={text()}
        onChange={(event) => {
          setText(event.target.value);
        }}
        onBlur={() => {
          props.onChange(text());
        }}
      />
    </Container>
  );
};
