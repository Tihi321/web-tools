import { JSX } from "solid-js";
import { styled } from "solid-styled-components";
import { Paper, Typography, IconButton } from "@suid/material";
import ExpandMoreIcon from "@suid/icons-material/ExpandMore";

const AccordionWrapper = styled(Paper)`
  margin-bottom: 16px;
`;

const AccordionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  cursor: pointer;
`;

const AccordionContent = styled.div`
  padding: 8px 16px;
`;

const ExpandIcon = styled(IconButton)<{ isOpen: boolean }>`
  transform: ${(props) => (props.isOpen ? "rotate(180deg)" : "rotate(0)")};
  transition: transform 0.3s ease-out;
`;

interface AccordionProps {
  open: boolean;
  onOpen: (value: boolean) => void;
  title: string;
  children: JSX.Element;
}

export const Accordion = (props: AccordionProps) => {
  return (
    <AccordionWrapper elevation={3} class="accordion">
      <AccordionHeader
        onClick={() => {
          props.onOpen(!Boolean(props.open));
        }}
      >
        <Typography variant="h6" class="accordion-header">
          {props.title}
        </Typography>
        <ExpandIcon class="accordion-icon" isOpen={props.open}>
          <ExpandMoreIcon />
        </ExpandIcon>
      </AccordionHeader>
      {props.open && (
        <AccordionContent class="accordion-content">{props.children}</AccordionContent>
      )}
    </AccordionWrapper>
  );
};
