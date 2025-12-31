import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
    :root{
        line-height: 1.5;
        font-weight: 400;
        color-scheme: light dark;
        color: ${({ theme }) => theme.colors.text};
        background-color: ${({ theme }) => theme.colors.lightGrey};
        @media(max-width:600px){
            background-color:${({ theme }) => theme.colors.white};
        }
    }
    #root {
        width: 100%;
        min-height: 100vh;
    }
`;
