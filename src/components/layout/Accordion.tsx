import { createSignal, JSX } from "solid-js";
import { styled } from "solid-styled-components";
import { Paper, Typography, IconButton } from "@suid/material";
import ExpandMoreIcon from "@suid/icons-material/ExpandMore";

interface AccordionProps {
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
  padding: 16px;
  cursor: pointer;
`;

const AccordionContent = styled.div`
  padding: 0 16px;
`;

const ExpandIcon = styled(IconButton)<{ isOpen: boolean }>`
  transform: ${(props) => (props.isOpen ? "rotate(180deg)" : "rotate(0)")};
  transition: transform 0.3s ease-out;
`;

export const Accordion = (props: AccordionProps) => {
  const [isOpen, setIsOpen] = createSignal(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen());
  };

  return (
    <AccordionWrapper elevation={3}>
      <AccordionHeader onClick={toggleAccordion}>
        <Typography variant="h6">{props.title}</Typography>
        <ExpandIcon isOpen={isOpen()}>
          <ExpandMoreIcon />
        </ExpandIcon>
      </AccordionHeader>
      {isOpen() && <AccordionContent>{props.children}</AccordionContent>}
    </AccordionWrapper>
  );
};
