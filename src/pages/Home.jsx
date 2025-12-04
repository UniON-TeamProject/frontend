import styled from 'styled-components';
import react, {useState} from 'react';

const StyledHeader= styled.h2`
    color:green;
    font-size:30px;
`

const Home =()=>{
    const [counter, setCounter]= useState(10);
    return <StyledHeader>Home page {counter}</StyledHeader>
}

export default Home;
