import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/organisms/Layout';
import { getUserSocialGroups, createSocialGroup, getNotifications, getSocialGroup, getSocialGroupUsers } from '../api';
import NotificationsDropdown from '../components/organisms/NotificationsDropdown';

const PageContainer = styled.div`
  width: 100%;
  height: 100%;
  min-height: 100vh;
  padding: 20px 40px;
  position: relative;
  display: flex;
  flex-direction: column;

  opacity: ${({ $ready }) => ($ready ? 1 : 0)};
  transition: opacity 0.2s ease;
`;

const StyledUserHeader = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  min-height: 60px;
  border-bottom: 1px solid #d1d5db;
  padding-bottom: 15px;
`;

const StyledName = styled.h2`
  color: ${({ theme }) => theme.colors?.text};
  font-size: 2.5rem;
  margin: 0;
  cursor: default;
  @media(max-width:768px){
    font-size: 2rem;
  }
`;

const HeaderIcons = styled.div`
  display: flex;
  gap: 20px;
  color: ${({ theme }) => theme.colors?.darkGrey};
  
  svg {
    width: 28px;
    height: 28px;
    cursor: pointer;
    transition: transform 0.2s, color 0.2s;
    &:hover { 
      transform: scale(1.1); 
      color: ${({ theme }) => theme.colors?.text}; 
    }
  }
`;

const GroupsList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px;
  margin-top: 10px;
`;

const GroupCard = styled.div`
  background-color: ${({ theme }) => theme.colors?.white };
  border-radius: 20px;
  box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.04);
  border: 1px solid ${({ theme }) => theme.colors?.lightGrey };
  display: flex;
  padding: 20px 30px;
  width: 80%;
  flex-direction: column;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    box-shadow: 0px 10px 30px rgba(0, 0, 0, 0.08);
  }
`;

const GroupHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px 25px;
  border-bottom: 2px solid ${({ theme }) => theme.colors?.lightGrey };

  svg {
    width: 32px;
    height: 32px;
    color: ${({ theme }) => theme.colors?.text};
    flex-shrink: 0;
  }
`;

const GroupTitleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const GroupName = styled.h2`
  color: ${({ theme }) => theme.colors?.text};
  font-size: 1.4rem;
  font-weight: 800;
  margin: 0;
`;

const GroupDesc = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors?.darkGrey};
  display: -webkit-box;
  -webkit-line-clamp: 2; 
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const GroupRoleBadge = styled.span`
  margin-left: auto;
  background-color: ${({ theme }) => theme.colors?.secondary};
  color: ${({ theme }) => theme.colors?.white || '#122818'};
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  flex-shrink: 0;
`;

const CardBody = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 200px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const LeftSection = styled.div`
  padding: 20px 25px;
  border-right: 1px solid ${({ theme }) => theme.colors?.lightGrey };
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    border-right: none;
    border-bottom: 1px solid ${({ theme }) => theme.colors?.lightGrey};
  }
`;

const RightSection = styled.div`
  padding: 20px 25px;
  display: flex;
  flex-direction: column;
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors?.text};
  font-weight: 800;
  margin-top: 0;
  margin-bottom: 15px;
`;

const ContentList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  flex-grow: 1;
`;

const ContentItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors?.text};
  font-weight: 600;
  min-width: 0;

  svg {
    width: 20px;
    height: 20px;
    color: ${({ theme }) => theme.colors?.secondary};
    flex-shrink: 0;
  }
`;

const ContentItemText = styled.span`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
`;

const MembersGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  flex-grow: 1;
`;

const MemberItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${({ $bg, theme }) => $bg || theme.colors?.lightGrey};
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(0,0,0,0.05);
  font-weight: 700;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors?.text};
`;

const MemberName = styled.span`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors?.text};
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
`;

const MoreButton = styled.div`
  text-align: right;
  margin-top: auto; 
  color: ${({ theme }) => theme.colors?.darkGrey};
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  padding-top: 15px;
  transition: color 0.2s;
  &:hover { color: ${({ theme }) => theme.colors?.text}; }
`;

const FloatingActionButton = styled.button`
  position: fixed;
  bottom: 40px;
  right: 40px;
  width: 70px;
  height: 70px;
  background-color: ${({ theme }) => theme.colors?.white};
  border: none;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  z-index: 100;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 25px rgba(0,0,0,0.15);
  }
  
  svg {
    width: 32px;
    height: 32px;
    color: ${({ theme }) => theme.colors?.secondary};
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 999;
`;

const StyledPopup = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 500px;
  padding: 40px 50px;
  border-radius: 25px;
  background-color: ${({ theme }) => theme.colors?.white };
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  
  @media(max-width:768px){
    width: 90%;
    padding: 30px;
  }
`;


const ModalTitle = styled.h2`
  text-align: center;
  color: ${({ theme }) => theme.colors?.text};
  margin-top: 0;
  margin-bottom: 25px;
  font-weight: 800;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  width: 100%;
`;

const InputLabel = styled.label`
  display: block;
  font-size: 0.9rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors?.text};
  margin-bottom: 8px;
`;

const ModalInput = styled.input`
  width: 100%;
  padding: 12px 15px;
  border-radius: 12px;
  border: 1px solid ${({ $error, theme }) => $error ? (theme.colors?.danger ) : (theme.colors?.lightGrey)};
  background: ${({ theme }) => theme.colors?.white };
  font-size: 1rem;
  color: ${({ theme }) => theme.colors?.text};
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
  
  &:focus {
    border-color: ${({ theme }) => theme.colors?.secondary};
  }
`;

const ModalTextarea = styled.textarea`
  width: 100%;
  padding: 12px 15px;
  border-radius: 12px;
  border: 1px solid ${({ $error, theme }) => $error ? theme.colors?.danger : theme.colors?.lightGrey};
  background: ${({ theme }) => theme.colors?.white };
  font-size: 1rem;
  color: ${({ theme }) => theme.colors?.text};
  outline: none;
  box-sizing: border-box;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  transition: border-color 0.2s;
  
  &:focus {
    border-color: ${({ theme }) => theme.colors?.secondary};
  }
`;

const ErrorText = styled.span`
  color: ${({ theme }) => theme.colors?.danger};
  font-size: 0.85rem;
  font-weight: 600;
  margin-top: 5px;
  display: block;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 15px;
`;

const ModalButton = styled.button`
  background-color: ${({ $primary, $success, theme }) => 
    $success ? (theme.colors?.secondary) : 
    $primary ? theme.colors?.text : 'transparent'};
  color: ${({ $primary, $success, theme }) => ($primary || $success) ? '#fff' : theme.colors?.text};
  border: ${({ $primary, $success, theme }) => ($primary || $success) ? 'none' : `1px solid ${theme.colors?.darkGrey}`};
  padding: 12px 25px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 120px;
  
  &:hover {
    opacity: 0.8;
  }
`;

const SocialGroups = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [pageError, setPageError] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [nameError, setNameError] = useState("");
  const [descError, setDescError] = useState(""); // description
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setIsReady(false);
    setIsLoading(true);
    setPageError("");
    const res = await getUserSocialGroups();
    
    if (res.errorCode) {
      if (res.errorCode === "TOKEN_UNDEFINED") navigate("/", { replace: true });
      else setPageError(res.message || "Nie udało się pobrać grup.");
    } else {
      const groupsList = Array.isArray(res) ? res : [];
      
      const enrichedGroups = await Promise.all(groupsList.map(async (group) => {
        try {
          const [detailsRes, usersRes] = await Promise.all([
            getSocialGroup(group.id),
            getSocialGroupUsers(group.id)
          ]);

          const contents = [];
          if (!detailsRes.errorCode) {
            const fetchedNotes = detailsRes.noteResponseList || [];
            const fetchedSets = detailsRes.cardSetResponseList || [];

            fetchedNotes.forEach(n => {
              contents.push(n.name || "Notatka");
            });

            fetchedSets.forEach(c => {
              contents.push(c.name || "Fiszki");
            });
          }

          const members = Array.isArray(usersRes) ? usersRes.map(u => ({
            id: u.id,
            name: u.username,
            initials: u.username ? u.username.charAt(0).toUpperCase() : '?'
          })) : [];

          return {
            ...group,
            contents: contents,
            members: members
          };
        } catch (err) {
          return { ...group, contents: [], members: [] };
        }
      }));

      setGroups(enrichedGroups);
    }
    setIsLoading(false);
    setIsReady(true);
  };

  const refreshUnreadCount = async () => {
    const res = await getNotifications();
    if (!res.errorCode) {
      const count = res.notifications.filter(n => !n.isRead).length;
      setUnreadCount(count);
    }
  };

  useEffect(() => {
    fetchGroups();
    refreshUnreadCount(); 
  }, []);

  const handleOpenAddModal = () => {
    setNewGroupName("");
    setNewGroupDesc("");
    setNameError("");
    setDescError("");
    setIsSuccess(false);
    setIsAddModalOpen(true);
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setNameError("");
    setDescError(""); // description

    let isValid = true;

    if (!newGroupName.trim()) {
      setNameError("Nazwa grupy jest wymagana.");
      isValid = false;
    }

    if (!newGroupDesc.trim()) {
      setDescError("Krótki opis grupy jest wymagany.");
      isValid = false;
    }

    if (!isValid) return;

    setIsSubmitting(true);
    
    const res = await createSocialGroup(newGroupName.trim(), newGroupDesc.trim());

    if (res.errorCode) {
      if (res.errorCode === "TOKEN_UNDEFINED") navigate("/", { replace: true });
      else setNameError(res.message || "Błąd podczas tworzenia grupy.");
      setIsSubmitting(false);
    } else {
      setIsSuccess(true);
      await fetchGroups();
      
      setTimeout(() => {
        setIsAddModalOpen(false);
        setIsSuccess(false);
        setIsSubmitting(false);
      }, 1000);
    }
  };

return (
    <Layout>
      <PageContainer $ready={isReady}>
        
        <StyledUserHeader>
          <StyledName>Społeczności</StyledName>
          <HeaderIcons>
            {/* znajomi */}
            <svg onClick={() => navigate('/social/friends')} viewBox="0 0 16 16" fill="currentColor" height="28" width="28">
                <path d="m11.894 10.439333333333334 0.11733333333333332 0.118 0.11833333333333332 -0.118c0.5858 -0.5858 1.5355333333333334 -0.5858 2.1213333333333333 0 0.5858 0.5858 0.5858 1.5355333333333334 0 2.1213333333333333l-2.239133333333333 2.239133333333333 -2.2392 -2.239133333333333c-0.5858 -0.5858 -0.5858 -1.5355333333333334 0 -2.1213333333333333 0.5858 -0.5858 1.5355333333333334 -0.5858 2.1213333333333333 0ZM8 9.333333333333332v1.3333333333333333c-2.2091399999999997 0 -4 1.7908666666666666 -4 4H2.6666666666666665c0 -2.8899333333333335 2.2985599999999997 -5.242999999999999 5.167199999999999 -5.3308L8 9.333333333333332Zm0 -8.666666666666666c2.21 0 4 1.79 4 4 0 2.1597999999999997 -1.7095333333333331 3.9184 -3.85 3.9972666666666665L8 8.666666666666666c-2.21 0 -4 -1.79 -4 -4 0 -2.1597733333333333 1.70956 -3.91842 3.85 -3.99724L8 0.6666666666666666Zm0 1.3333333333333333C6.52638 2 5.333333333333333 3.1930466666666666 5.333333333333333 4.666666666666666c0 1.47362 1.1930466666666666 2.6666666666666665 2.6666666666666665 2.6666666666666665 1.4735999999999998 0 2.6666666666666665 -1.1930466666666666 2.6666666666666665 -2.6666666666666665 0 -1.47362 -1.1930666666666667 -2.6666666666666665 -2.6666666666666665 -2.6666666666666665Z" strokeWidth="0.6"></path>
            </svg>

            {/* wrapper dla powiadomien zeby popup wyswietlal sie pod ikona */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <svg 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} 
                fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              
              {unreadCount > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#e74c3c',
                  borderRadius: '50%',
                  border: '2px solid white'
                }} />
              )}
              
              {isNotificationsOpen && (
                <NotificationsDropdown 
                  onClose={() => setIsNotificationsOpen(false)} 
                  onRefresh={refreshUnreadCount}
                />
              )}
            </div>
          </HeaderIcons>
        </StyledUserHeader>

        {pageError && <div style={{ color: '#e74c3c', marginBottom: '20px' }}>{pageError}</div>}

        {isLoading ? (
          <div style={{ textAlign: 'center', color: '#a0a69b', marginTop: '50px' }}>Ładowanie grup...</div>
        ) : isReady && groups.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#a0a69b', marginTop: '50px' }}>
            Nie należysz jeszcze do żadnej społeczności. Kliknij +, aby utworzyć nową!
          </div>
        ) : (
          <GroupsList>
            {groups.map(group => (
              <GroupCard key={group.id} onClick={() => navigate(`/social/${group.id}`)}>
                
                <GroupHeader>
                  <svg fill="currentColor" viewBox="0 0 16 16">
                     <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275zM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4" />
                  </svg>
                  <GroupTitleWrapper>
                    <GroupName>{group.name}</GroupName>
                    {group.description && <GroupDesc>{group.description}</GroupDesc>}
                  </GroupTitleWrapper>
                  <GroupRoleBadge>
                    {group.userRole === 'ADMIN' ? 'Admin' : 
                     group.userRole === 'EDITOR' ? 'Edytor' : 
                     group.userRole === 'VIEWER' ? 'Obserwator' : 'Członek'}
                  </GroupRoleBadge>
                </GroupHeader>

                <CardBody>
                  <LeftSection>
                    <SectionTitle>Zawartość</SectionTitle>
                    <ContentList>
                      {group.contents.length > 0 ? (
                        <>
                          {group.contents.slice(0, 5).map((item, idx) => (
                            <ContentItem key={idx}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5z"/>
                              </svg>
                              <ContentItemText>{item}</ContentItemText>
                            </ContentItem>
                          ))}
                          
                          {group.contents.length === 6 && (
                            <ContentItem key={5}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5z"/>
                              </svg>
                              <ContentItemText>{group.contents[5]}</ContentItemText>
                            </ContentItem>
                          )}

                          {group.contents.length > 6 && (
                            <ContentItem style={{ color: '#707a73' }}>
                              <div style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e9ece1', borderRadius: '4px', fontSize: '1rem', fontWeight: 'bold', flexShrink: 0 }}>+</div>
                              <ContentItemText>{group.contents.length - 5} innych</ContentItemText>
                            </ContentItem>
                          )}
                        </>
                      ) : (
                        <div style={{ color: '#a0a69b', fontSize: '0.9rem' }}>Brak materiałów.</div>
                      )}
                    </ContentList>
                  </LeftSection>

                  <RightSection>
                    <SectionTitle>Członkowie</SectionTitle>
                    <MembersGrid>
                      {group.members.length > 0 ? (
                        <>
                          {group.members.slice(0, 5).map((member) => (
                            <MemberItem key={member.id}>
                              <Avatar $bg={member.bg}>{member.initials}</Avatar>
                              <MemberName>{member.name}</MemberName>
                            </MemberItem>
                          ))}

                          {group.members.length === 6 && (
                            <MemberItem key={group.members[5].id}>
                              <Avatar $bg={group.members[5].bg}>{group.members[5].initials}</Avatar>
                              <MemberName>{group.members[5].name}</MemberName>
                            </MemberItem>
                          )}

                          {group.members.length > 6 && (
                            <MemberItem>
                              <Avatar style={{ backgroundColor: '#e9ece1', color: '#122818', fontSize: '1rem' }}>+</Avatar>
                              <MemberName style={{ color: '#707a73' }}>{group.members.length - 5} innych</MemberName>
                            </MemberItem>
                          )}
                        </>
                      ) : (
                        <div style={{ color: '#a0a69b', fontSize: '0.9rem' }}>...</div>
                      )}
                    </MembersGrid>
                  </RightSection>
                </CardBody>
              </GroupCard>
            ))}
          </GroupsList>
        )}

        <FloatingActionButton onClick={handleOpenAddModal} title="Utwórz nową grupę">
          <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </FloatingActionButton>

        {/* MODAL TWORZENIA NOWEJ GRUPY */}
        {isAddModalOpen && (
          <>
            <ModalOverlay onClick={() => !isSubmitting && setIsAddModalOpen(false)} />
            <StyledPopup onClick={(e) => e.stopPropagation()}>
              <ModalTitle>Utwórz nową społeczność</ModalTitle>
              
              <form onSubmit={handleCreateGroup}>
                <FormGroup>
                  <InputLabel>Nazwa grupy *</InputLabel>
                  <ModalInput 
                    type="text" 
                    placeholder="Np. Informatyka I rok - Podstawy"
                    value={newGroupName}
                    onChange={(e) => {
                      setNewGroupName(e.target.value);
                      if (nameError) setNameError("");
                    }}
                    maxLength={55}
                    $error={!!nameError}
                    autoFocus
                    disabled={isSubmitting || isSuccess}
                  />
                  {nameError && <ErrorText>{nameError}</ErrorText>}
                </FormGroup>

                <FormGroup>
                  <InputLabel>Krótki opis *</InputLabel>
                  <ModalTextarea 
                    placeholder="Opisz, czym będziecie się zajmować w tej grupie..."
                    value={newGroupDesc}
                    onChange={(e) => {
                      setNewGroupDesc(e.target.value);
                      if (descError) setDescError("");
                    }}
                    maxLength={255}
                    $error={!!descError}
                    disabled={isSubmitting || isSuccess}
                  />
                  {descError && <ErrorText>{descError}</ErrorText>}
                </FormGroup>

                <ButtonGroup>
                  <ModalButton type="button" onClick={() => setIsAddModalOpen(false)} disabled={isSubmitting || isSuccess}>
                    Anuluj
                  </ModalButton>
                  <ModalButton type="submit" $primary={!isSuccess} $success={isSuccess} disabled={isSubmitting || isSuccess}>
                    {isSuccess ? "✔ Utworzono!" : (isSubmitting ? "Tworzenie..." : "Utwórz grupę")}
                  </ModalButton>
                </ButtonGroup>
              </form>

            </StyledPopup>
          </>
        )}

      </PageContainer>
    </Layout>
  );
};

export default SocialGroups;