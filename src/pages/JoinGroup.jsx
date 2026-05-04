import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '../components/organisms/Layout';
import { validateInvitation, acceptInvitation } from '../api';

const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors?.white};
  border-radius: 20px;
  box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid ${({ theme }) => theme.colors?.lightGrey};
  padding: 40px;
  max-width: 500px;
  width: 100%;
  text-align: center;
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors?.text};
  font-size: 1.8rem;
  font-weight: 800;
  margin-top: 0;
  margin-bottom: 15px;
`;

const MessageText = styled.p`
  color: ${({ theme }) => theme.colors?.darkGrey};
  font-size: 1.05rem;
  line-height: 1.6;
  margin-bottom: 30px;
`;

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors?.danger};
  font-weight: 600;
  margin-bottom: 20px;
`;

const Button = styled.button`
  background-color: ${({ theme }) => theme.colors?.secondary };
  color: #fff;
  border: none;
  padding: 12px 30px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
  width: 100%;
  
  &:hover { opacity: 0.8; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const JoinGroup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState('LOADING');
  const [message, setMessage] = useState('');
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('ERROR');
      setMessage('Brak tokena zaproszenia w linku.');
      return;
    }
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    const res = await validateInvitation(token);
    
    if (res.errorCode) {
      if (res.errorCode === "TOKEN_UNDEFINED") {
         navigate("/", { replace: true });
         return;
      }
      setStatus('ERROR');
      setMessage(res.message || "Ten link zapraszający jest nieważny lub wygasł.");
    } else {
      setStatus('READY');
      setMessage(res.message);
    }
  };

  const handleJoin = async () => {
    setStatus('LOADING');
    const res = await acceptInvitation(token);
    
    if (res.errorCode) {
      setStatus('ERROR');
      setMessage(res.message || "Błąd podczas dołączania.");
    } else {
      setStatus('SUCCESS');
      setMessage("Udało się! Zostałeś dodany do grupy.");
      setTimeout(() => navigate('/social'), 2000); 
    }
  };

  return (
    <Layout>
      <PageContainer>
        <Card>
          <Title>Zaproszenie do grupy</Title>
          
          {status === 'LOADING' && <MessageText>Sprawdzanie linku...</MessageText>}
          
          {status === 'READY' && (
            <>
              <MessageText>{message}</MessageText>
              <Button onClick={handleJoin}>Dołącz do społeczności</Button>
            </>
          )}

          {status === 'SUCCESS' && (
            <MessageText style={{ color: '#2ecc71', fontWeight: 'bold' }}>{message}</MessageText>
          )}

          {status === 'ERROR' && (
            <>
              <ErrorText>{message}</ErrorText>
              <Button onClick={() => navigate('/social')} style={{ backgroundColor: '#95a5a6' }}>
                Wróć do społeczności
              </Button>
            </>
          )}
        </Card>
      </PageContainer>
    </Layout>
  );
};

export default JoinGroup;