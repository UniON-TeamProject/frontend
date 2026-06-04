import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styled, { keyframes } from 'styled-components'
import { getUniversities, setUniversity } from '../../api'
import { CardBox } from './CardBox'

const FeedbackText = styled.p`
  margin: 0 0 10px 0;
  font-size: 0.9em;
  color: ${({ $error, theme }) =>
    $error ? theme.colors.danger : theme.colors.success};
`

const UniSelect = styled.select`
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid
    ${({ $highlight, theme }) =>
      $highlight ? theme.colors.danger : theme.colors.primary};
  background-color: ${({ theme }) => theme.colors.white};
  color: ${({ theme }) => theme.colors.veryDarkPrimary};
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23666' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 36px;
  margin-bottom: 14px;
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.veryDarkPrimary};
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

const arrowBounce = keyframes`
  0%   { transform: translateX(0); }
  40%  { transform: translateX(6px); }
  65%  { transform: translateX(-1px); }
  100% { transform: translateX(0); }
`

const UsosBanner = styled.button`
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  margin-top: 14px;
  padding: 14px 18px;
  background-color: ${({ theme }) => theme.colors.darkPageBg};
  border: 1.5px solid ${({ theme }) => theme.colors.primary};
  border-radius: 14px;
  cursor: pointer;
  text-align: left;
  &:hover:not(:disabled) > *:last-child {
    animation: ${arrowBounce} 0.5s ease;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const UsosBannerIcon = styled.div`
  flex-shrink: 0;
  img {
    width: 28px;
    height: 28px;
    border-radius: 6px;
  }
`

const UsosBannerText = styled.div`
  flex: 1;
  min-width: 0;
`

const UsosBannerTitle = styled.div`
  font-size: 0.95rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.veryDarkPrimary};
`

const UsosBannerSub = styled.div`
  font-size: 0.78rem;
  color: ${({ theme }) => theme.colors.tertiary};
  margin-top: 2px;
`

const UsosBannerArrow = styled.div`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.veryDarkPrimary};
  flex-shrink: 0;
  opacity: 0.5;
`

export const UniversitySelector = ({ initialUniversity, highlightUniversity }) => {
  const navigate = useNavigate()
  const [universities, setUniversities] = useState([])
  const [selectedUniversity, setSelectedUniversity] = useState(initialUniversity || '')
  const [highlight, setHighlight] = useState(highlightUniversity ?? false)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState({ message: '', error: false })

  useEffect(() => {
    getUniversities().then((res) => {
      if (!res.errorCode) setUniversities(res.universities)
    })
  }, [])

  useEffect(() => {
    setSelectedUniversity(initialUniversity || '')
  }, [initialUniversity])

  const handleChange = async (e) => {
    const value = e.target.value
    setSelectedUniversity(value)
    setHighlight(false)
    if (!value) return
    setFeedback({ message: '', error: false })
    setSaving(true)
    const res = await setUniversity(value)
    setSaving(false)
    if (res.errorCode) {
      setFeedback({ message: res.message || 'Nie udało się zapisać uczelni.', error: true })
      return
    }
    setFeedback({ message: res.message, error: false })
  }

  return (
    <CardBox title="Uczelnia">
      {highlight && (
        <FeedbackText $error>
          Aby korzystać z integracji USOS, najpierw wybierz swoją uczelnię.
        </FeedbackText>
      )}
      <UniSelect
        value={selectedUniversity}
        onChange={handleChange}
        disabled={saving || universities.length === 0}
        $highlight={highlight}
      >
        <option value="">Wybierz uczelnię..</option>
        {universities.map((uni) => (
          <option key={uni.id} value={uni.name}>
            {uni.name}
          </option>
        ))}
      </UniSelect>
      {feedback.message && (
        <FeedbackText $error={feedback.error}>{feedback.message}</FeedbackText>
      )}
      <UsosBanner
        type="button"
        onClick={() => navigate('/calendar', { state: { openUsosImport: true } })}
        disabled={!selectedUniversity}
      >
        <UsosBannerIcon>
          <img src="/icons/usos.png" alt="USOS" />
        </UsosBannerIcon>
        <UsosBannerText>
          <UsosBannerTitle>Importuj plan z USOS</UsosBannerTitle>
          <UsosBannerSub>Pobierz zajęcia z uczelni do kalendarza</UsosBannerSub>
        </UsosBannerText>
        <UsosBannerArrow>›</UsosBannerArrow>
      </UsosBanner>
    </CardBox>
  )
}
