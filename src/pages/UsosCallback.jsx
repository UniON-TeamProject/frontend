import { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Layout from "../components/organisms/Layout";
import { submitUsosVerifier } from "../api";

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 40px 20px;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 12px;
  padding: 40px 48px;
  max-width: 480px;
  width: 100%;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
`;

const Title = styled.h2`
  font-size: 1.3rem;
  font-weight: 600;
  color: #1a3020;
  margin: 0 0 8px 0;
`;

const Description = styled.p`
  font-size: 0.9rem;
  color: $({theme})=>theme.colors.takiSmiesznyZielony};
  margin: 0 0 24px 0;
  line-height: 1.5;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #d1d5c8;
  border-radius: 8px;
  font-size: 1rem;
  color: #1a3020;
  background: #f9faf6;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.15s;
  &:focus {
    border-color: #4a7c59;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  margin-top: 16px;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.white};
  background-color: #4a7c59;
  cursor: pointer;
  transition: background-color 0.15s;
  &:hover {
    background-color: #3d6a4a;
  }
  &:disabled {
    background-color: #${({ theme }) => theme.colors.takiSmiesznyZielonyAleJasny};
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: #e24b4a;
  font-size: 0.85rem;
  margin: 12px 0 0 0;
  text-align: center;
`;

const SuccessMessage = styled.p`
  color: #4a7c59;
  font-size: 0.85rem;
  margin: 12px 0 0 0;
  text-align: center;
`;

const UsosCallback = () => {
  const [verifier, setVerifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!verifier.trim()) {
      setError("Wpisz kod weryfikacyjny");
      return;
    }

    setLoading(true);
    setError("");

    const res = await submitUsosVerifier(verifier.trim());

    if (res.errorCode && res.errorCode !== "") {
      setError(res.message);
      setLoading(false);
      if (res.errorCode === "TOKEN_UNDEFINED") {
        navigate("/", { replace: true });
      }
      return;
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(() => navigate("/calendar", { replace: true }), 1500);
  };

  return (
    <Layout>
      <Wrapper>
        <Card>
          <Title>Potwierdź połączenie z USOS</Title>
          <Description>
            Po zalogowaniu się na stronie USOS otrzymałeś kod weryfikacyjny
            (PIN). Wklej go poniżej, aby zaimportować swój plan zajęć.
          </Description>
          <Input
            type="text"
            placeholder="Kod weryfikacyjny"
            value={verifier}
            onChange={(e) => setVerifier(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            disabled={loading || success}
          />
          <Button onClick={handleSubmit} disabled={loading || success}>
            {loading ? "Weryfikowanie..." : "Potwierdź"}
          </Button>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && (
            <SuccessMessage>
              Plan zaimportowany! Przekierowywanie do kalendarza...
            </SuccessMessage>
          )}
        </Card>
      </Wrapper>
    </Layout>
  );
};

export default UsosCallback;
