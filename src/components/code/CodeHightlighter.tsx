import { createSignal, onMount, type Component } from "solid-js";

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

const getHighlightedCode = (value: string) => {
  const PrismJs = getPrismjs();
  const grammar = PrismJs.languages[Language.TYPESCRIPT];
  if (!grammar) {
    return;
  }
  const result = PrismJs.highlight(value, grammar, Language.TYPESCRIPT);
  return result;
};

const highlightAll = () => {
  const PrismJs = getPrismjs();
  PrismJs.highlightAll();
};

type Props = {
  value: any;
  onChange: (value: string) => void;
};

export const Highlight: Component<Props> = (props) => {
  const [highlightedCode, setHighlightedCode] = createSignal<string | undefined>();

  onMount(() => {
    const code = getHighlightedCode(props.value);
    setHighlightedCode(code);
    highlightAll();
  });

  const onBlur = (event: Event) => {
    const target = event.target as HTMLDivElement;
    const value = target.textContent || "";
    const code = getHighlightedCode(value);
    setHighlightedCode(code);
    props.onChange(value);
    highlightAll();
  };

  return (
    <pre style={{ "min-height": "56px" }}>
      <code
        style={{ outline: "none" }}
        class={`language-${Language.TYPESCRIPT}`}
        innerHTML={highlightedCode()}
        contentEditable={true}
        onBlur={onBlur}
      />
    </pre>
  );
};
