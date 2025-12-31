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

    .h4{
        font-size:0.9rem;
    }

    //Styles for verificationCodeInput
    .container{
        margin:20px auto;
    }
    .character {
        border: none;
        font-size: 25px;
        border-radius: 5px;
        border:1px solid ${({ theme }) => theme.colors.darkGrey};
        color: ${({ theme }) => theme.colors.text};
        background-color: ${({ theme }) => theme.colors.lightGrey};
    }
    .character.error {
        border: 1px solid ${({ theme }) => theme.colors.danger};
    }
    .character--inactive{
        background-color: ${({ theme }) => theme.colors.darkGrey};
    }
    //
`;
