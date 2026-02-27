import { useNavigate } from 'react-router-dom'
import React, { useEffect } from 'react'
import { removeToken } from '../token'

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        removeToken();
        navigate("/");
    }, []);

    return <></>;
};

export default Logout;