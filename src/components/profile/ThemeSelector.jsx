import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import { changeTheme } from '../../api'
import { setThemeColor } from '../../store/themeSlice'
import { THEME_COLORS, buildTheme } from '../../styles/theme'
import { CardBox } from './CardBox'

const MiniGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`

const MiniPreview = styled.button`
  width: 80px;
  height: 60px;
  border-radius: 10px;
  border: 3px solid ${({ $active, $dark }) => ($active ? $dark : 'transparent')};
  background-color: ${({ theme }) => theme.colors.pageBg};
  cursor: pointer;
  padding: 0;
  overflow: hidden;
  display: flex;
  transition: transform 0.15s, box-shadow 0.2s;
  box-shadow: ${({ $active }) =>
    $active ? '0 3px 10px rgba(0,0,0,0.2)' : '0 1px 4px rgba(0,0,0,0.08)'};
  &:hover {
    transform: scale(1.06);
  }
`

const MiniSidebar = styled.div`
  width: 18px;
  height: 100%;
  background-color: ${({ $color }) => $color};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
`

const MiniDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
`

const MiniContent = styled.div`
  flex: 1;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const MiniCard = styled.div`
  flex: 1;
  border-radius: 4px;
  background-color: white;
  border: 1px solid ${({ $color }) => $color};
`

const MiniBar = styled.div`
  height: 5px;
  border-radius: 3px;
  background-color: ${({ $color }) => $color};
`

const ThemeFeedback = styled.p`
  margin: 12px 0 0;
  font-size: 0.85rem;
  color: ${({ $error, theme }) =>
    $error ? theme.colors.danger : theme.colors.success};
`

export const ThemeSelector = () => {
  const dispatch = useDispatch()
  const currentTheme = useSelector((state) => state.theme.color)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState({ message: '', error: false })

  const handleThemeChange = async (color) => {
    if (color === currentTheme || saving) return
    setFeedback({ message: '', error: false })
    setSaving(true)
    dispatch(setThemeColor(color))
    const res = await changeTheme(color)
    setSaving(false)
    if (res.errorCode) {
      dispatch(setThemeColor(currentTheme))
      setFeedback({ message: res.message || 'Nie udało się zmienić motywu.', error: true })
      return
    }
    setFeedback({ message: res.message, error: false })
  }

  return (
    <CardBox title="Kolor motywu">
      <MiniGrid>
        {THEME_COLORS.map((color) => {
          const p = buildTheme(color).colors
          const active = color === currentTheme
          return (
            <MiniPreview
              key={color}
              $active={active}
              $dark={p.veryDarkPrimary}
              onClick={() => handleThemeChange(color)}
              disabled={saving}
            >
              <MiniSidebar $color={p.lightPrimary}>
                <MiniDot $color={p.secondary} />
                <MiniDot $color={p.secondary} />
                <MiniDot $color={p.secondary} />
              </MiniSidebar>
              <MiniContent>
                <MiniCard $color={p.border} />
                <MiniBar $color={p.secondary} />
              </MiniContent>
            </MiniPreview>
          )
        })}
      </MiniGrid>
      {feedback.message && (
        <ThemeFeedback $error={feedback.error}>{feedback.message}</ThemeFeedback>
      )}
    </CardBox>
  )
}
