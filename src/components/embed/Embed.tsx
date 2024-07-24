import { Component } from "solid-js";
import { styled } from "solid-styled-components";

const Iframe = styled("iframe")`
  width: 100%;
  height: auto;
  border: none;
`;

interface EmbedProps {
  src: string;
  title: string;
}

export const Embed: Component<EmbedProps> = ({ src, title }) => {
  return <Iframe src={src} title={title} />;
};
