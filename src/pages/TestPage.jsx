import react, { useState, useEffect } from 'react';

const TestPage = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch('https://srv49-20109.wykr.es/team',
            {
                headers: {
                    "JSESSIONID": "29EC4A3D9B5C1AE53B9F9D19AB6B7F4A"
                }
            }
        ).then(response => {
            if (!response.ok) throw new Error('Błąd sieci');
            return response.json();
        })
            .then(json => setData(json))
            .catch(err => setError(err.message));
    }, []);


    if (error) return <div>Błąd: {error}</div>;
    if (data) return <div>Ładowanie...</div>;

    return (
        <>
            <h1> Test Page</h1 >
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </>
    )
}

export default TestPage;