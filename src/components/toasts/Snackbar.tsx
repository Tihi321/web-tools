import { createEffect, createSignal, Show } from "solid-js";
import { styled } from "solid-styled-components";

interface SnackbarProps {
  open: boolean;
  autoHideDuration?: number;
  onClose: () => void;
  message: string;
}

const SnackbarContainer = styled.div`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #323232;
  color: white;
  padding: 14px 16px;
  border-radius: 4px;
  box-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.2), 0 6px 10px 0 rgba(0, 0, 0, 0.14),
    0 1px 18px 0 rgba(0, 0, 0, 0.12);
  z-index: 1000;
  transition: opacity 0.3s, visibility 0.3s;
`;

export const Snackbar = (props: SnackbarProps) => {
  const [isVisible, setIsVisible] = createSignal(false);

  createEffect(() => {
    if (props.open) {
      setIsVisible(true);
      if (props.autoHideDuration) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          props.onClose();
        }, props.autoHideDuration);
        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
    }
  });

  return (
    <Show when={isVisible()}>
      <SnackbarContainer>{props.message}</SnackbarContainer>
    </Show>
  );
};
