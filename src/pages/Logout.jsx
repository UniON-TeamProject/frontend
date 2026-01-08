import { useNavigate } from 'react-router-dom'
import React, { useEffect } from 'react'

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        sessionStorage.removeItem("token");
        navigate("/");
    }, []);

    return <></>;
};

export default Logout;