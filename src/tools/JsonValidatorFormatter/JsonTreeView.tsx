import { Component, For, createEffect, createSignal } from "solid-js";
import { styled } from "solid-styled-components";

const Container = styled.div`
  padding-bottom: 16px;
`;

const TreeNode = styled.div`
  margin-left: 20px;
`;

const TreeLabel = styled.span<{ isExpanded: boolean }>`
  cursor: pointer;
  &:before {
    content: ${(props) => (props.isExpanded ? '"▼ "' : '"► "')};
  }
`;

const JsonValue = styled.span<{ type: string }>`
  color: ${(props) => {
    switch (props.type) {
      case "string":
        return "green";
      case "number":
        return "blue";
      case "boolean":
        return "red";
      default:
        return "black";
    }
  }};
`;

interface JsonTreeViewProps {
  data: any;
  expanded?: boolean;
}

const JsonTreeView: Component<JsonTreeViewProps> = (props) => {
  const [expandAll, setExpandAll] = createSignal(props.expanded ?? true);

  const renderNode = (key: string, value: any) => {
    const [isExpanded, setIsExpanded] = createSignal(expandAll());
    const type = typeof value;

    if (Array.isArray(value) || (type === "object" && value !== null)) {
      const isArray = Array.isArray(value);
      return (
        <TreeNode>
          <TreeLabel isExpanded={isExpanded()} onClick={() => setIsExpanded(!isExpanded())}>
            {key}: {isArray ? "[]" : "{}"}
          </TreeLabel>
          {isExpanded() && (
            <For each={Object.entries(value)}>
              {([childKey, childValue]) => renderNode(childKey, childValue)}
            </For>
          )}
        </TreeNode>
      );
    } else {
      return (
        <TreeNode>
          {key}: <JsonValue type={type}>{JSON.stringify(value)}</JsonValue>
        </TreeNode>
      );
    }
  };

  createEffect(() => {
    setExpandAll(props.expanded ?? true);
  });

  return <Container>{renderNode("root", props.data)}</Container>;
};

export default JsonTreeView;
