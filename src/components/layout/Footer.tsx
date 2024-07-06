import { styled } from "solid-styled-components";

// Footer Component
const StyledFooter = styled("footer")`
  margin-top: auto;
  background-color: ${(props) => props?.theme?.colors.darkBackground};
  color: ${(props) => props?.theme?.colors.text};
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  width: 100%;
  padding: 8px;
`;

const InfodFooter = styled("div")`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const Websites = styled("div")`
  display: flex;
  flex-direction: column;
  color: ${(props) => props?.theme?.colors.text};
  gap: 2px;
  font-size: 12px;

  a {
    color: ${(props) => props?.theme?.colors.text};
    text-decoration: none;
  }
`;

const Socials = styled("div")`
  display: flex;
  gap: 6px;

  a {
    color: ${(props) => props?.theme?.colors.text};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

export const Footer = () => {
  return (
    <StyledFooter>
      <InfodFooter>
        <Websites>
          <div>
            Blog: <a href="https://tihomir-selak.from.hr/">tihomir-selak.from.hr</a>
          </div>
          <div>
            Web: <a href="https://kobilica.hr">kobilica.hr</a>
          </div>
        </Websites>
      </InfodFooter>

      <Socials>
        <a href="mailto:tihomir.selak@outlook.com" target="_blank">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
        </a>
        <a href="https://github.com/Tihi321" target="_blank">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
          </svg>
        </a>
        <a href="https://www.linkedin.com/in/selaktihomir" target="_blank">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            stroke="currentColor"
            stroke-width="1.609"
            viewBox="-4.6 -4.6 55.16 55.16"
          >
            <path d="M5.392.492C2.268.492 0 2.647 0 5.614c0 2.966 2.223 5.119 5.284 5.119 1.588 0 2.956-.515 3.957-1.489.96-.935 1.489-2.224 1.488-3.653C10.659 2.589 8.464.492 5.392.492zm2.455 7.319c-.62.603-1.507.922-2.563.922C3.351 8.733 2 7.451 2 5.614c0-1.867 1.363-3.122 3.392-3.122 1.983 0 3.293 1.235 3.338 3.123-.001.862-.314 1.641-.883 2.196zM.959 45.467h8.988V12.422H.959v33.045zm2-31.045h4.988v29.044H2.959V14.422zM33.648 12.422c-4.168 0-6.72 1.439-8.198 2.792l-.281-2.792H15v33.044h9.959V28.099c0-.748.303-2.301.493-2.711 1.203-2.591 2.826-2.591 5.284-2.591 2.831 0 5.223 2.655 5.223 5.797v16.874h10v-18.67c0-9.878-6.382-14.376-12.311-14.376zm10.311 31.045h-6V28.593c0-4.227-3.308-7.797-7.223-7.797-2.512 0-5.358 0-7.099 3.75-.359.775-.679 2.632-.679 3.553v15.368H17V14.422h6.36l.408 4.044h1.639l.293-.473c.667-1.074 2.776-3.572 7.948-3.572 4.966 0 10.311 3.872 10.311 12.374v16.672z"></path>
          </svg>
        </a>
        <a href="https://www.instagram.com/tihomirselak" target="_blank">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
        </a>
      </Socials>
    </StyledFooter>
  );
};
