import { createSignal, JSX } from "solid-js";
import { styled } from "solid-styled-components";
import { Paper, Typography, IconButton } from "@suid/material";
import ExpandMoreIcon from "@suid/icons-material/ExpandMore";

interface AccordionProps {
  open?: boolean;
  title: string;
  children: JSX.Element;
}

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

export const Accordion = (props: AccordionProps) => {
  const [isOpen, setIsOpen] = createSignal(props?.open ?? false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen());
  };

  return (
    <AccordionWrapper elevation={3} class="accordion">
      <AccordionHeader onClick={toggleAccordion}>
        <Typography variant="h6" class="accordion-header">
          {props.title}
        </Typography>
        <ExpandIcon class="accordion-icon" isOpen={isOpen()}>
          <ExpandMoreIcon />
        </ExpandIcon>
      </AccordionHeader>
      {isOpen() && <AccordionContent class="accordion-content">{props.children}</AccordionContent>}
    </AccordionWrapper>
  );
};
