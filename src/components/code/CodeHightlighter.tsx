import { createEffect, createMemo, createSignal, type Component } from "solid-js";

/**
 * @see https://prismjs.com/#supported-languages
 */
export const Language = {
  JAVASCRIPT: "javascript",
  HTML: "html",
  CSS: "css",
  MARKUP: "markup",
  XML: "xml",
  SVG: "svg",
  TYPESCRIPT: "typescript",
} as const;
export type Language = (typeof Language)[keyof typeof Language];

const getPrismjs = () => {
  const prismWindow = window as any;
  const PrismJs = (prismWindow.Prism = prismWindow.Prism || {}) as any;
  return PrismJs;
};

type Props = {
  value: any;
  onChange: (value: string) => void;
};

export const Highlight: Component<Props> = (props) => {
  const [inputValue, setInputValue] = createSignal<string | undefined>(props.value);
  const highlightedCode = createMemo<string | undefined>(() => {
    if (!inputValue()) {
      return;
    }
    const PrismJs = getPrismjs();
    const grammar = PrismJs.languages[Language.TYPESCRIPT];
    if (!grammar) {
      return;
    }
    const result = PrismJs.highlight(inputValue(), grammar, Language.TYPESCRIPT);
    return result;
  });

  createEffect(() => {
    setInputValue(props.value);
  });

  return (
    <pre style={{ "min-height": "56px" }}>
      <code
        style={{ outline: "none" }}
        class={`language-${Language.TYPESCRIPT}`}
        innerHTML={highlightedCode()}
        contentEditable={true}
        onBlur={(event) => {
          const target = event.target as HTMLDivElement;
          const value = target.textContent || "";
          setInputValue(value);
          props.onChange(inputValue() || "");
        }}
      />
    </pre>
  );
};
