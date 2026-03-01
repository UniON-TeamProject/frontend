import styled from 'styled-components';
import React, { useState, useEffect } from 'react';
import SubmitButton from '../components/atoms/SubmitButton'
import Text from '../components/atoms/Text'
import { addNote, deleteNote, clearTrash, restoreNote, getFolderSuggestedTags, getRootFolder, getFolderContent, addFolder, deleteFolder, restoreFolder, clearFolderTrash, renameNote, renameFolder, getAllDeletedNotes, getAllDeletedFolders, getDeletedRootContent, resolveFolderByPath, getNoteTags, addNoteTag, removeNoteTag, getNoteSuggestedTags, getFolderTags, addFolderTag, removeFolderTag, moveNote, moveFolder, getAllFolders } from '../api';
import { useNavigate, useParams } from 'react-router-dom'
import { getToken, parseJwt } from '../token'
import Input from '../components/atoms/Input';
import Layout from '../components/organisms/Layout';

const StyledContainer = styled.div`
   width: 100%;
   height:100%;
   min-height:100vh;
   padding:40px;
   position:relative;
`

const StyledUserHeader = styled.div`
    display:flex;
    flex-flow:row nowrap;
    justify-content:space-between;
    align-items:center;
`

const StyledName = styled.h2`
    color: ${({ theme }) => theme.colors.text};
    font-size: 2.5rem;
    @media(max-width:768px){
        font-size: 2rem;
    }
`

const StyledOptionsHeader = styled.div`
    width:100%;
    margin-top:10px;
    display:flex;
    flex-flow:row nowrap;
    align-items:center;
    position:relative;
`

const StyledBreadcrumbPath = styled.div`
    display:flex;
    align-items:center;
    gap:5px;
    >p{
        cursor:pointer;
    }
    >p.separator{
        cursor:default;
        color:${({ theme }) => theme.colors.darkGrey};
    }
    >p.current{
        font-weight:700;
        cursor:default;
    }
`

const ContentContainer = styled.div`
    width:100%; 
    padding:20px 0;  
    display:flex;
    flex-flow:row wrap;
    gap:20px;
`

const StyledOptionsButtons = styled.div`
    margin-left:auto;
    display:flex;
    gap:6px;
    align-items:center;
`


const StyledOptionsButton = styled.div`
  margin-left: auto;
  padding: 5px 13px;
  background-color: #b486ab;
  border-radius: 5px;
  color: ${({ theme }) => theme.colors.white};
  font-weight: 700;
  cursor: pointer;
  position: relative;
  &.danger{
    background-color: ${({ theme }) => theme.colors.danger};
  }
  >svg{
    margin:3px 0;
  }
`

const StyledOptions = styled.div`
  display: ${({ $active }) => $active ? "block" : "none"};
  position: absolute;
  right: 0;
  top: 100%;
  width: 180px;
  border: 2px solid ${({ theme }) => theme.colors.darkGrey};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 5px;
  z-index: 10;
  background-color: ${({ theme }) => theme.colors.white};
  padding: 10px;
  margin-top:5px;

  cursor: default;
  > div {
    cursor: pointer;
    padding: 5px 0;
  }
`


const StyledItem = styled.div`
    width:125px;
    cursor:pointer;
`

const StyledNoteImage = styled.div`
    width:85px;
    height:100px;
    margin:auto;
    border:3px solid ${({ theme }) => theme.colors.darkGrey};
    border-radius:4px;
    padding:10px;
    @media(max-width:768px){
        height:110px;
    }
    >svg{
        color:${({ theme }) => theme.colors.darkGrey};
    }
`

const StyledFolderImage = styled.div`
    width:100px;
    height:100px;
    margin:auto;
    padding:10px;
    >svg{
        color:${({ theme }) => theme.colors.black};
    }
`

const StyledItemHeaderWrapper = styled.div`
    text-align:center;
    word-break:break-word;
`

const StyledItemHeader = styled.span`
    position:relative;
    display:inline-flex;
    align-items:center;
    padding-left:12px;
    cursor:pointer;
    svg{
        width:9px;
        margin-left:3px;
        flex-shrink:0;
        color: #b486ab;
    }
`

const StyledItemOptions = styled.div`
    display:${({ $active }) => $active ? "block" : "none"};
    width:${({ $narrow }) => $narrow ? "200px" : "350px"};
    border:2px solid ${({ theme }) => theme.colors.darkGrey};
    border-radius:5px;
    z-index:10;
    background-color: ${({ theme }) => theme.colors.white};
    padding:10px;
    text-align:left;
    cursor:default;
    ${({ $centerBelow }) => $centerBelow ? `
        position:fixed;
        top:auto;
        left:50%;
        transform:translateX(-50%);
        margin-top:8px;
        max-width:calc(100vw - 20px);
    ` : `
        position:absolute;
    `}
    ${({ $flipLeft, $centerBelow }) => !$centerBelow && ($flipLeft ? "right:100%; margin-right:10px;" : "left:100%; margin-left:10px;")}
    >input{
        padding:10px;
        margin-bottom:10px;
        width: 100%;
        border-radius: 5px;
        border:none;
        font-weight:700;
        color:${({ theme }) => theme.colors.text};
        background-color:${({ theme }) => theme.colors.lightGrey};
    }

`

const StyledItemOption = styled.div`
    cursor:pointer;
    display: flex; 
    align-items: center;
    font-weight:600;
    padding:5px 0;
    color:${({ theme }) => theme.colors.text};
    &.danger{
        color:${({ theme }) => theme.colors.danger};
        >svg{
            color:${({ theme }) => theme.colors.danger};
        }
    }
    >svg{
        width: 18px;
        margin-right: 8px;
        flex-shrink: 0;
        color:${({ theme }) => theme.colors.text};
    } 
`

const TagsContainer = styled.div`
  width:100%;
  display:flex;
  flex-flow:row wrap;
  align-items:center;
  margin-bottom:10px;

  >p{
    color:${({ theme }) => theme.colors.darkGrey};
    font-size:1rem;
    margin-right:7px;
    font-weight:600;
  }
`

const StyledTag = styled.div`
  padding:2px 10px;
  margin: 3px;
  background-color:${({ theme, $inactive }) => $inactive ? theme.colors.darkGrey : theme.colors.secondary};
  border-radius:10px;
  color:${({ theme, $inactive }) => $inactive ? theme.colors.white : theme.colors.white};
  font-weight:500;
  font-size: 0.9rem;
  display:flex;
  flex-flow:row-nowrap;
  cursor: default;
  >div{
    cursor:pointer;
    font-weight:700;
    font-size:1rem;
    margin:0 0 0 6px;
    padding:0;
    position:relative;
    bottom:2px;
  }
`

const StyledAddTagButton = styled.div`
  padding:2px 10px;
  margin: 0 3px;
  background-color:${({ theme }) => theme.colors.darkGrey};
  border-radius:7px;
  color:${({ theme }) => theme.colors.text};
  font-weight:500;
  cursor: pointer;
`

const StyledTagInput = styled.input`
  padding: 2px 10px;
  margin: 0 3px;
  border-radius: 10px;
  color:${({ theme }) => theme.colors.white};
  border:none;
  width:100px;
  font-size: 0.9rem;
  background-color: ${({ theme }) => theme.colors.secondary};
  &:focus{
    outline:none;
  }
`

const StyledTreeItem = styled.div`
    padding-left: ${({ $depth }) => $depth * 20}px;
`

const StyledTreeItemLabel = styled.div`
    display: flex;
    align-items: center;
    padding: 5px 8px;
    cursor: pointer;
    border-radius:5px;
    background-color: ${({ $selected, $disabled, theme }) =>
        $disabled ? theme.colors.lightGrey : $selected ? '#e0c8dc' : 'transparent'};
    opacity: ${({ $disabled }) => $disabled ? 0.5 : 1};
    pointer-events: ${({ $disabled }) => $disabled ? 'none' : 'auto'};
    &:hover {
        background-color: ${({ $selected, $disabled }) =>
        $disabled ? undefined : $selected ? '#e0c8dc' : '#f0f0f0'};
    }
    > svg {
        width: 16px;
        margin-right: 6px;
        flex-shrink: 0;
    }
`

const StyledPopup = styled.div`
    position:absolute;
    top:50%;
    left:50%;
    transform:translate(-50%, -50%);
    width:700px;
    min-height:300px;
    padding:60px;
    border-radius:5px;
    background-color:${({ theme }) => theme.colors.white};
    @media(max-width:768px){
        width:90%;
        border:1px solid black;
    }   
`

const Notes = () => {
    const params = useParams();
    const urlPath = params["*"] || "";
    const isTrashView = urlPath === "trash" || urlPath.startsWith("trash/");
    const folderPath = isTrashView ? urlPath.replace(/^trash\/?/, "") : urlPath;
    const pathSegments = folderPath ? folderPath.split("/").filter(Boolean) : [];

    const [username, setUsername] = useState(undefined);
    const [noteName, setNoteName] = useState("");
    const [folderName, setFolderName] = useState("");
    const [notes, setNotes] = useState([]);
    const [activeFolderOptionsId, setActiveFolderOptionsId] = useState(null);
    const [addNoteErrorMessage, setAddNoteErrorMessage] = useState("");
    const [addFolderErrorMessage, setAddFolderErrorMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [activeNoteOptionsId, setActiveNoteOptionsId] = useState(null);
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [isAddingFolder, setIsAddingFolder] = useState(false);
    const [isActiveAddOptions, setIsActiveAddOptions] = useState(false);
    const [isActivePathOptions, setIsActivePathOptions] = useState(false);
    const [isConfirmingTrashClear, setIsConfirmingTrashClear] = useState(false);
    const [trashHasItems, setTrashHasItems] = useState(false);
    const [noteNameErrorMessage, setNoteNameErrorMessage] = useState("");
    const [folderNameErrorMessage, setFolderNameErrorMessage] = useState("");
    const [isAddingTag, setIsAddingTag] = useState(false);
    const [newTag, setNewTag] = useState('');
    const [suggestedTags, setSuggestedTags] = useState([]);
    const [chosenTags, setChosenTags] = useState([]);
    const navigate = useNavigate();
    const [currentFolder, setCurrentFolder] = useState(null);
    const [breadcrumbs, setBreadcrumbs] = useState([]);
    const [subFolders, setSubFolders] = useState([]);
    const [editingName, setEditingName] = useState("");
    const [flipLeft, setFlipLeft] = useState(false);
    const [centerBelow, setCenterBelow] = useState(false);
    const [itemTags, setItemTags] = useState([]);
    const [itemSuggestedTags, setItemSuggestedTags] = useState([]);
    const [isAddingItemTag, setIsAddingItemTag] = useState(false);
    const [newItemTag, setNewItemTag] = useState('');
    const [isMoving, setIsMoving] = useState(false);
    const [movingItem, setMovingItem] = useState(null);
    const [moveTree, setMoveTree] = useState([]);
    const [expandedMoveIds, setExpandedMoveIds] = useState(new Set());
    const [selectedMovePath, setSelectedMovePath] = useState(null);
    const [moveErrorMessage, setMoveErrorMessage] = useState("");

    const handleFetchItemTags = async (id, type) => {
        const suggestedId = type === 'folder' ? id : currentFolder?.id;
        const [tagsRes, suggestedRes] = await Promise.all([
            type === 'folder' ? getFolderTags(id) : getNoteTags(id),
            suggestedId ? (type === 'folder' ? getFolderSuggestedTags(suggestedId) : getNoteSuggestedTags(suggestedId)) : Promise.resolve({ tags: [], errorCode: "", message: "" }),
        ]);
        if (!tagsRes.errorCode) setItemTags(tagsRes.tags || []);
        else setItemTags([]);
        if (!suggestedRes.errorCode) setItemSuggestedTags(suggestedRes.tags || []);
        else setItemSuggestedTags([]);
    };

    const handleAddItemTag = async (id, tagName, type) => {
        const res = type === 'folder' ? await addFolderTag(id, tagName) : await addNoteTag(id, tagName);
        if (res.errorCode) {
            if (res.errorCode === "TOKEN_UNDEFINED") navigate("/", { replace: true });
        } else {
            await handleFetchItemTags(id, type);
        }
    };

    const handleRemoveItemTag = async (id, tagName, type) => {
        const res = type === 'folder' ? await removeFolderTag(id, tagName) : await removeNoteTag(id, tagName);
        if (res.errorCode) {
            if (res.errorCode === "TOKEN_UNDEFINED") navigate("/", { replace: true });
        } else {
            await handleFetchItemTags(id, type);
        }
    };

    const buildFolderTree = (folders) => {
        const nonRoot = folders.filter(f => !(f.name === "/" && f.path === "/"));
        const byFullPath = {};
        const enriched = nonRoot.map(f => {
            const fullPath = f.path === "/" ? "/" + f.name : f.path + "/" + f.name;
            const node = { ...f, fullPath, children: [] };
            byFullPath[fullPath] = node;
            return node;
        });
        const roots = [];
        enriched.forEach(node => {
            if (node.path === "/") {
                roots.push(node);
            } else if (byFullPath[node.path]) {
                byFullPath[node.path].children.push(node);
            } else {
                roots.push(node);
            }
        });
        return roots;
    };

    const handleOpenMovePopup = async (id, type, name) => {
        setMovingItem({ id, type, name });
        setSelectedMovePath(null);
        setMoveErrorMessage("");
        setExpandedMoveIds(new Set());
        const res = await getAllFolders();
        if (res.errorCode) {
            if (res.errorCode === "TOKEN_UNDEFINED") navigate("/", { replace: true });
            setMoveErrorMessage(res.message);
            setMoveTree([]);
        } else {
            setMoveTree(buildFolderTree(res.folders || []));
        }
        setIsMoving(true);
        setActiveFolderOptionsId(null);
        setActiveNoteOptionsId(null);
    };

    const handleMove = async () => {
        if (!movingItem || selectedMovePath === null) return;
        setMoveErrorMessage("");
        const res = movingItem.type === 'note'
            ? await moveNote(movingItem.id, selectedMovePath)
            : await moveFolder(movingItem.id, selectedMovePath);
        if (res.errorCode) {
            if (res.errorCode === "TOKEN_UNDEFINED") navigate("/", { replace: true });
            setMoveErrorMessage(res.message);
        } else {
            setIsMoving(false);
            setMovingItem(null);
            await refreshCurrentView();
        }
    };

    const renderMoveTree = (nodes, depth = 1) => {
        return nodes.map(node => {
            const nodePath = node.fullPath;
            const isExpanded = expandedMoveIds.has(node.id);
            const isSelected = selectedMovePath === nodePath;
            const isCurrentFolder = currentFolder && currentFolder.id === node.id;
            const isMovingThis = movingItem?.type === 'folder' && movingItem.id === node.id;
            const isDisabled = isCurrentFolder || isMovingThis;

            return (
                <React.Fragment key={node.id}>
                    <StyledTreeItem $depth={depth}>
                        <StyledTreeItemLabel
                            $selected={isSelected}
                            $disabled={isDisabled}
                            onClick={() => {
                                if (!isDisabled) setSelectedMovePath(nodePath);
                            }}
                        >
                            {node.children && node.children.length > 0 && (
                                <svg
                                    fill="currentColor" viewBox="0 0 16 16"
                                    style={{ cursor: 'pointer', transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setExpandedMoveIds(prev => {
                                            const next = new Set(prev);
                                            if (next.has(node.id)) next.delete(node.id);
                                            else next.add(node.id);
                                            return next;
                                        });
                                    }}
                                >
                                    <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708" />
                                </svg>
                            )}
                            {(!node.children || node.children.length === 0) && <span style={{ width: 16, marginRight: 6, flexShrink: 0, display: 'inline-block' }} />}
                            <svg fill="currentColor" viewBox="0 0 16 16">
                                <path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.826a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31zM2.19 4a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91h10.348a1 1 0 0 0 .995-.91l.637-7A1 1 0 0 0 13.81 4zm4.69-1.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139q.323-.119.684-.12h5.396z" />
                            </svg>
                            <span style={{ marginLeft: 4 }}>{node.name}</span>
                        </StyledTreeItemLabel>
                    </StyledTreeItem>
                    {isExpanded && node.children && renderMoveTree(node.children, depth + 1)}
                </React.Fragment>
            );
        });
    };

    const handleRenameNote = async (id, newName) => {
        setErrorMessage("");
        const result = await renameNote(id, newName);
        if (result.errorCode) {
            setErrorMessage(result.message);
            if (result.errorCode === "TOKEN_UNDEFINED")
                navigate("/", { replace: true });
        } else {
            await refreshCurrentView();
        }
    }

    const handleRenameFolder = async (id, newName) => {
        setErrorMessage("");
        const result = await renameFolder(id, newName);
        if (result.errorCode) {
            setErrorMessage(result.message);
            if (result.errorCode === "TOKEN_UNDEFINED")
                navigate("/", { replace: true });
        } else {
            await refreshCurrentView();
        }
    }

    const sortNotes = (notes) => {
        return [...notes].sort((a, b) => {
            const dateA = new Date(a.editTime ?? 0);
            const dateB = new Date(b.editTime ?? 0);
            return dateB - dateA;
        });
    };

    const fetchForCurrentUrl = async () => {
        setErrorMessage("");
        const res = await resolveFolderByPath(pathSegments, isTrashView);
        if (res.errorCode === "TOKEN_UNDEFINED") {
            navigate("/", { replace: true });
            return;
        }
        if (res.errorCode === "PATH_NOT_FOUND") {
            navigate(isTrashView ? "/notes/trash" : "/notes", { replace: true });
            return;
        }
        if (res.errorCode) {
            setErrorMessage(res.message);
            return;
        }
        setCurrentFolder(res.currentFolder);
        setBreadcrumbs(res.breadcrumbs || []);
        setSubFolders(res.subFolders || []);
        setNotes(sortNotes(res.notes || []));
        if (isTrashView && pathSegments.length === 0) {
            setTrashHasItems((res.subFolders?.length > 0) || (res.notes?.length > 0));
        }
    };

    const skipNextFetch = React.useRef(false);

    const handleOpenFolder = async (folder) => {
        const res = await getFolderContent(folder.id, isTrashView);
        if (res.errorCode) {
            setErrorMessage(res.message);
            return;
        }
        setSubFolders(res.subFolders || []);
        setNotes(sortNotes(res.notes || []));
        setBreadcrumbs([...breadcrumbs, folder]);
        setCurrentFolder(folder);

        const encodedName = encodeURIComponent(folder.name);
        const newUrl = urlPath ? `/notes/${urlPath}/${encodedName}` : `/notes/${encodedName}`;
        skipNextFetch.current = true;
        navigate(newUrl);
    };

    const handleBreadcrumbClick = async (index) => {
        if (index === -1) {
            if (isTrashView) {
                const res = await getDeletedRootContent();
                if (!res.errorCode) {
                    setSubFolders(res.subFolders || []);
                    setNotes(sortNotes(res.notes || []));
                    setTrashHasItems((res.subFolders?.length > 0) || (res.notes?.length > 0));
                }
            } else {
                const root = await getRootFolder();
                if (!root.errorCode) {
                    const res = await getFolderContent(root.id, false);
                    if (!res.errorCode) {
                        setSubFolders(res.subFolders || []);
                        setNotes(sortNotes(res.notes || []));
                    }
                }
            }
            setCurrentFolder(null);
            setBreadcrumbs([]);
            skipNextFetch.current = true;
            navigate(isTrashView ? "/notes/trash" : "/notes");
        } else {
            const target = breadcrumbs[index];
            const res = await getFolderContent(target.id, isTrashView);
            if (!res.errorCode) {
                setSubFolders(res.subFolders || []);
                setNotes(sortNotes(res.notes || []));
                setBreadcrumbs(breadcrumbs.slice(0, index + 1));
                setCurrentFolder(target);
            }
            const segments = breadcrumbs.slice(0, index + 1).map(b => encodeURIComponent(b.name));
            const newPath = segments.join("/");
            skipNextFetch.current = true;
            navigate(isTrashView ? `/notes/trash/${newPath}` : `/notes/${newPath}`);
        }
    };

    const refreshCurrentView = async () => {
        if (currentFolder) {
            const res = await getFolderContent(currentFolder.id, isTrashView);
            if (!res.errorCode) {
                setSubFolders(res.subFolders || []);
                setNotes(sortNotes(res.notes || []));
            }
        } else if (isTrashView) {
            const res = await getDeletedRootContent();
            if (!res.errorCode) {
                setSubFolders(res.subFolders || []);
                setNotes(sortNotes(res.notes || []));
                setTrashHasItems((res.subFolders?.length > 0) || (res.notes?.length > 0));
            }
        } else {
            const root = await getRootFolder();
            if (!root.errorCode) {
                const res = await getFolderContent(root.id, false);
                if (!res.errorCode) {
                    setSubFolders(res.subFolders || []);
                    setNotes(sortNotes(res.notes || []));
                }
            }
        }
    };

    const getCurrentPath = () => {
        if (pathSegments.length === 0) return "/";
        return "/" + pathSegments.map(s => decodeURIComponent(s)).join("/");
    };

    const handleAddNote = async () => {
        setAddNoteErrorMessage("");
        const res = await addNote(noteName.trim(), getCurrentPath());
        if (res.errorCode) {
            setAddNoteErrorMessage(res.message);
            if (res.errorCode == "TOKEN_UNDEFINED")
                navigate("/", { replace: true });
        }
        else {
            setIsAddingNote(false);
            navigate(`/note/${res.id}`)
        }
        setNoteName("");
    }

    const handleDeleteNote = async (id) => {
        setErrorMessage("");
        const res = await deleteNote(id);
        if (res.errorCode) {
            setErrorMessage(res.message);
            if (res.errorCode == "TOKEN_UNDEFINED")
                navigate("/", { replace: true });
        }
        else {
            await refreshCurrentView();
        }
    }

    const handleRestoreNote = async (id) => {
        setErrorMessage("")
        const res = await restoreNote(id);
        if (res.errorCode) {
            setErrorMessage(res.message);
            if (res.errorCode == "TOKEN_UNDEFINED")
                navigate("/", { replace: true });
        }
        else {
            await refreshCurrentView();
        }
    }

    const handleClearTrash = async () => {
        setErrorMessage("");
        const res = await clearTrash();
        if (res.errorCode) {
            setErrorMessage(res.message);
            if (res.errorCode == "TOKEN_UNDEFINED")
                navigate("/", { replace: true });
        }
        else {
            await refreshCurrentView();
        }
    }

    const handleDeleteFolder = async (id) => {
        setErrorMessage("");
        const res = await deleteFolder(id);
        if (res.errorCode) {
            setErrorMessage(res.message);
            if (res.errorCode == "TOKEN_UNDEFINED")
                navigate("/", { replace: true });
        } else {
            await refreshCurrentView();
        }
    }

    const handleRestoreFolder = async (id) => {
        setErrorMessage("");
        const res = await restoreFolder(id);
        if (res.errorCode) {
            setErrorMessage(res.message);
            if (res.errorCode == "TOKEN_UNDEFINED")
                navigate("/", { replace: true });
        } else {
            await refreshCurrentView();
        }
    }

    const handleClearFolderTrash = async () => {
        setErrorMessage("");
        const res = await clearFolderTrash();
        if (res.errorCode) {
            setErrorMessage(res.message);
            if (res.errorCode == "TOKEN_UNDEFINED")
                navigate("/", { replace: true });
        } else {
            await refreshCurrentView();
        }
    }

    const handleFetchFolderSuggestedTags = async () => {
        setAddFolderErrorMessage("")
        const res = await getFolderSuggestedTags(currentFolder?.id);
        if (res.errorCode) {
            setAddFolderErrorMessage(res.message);
            if (res.errorCode == "TOKEN_UNDEFINED")
                navigate("/", { replace: true });
        }
        else {
            setSuggestedTags(res.tags);
            setChosenTags(res.tags);
        }
    }

    const handleAddFolder = async () => {
        setAddFolderErrorMessage("");
        const res = await addFolder(folderName.trim(), getCurrentPath(), chosenTags);
        if (res.errorCode) {
            setAddFolderErrorMessage(res.message);
            if (res.errorCode == "TOKEN_UNDEFINED")
                navigate("/", { replace: true });
        }
        else {
            setIsAddingFolder(false);
        }
        setFolderName("");
        setChosenTags([]);
        setSuggestedTags([]);
        await refreshCurrentView();
    }

    useEffect(() => {
        let jwt = getToken();
        if (!jwt) return;

        let tokenContent = parseJwt(jwt);
        setUsername(tokenContent?.sub);

        if (skipNextFetch.current) {
            skipNextFetch.current = false;
            return;
        }
        fetchForCurrentUrl();
    }, [urlPath])

    return (
        <Layout>
        <StyledContainer onClick={() => {
            setActiveNoteOptionsId(null);
            setActiveFolderOptionsId(null);
            setIsAddingNote(false);
            setIsAddingFolder(false);
            setIsActiveAddOptions(false);
            setIsActivePathOptions(false);
            setIsConfirmingTrashClear(false);
            setItemTags([]);
            setItemSuggestedTags([]);
            setIsAddingItemTag(false);
            setNewItemTag('');
            setIsMoving(false);
            setMovingItem(null);
            setMoveErrorMessage("");
        }}>
            <StyledUserHeader>
                <StyledName>Witaj, {username}!</StyledName>
            </StyledUserHeader>
            {errorMessage && <Text color="danger" text={errorMessage} />}
            <StyledOptionsHeader>
                {(currentFolder || (isTrashView && breadcrumbs.length > 0)) && (
                    <StyledBreadcrumbPath>
                        <p onClick={() => handleBreadcrumbClick(-1)}>
                            <svg width="17" height="17" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM2.5 14V7.707l5.5-5.5 5.5 5.5V14H10v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4z" />
                            </svg>
                        </p>
                        {breadcrumbs.map((crumb, index) => (
                            <React.Fragment key={crumb.id}>
                                <p className="separator">/</p>
                                {index === breadcrumbs.length - 1
                                    ? <p className="current">{crumb.name}</p>
                                    : <p onClick={() => handleBreadcrumbClick(index)}>{crumb.name}</p>
                                }
                            </React.Fragment>
                        ))}
                    </StyledBreadcrumbPath>
                )}
                <StyledOptionsButtons >
                    {!isTrashView && <>
                        <StyledOptionsButton onClick={(e) => {
                            e.stopPropagation();
                            setIsActiveAddOptions(!isActiveAddOptions);
                            setIsActivePathOptions(false);
                            setActiveFolderOptionsId(null);
                            setActiveNoteOptionsId(null);
                        }}>
                            Nowy +
                            <StyledOptions $active={isActiveAddOptions}>
                                <div onClick={(e) => {
                                    e.stopPropagation();
                                    if (currentFolder)
                                        handleFetchFolderSuggestedTags();
                                    setIsAddingFolder(true);
                                    setIsActiveAddOptions(false);
                                }}>Nowy folder</div>
                                <div onClick={(e) => {
                                    e.stopPropagation();
                                    setIsAddingNote(true);
                                    setIsActiveAddOptions(false);
                                }}>Nowy dokument</div>
                            </StyledOptions>
                        </StyledOptionsButton>
                        <StyledOptionsButton onClick={(e) => {
                            e.stopPropagation();
                            setIsActivePathOptions(!isActivePathOptions);
                            setIsActiveAddOptions(false);
                            setActiveFolderOptionsId(null);
                            setActiveNoteOptionsId(null);
                        }}>
                            <svg width="17" height="17" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3" />
                            </svg>
                            <StyledOptions $active={isActivePathOptions}>
                                <div onClick={(e) => {
                                    e.stopPropagation();
                                    setIsActivePathOptions(false);
                                    navigate("/notes/trash");
                                }}> Pokaż usunięte</div>
                            </StyledOptions>
                        </StyledOptionsButton>
                    </>}
                    {isTrashView &&
                        <StyledOptionsButton onClick={() => navigate("/notes")}>
                            Wyjdź
                        </StyledOptionsButton>
                    }
                    {isTrashView && trashHasItems &&
                        <StyledOptionsButton className="danger"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsConfirmingTrashClear(true);
                            }}>
                            Wyczyść kosz
                        </StyledOptionsButton>
                    }
                </StyledOptionsButtons>
            </StyledOptionsHeader>
            <ContentContainer>
                {subFolders.map((folder) => (
                    <StyledItem key={`folder-${folder.id}`}>
                        <StyledFolderImage onClick={() => handleOpenFolder(folder)}>
                            <svg fill="currentColor" viewBox="0 0 16 16">
                                <path d="M.54 3.87.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.826a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31zM2.19 4a1 1 0 0 0-.996 1.09l.637 7a1 1 0 0 0 .995.91h10.348a1 1 0 0 0 .995-.91l.637-7A1 1 0 0 0 13.81 4zm4.69-1.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981l.006.139q.323-.119.684-.12h5.396z" />
                            </svg>
                        </StyledFolderImage>
                        <StyledItemHeaderWrapper>
                            <StyledItemHeader onClick={(e) => {
                                e.stopPropagation();
                                setActiveNoteOptionsId(null);
                                if (!isTrashView && activeFolderOptionsId !== folder.id) {
                                    setEditingName(folder.name);
                                    handleFetchItemTags(folder.id, 'folder');
                                }
                                const rect = e.currentTarget.getBoundingClientRect();
                                const fitsRight = rect.right + 10 + 350 <= window.innerWidth;
                                const fitsLeft = rect.left - 10 - 350 >= 0;
                                setCenterBelow(!fitsRight && !fitsLeft);
                                setFlipLeft(!fitsRight && fitsLeft);
                                setIsAddingItemTag(false);
                                setNewItemTag('');
                                setActiveFolderOptionsId(activeFolderOptionsId === folder.id ? null : folder.id)
                            }}>
                                <Text style={{ width: "unset" }} as="h4" bold="true" text={folder.name} />
                                <svg fill="currentColor" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708" />
                                </svg>
                                <StyledItemOptions $active={activeFolderOptionsId === folder.id} $flipLeft={flipLeft} $centerBelow={centerBelow} $narrow={isTrashView} onClick={e => e.stopPropagation()}>
                                    {isTrashView ? (
                                        <div onClick={(e) => {
                                            e.stopPropagation();
                                            handleRestoreFolder(folder.id);
                                            setActiveFolderOptionsId(null);
                                        }}>Przywróć</div>
                                    ) : (<>
                                        <input
                                            value={editingName}
                                            onChange={e => setEditingName(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' && editingName.trim() && editingName !== folder.name) {
                                                    handleRenameFolder(folder.id, editingName.trim());
                                                }
                                            }}
                                            onClick={e => e.stopPropagation()}
                                        />
                                        <TagsContainer>
                                            <p>Tagi: </p>
                                            {itemTags.map((tag, index) => (
                                                <StyledTag key={`ft-${index}`}>
                                                    {tag}
                                                    <div onClick={(e) => { e.stopPropagation(); handleRemoveItemTag(folder.id, tag, 'folder'); }}>x</div>
                                                </StyledTag>
                                            ))}
                                            {itemSuggestedTags.filter(t => !itemTags.includes(t)).map((tag, index) => (
                                                <StyledTag $inactive key={`fst-${index}`} onClick={() => handleAddItemTag(folder.id, tag, 'folder')} style={{ cursor: 'pointer' }}>
                                                    {tag}
                                                </StyledTag>
                                            ))}
                                            {isAddingItemTag && (
                                                <StyledTagInput
                                                    autoFocus
                                                    value={newItemTag}
                                                    onChange={e => setNewItemTag(e.target.value)}
                                                    onKeyDown={e => {
                                                        if (e.key === 'Enter' && newItemTag.trim()) {
                                                            handleAddItemTag(folder.id, newItemTag.trim(), 'folder');
                                                            setNewItemTag('');
                                                            setIsAddingItemTag(false);
                                                        }
                                                        if (e.key === 'Escape') {
                                                            setIsAddingItemTag(false);
                                                            setNewItemTag('');
                                                        }
                                                    }}
                                                    onBlur={() => { setIsAddingItemTag(false); setNewItemTag(''); }}
                                                    onClick={e => e.stopPropagation()}
                                                />
                                            )}
                                            {!isAddingItemTag && (
                                                <StyledAddTagButton onClick={() => setIsAddingItemTag(true)}>
                                                    +
                                                </StyledAddTagButton>
                                            )}
                                        </TagsContainer>
                                        <StyledItemOption onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenMovePopup(folder.id, 'folder', folder.name);
                                        }}>
                                            <svg fill="currentColor" viewBox="0 0 16 16">
                                                <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8" />
                                            </svg>
                                            Przenieś
                                        </StyledItemOption>
                                        <StyledItemOption className="danger" onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteFolder(folder.id);
                                            setActiveFolderOptionsId(null);
                                        }}>
                                            <svg fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0" />
                                            </svg>
                                            Usuń folder
                                        </StyledItemOption>
                                    </>)}
                                </StyledItemOptions>
                            </StyledItemHeader>
                        </StyledItemHeaderWrapper>
                    </StyledItem>
                ))}
                {notes.map((d) => {
                    const dateObj = new Date(d.editTime ?? d.lastEdited);
                    const formattedDate = dateObj.toLocaleString('pl-PL', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
                    return (
                        <StyledItem key={d.id}>
                            <StyledNoteImage onClick={() => { if (!isTrashView) navigate(`/note/${d.id}`) }}>
                                <svg fill="currentColor" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M0 .5A.5.5 0 0 1 .5 0h4a.5.5 0 0 1 0 1h-4A.5.5 0 0 1 0 .5m0 2A.5.5 0 0 1 .5 2h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m9 0a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m-9 2A.5.5 0 0 1 .5 4h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5m5 0a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m7 0a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5m-12 2A.5.5 0 0 1 .5 6h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5m8 0a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m-8 2A.5.5 0 0 1 .5 8h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m7 0a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5m-7 2a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 0 1h-8a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5" />
                                </svg>
                            </StyledNoteImage>
                            <StyledItemHeaderWrapper>
                                <StyledItemHeader onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveFolderOptionsId(null);
                                    if (!isTrashView && activeNoteOptionsId !== d.id) {
                                        setEditingName(d.name);
                                        handleFetchItemTags(d.id, 'note');
                                    }
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const fitsRight = rect.right + 10 + 350 <= window.innerWidth;
                                    const fitsLeft = rect.left - 10 - 350 >= 0;
                                    setCenterBelow(!fitsRight && !fitsLeft);
                                    setFlipLeft(!fitsRight && fitsLeft);
                                    setIsAddingItemTag(false);
                                    setNewItemTag('');
                                    setActiveNoteOptionsId(activeNoteOptionsId === d.id ? null : d.id)
                                }}
                                >
                                    <Text style={{ width: "unset" }} as="h4" bold="true" text={d.name} />
                                    <svg fill="currentColor" viewBox="0 0 16 16">
                                        <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708" />
                                    </svg>
                                    <StyledItemOptions $active={activeNoteOptionsId === d.id} $flipLeft={flipLeft} $centerBelow={centerBelow} $narrow={isTrashView} onClick={e => e.stopPropagation()}>
                                        {isTrashView ? (
                                            <div onClick={(e) => {
                                                e.stopPropagation();
                                                handleRestoreNote(d.id);
                                                setActiveNoteOptionsId(null);
                                            }}>Przywróć</div>
                                        ) : (<>
                                            <input
                                                value={editingName}
                                                onChange={e => setEditingName(e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter' && editingName.trim() && editingName !== d.name) {
                                                        handleRenameNote(d.id, editingName.trim());
                                                    }
                                                }}
                                                onClick={e => e.stopPropagation()}
                                            />
                                            <TagsContainer>
                                                <p>Tagi: </p>
                                                {itemTags.map((tag, index) => (
                                                    <StyledTag key={`nt-${index}`}>
                                                        {tag}
                                                        <div onClick={(e) => { e.stopPropagation(); handleRemoveItemTag(d.id, tag, 'note'); }}>x</div>
                                                    </StyledTag>
                                                ))}
                                                {itemSuggestedTags.filter(t => !itemTags.includes(t)).map((tag, index) => (
                                                    <StyledTag $inactive key={`nst-${index}`} onClick={() => handleAddItemTag(d.id, tag, 'note')} style={{ cursor: 'pointer' }}>
                                                        {tag}
                                                    </StyledTag>
                                                ))}
                                                {isAddingItemTag && (
                                                    <StyledTagInput
                                                        autoFocus
                                                        value={newItemTag}
                                                        onChange={e => setNewItemTag(e.target.value)}
                                                        onKeyDown={e => {
                                                            if (e.key === 'Enter' && newItemTag.trim()) {
                                                                handleAddItemTag(d.id, newItemTag.trim(), 'note');
                                                                setNewItemTag('');
                                                                setIsAddingItemTag(false);
                                                            }
                                                            if (e.key === 'Escape') {
                                                                setIsAddingItemTag(false);
                                                                setNewItemTag('');
                                                            }
                                                        }}
                                                        onBlur={() => { setIsAddingItemTag(false); setNewItemTag(''); }}
                                                        onClick={e => e.stopPropagation()}
                                                    />
                                                )}
                                                {!isAddingItemTag && (
                                                    <StyledAddTagButton onClick={() => setIsAddingItemTag(true)}>
                                                        +
                                                    </StyledAddTagButton>
                                                )}
                                            </TagsContainer>
                                            <StyledItemOption onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenMovePopup(d.id, 'note', d.name);
                                            }}>
                                                <svg fill="currentColor" viewBox="0 0 16 16">
                                                    <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8" />
                                                </svg>
                                                Przenieś
                                            </StyledItemOption>
                                            <StyledItemOption className="danger" onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteNote(d.id);
                                                setActiveNoteOptionsId(null);
                                            }}>
                                                <svg fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0" />
                                                </svg>
                                                Usuń dokument
                                            </StyledItemOption>
                                        </>)}
                                    </StyledItemOptions>
                                </StyledItemHeader>
                            </StyledItemHeaderWrapper>
                            <Text as="h6" text={formattedDate} />
                        </StyledItem>
                    )
                })}
            </ContentContainer>

            {isAddingNote &&
                <StyledPopup onClick={(e) => e.stopPropagation()}>
                    <Text bold="true" as="h2" text="Nowy Dokument" />
                    {addNoteErrorMessage &&
                        <Text color="danger" text={addNoteErrorMessage} />}
                    {noteNameErrorMessage &&
                        <Text color="danger" text={noteNameErrorMessage} />}
                    <Input
                        autoFocus
                        type="text"
                        name="name"
                        placeholder="Nazwa"
                        value={noteName}
                        mode={noteNameErrorMessage ? "error" : "normal"}
                        onChange={(e) => {
                            setNoteName(e.target.value);
                            setNoteNameErrorMessage("");
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                const nameEmpty = !noteName.trim();
                                if (nameEmpty) setNoteNameErrorMessage("Wypełnij pole");
                                if (!nameEmpty) handleAddNote();
                            };
                        }}
                    />
                    <SubmitButton text="Stwórz" color="dark" onClick={(e) => {
                        e.preventDefault();
                        const nameEmpty = !noteName.trim();
                        if (nameEmpty) setNoteNameErrorMessage("Wypełnij pole");
                        if (!nameEmpty) handleAddNote();
                    }} />
                </StyledPopup>
            }
            {isAddingFolder &&
                <StyledPopup onClick={(e) => e.stopPropagation()}>
                    <Text bold="true" as="h2" text="Nowy Folder" />
                    {addFolderErrorMessage &&
                        <Text color="danger" text={addFolderErrorMessage} />}
                    {folderNameErrorMessage &&
                        <Text color="danger" text={folderNameErrorMessage} />}
                    <Input
                        autoFocus
                        type="text"
                        name="name"
                        placeholder="Nazwa"
                        value={folderName}
                        mode={folderNameErrorMessage ? "error" : "normal"}
                        onChange={(e) => {
                            setFolderName(e.target.value);
                            setFolderNameErrorMessage("");
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                const nameEmpty = !folderName.trim();
                                if (nameEmpty) setFolderNameErrorMessage("Wypełnij pole");
                                if (!nameEmpty) handleAddFolder();
                            };
                        }}
                    />
                    <TagsContainer>
                        <p>Tagi: </p>
                        {[...new Set([...suggestedTags, ...chosenTags])].map((tag, index) => {
                            const isActive = chosenTags.includes(tag);
                            return (
                                <StyledTag $inactive={!isActive} key={index} onClick={() => {
                                    if (isActive) {
                                        setChosenTags(prev => prev.filter(t => t !== tag));
                                    } else {
                                        setChosenTags(prev => [...prev, tag]);
                                    }
                                }}>
                                    {tag}
                                    {!suggestedTags.includes(tag) && <div onClick={(e) => {
                                        e.stopPropagation();
                                        setChosenTags(prev => prev.filter(t => t !== tag));
                                    }}>x</div>}
                                </StyledTag>
                            );
                        })}
                        {isAddingTag && (
                            <StyledTagInput
                                autoFocus
                                value={newTag}
                                onChange={e => setNewTag(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && newTag.trim()) {
                                        setChosenTags(prev => prev.includes(newTag.trim()) ? prev : [...prev, newTag.trim()])
                                        setNewTag('')
                                    }
                                    if (e.key === 'Escape') {
                                        setIsAddingTag(false)
                                        setNewTag('')
                                    }
                                }}
                                onBlur={() => {
                                    setIsAddingTag(false)
                                    setNewTag('')
                                }}
                            />
                        )}
                        {!isAddingTag && (
                            <StyledAddTagButton onClick={() => setIsAddingTag(true)}>
                                +
                            </StyledAddTagButton>
                        )}
                    </TagsContainer>
                    <SubmitButton text="Stwórz" color="dark" onClick={(e) => {
                        e.preventDefault();
                        const nameEmpty = !folderName.trim();
                        if (nameEmpty) setFolderNameErrorMessage("Wypełnij pole");
                        if (!nameEmpty) handleAddFolder();
                    }} />
                </StyledPopup>
            }
            {isConfirmingTrashClear &&
                <StyledPopup onClick={(e) => e.stopPropagation()}>
                    <Text bold="true" as="h2" text="Usuń permanentnie" />
                    <Text text="Czy na pewno chcesz usunąć wszystkie pliki z kosza? Tej operacji nie można cofnąć." />
                    <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                        <SubmitButton text="Usuń" color="danger" onClick={async () => {
                            await handleClearTrash();
                            await handleClearFolderTrash();
                            setIsConfirmingTrashClear(false);
                            if (urlPath === "trash") {
                                await refreshCurrentView();
                            } else {
                                navigate("/notes/trash", { replace: true });
                            }
                        }} />
                        <SubmitButton text="Anuluj" color="dark" light onClick={() => {
                            setIsConfirmingTrashClear(false);
                        }} />
                    </div>
                </StyledPopup>
            }
            {isMoving &&
                <StyledPopup onClick={(e) => e.stopPropagation()}>
                    <Text bold="true" as="h2" text={`Przenieś: ${movingItem?.name || ''}`} />
                    {moveErrorMessage && <Text color="danger" text={moveErrorMessage} />}
                    <div style={{ maxHeight: '300px', overflowY: 'auto', margin: '15px 0', border: '1px solid #ddd', borderRadius: '5px', padding: '8px' }}>
                        <StyledTreeItem $depth={0}>
                            <StyledTreeItemLabel
                                $selected={selectedMovePath === '/'}
                                $disabled={!currentFolder}
                                onClick={() => { if (currentFolder) setSelectedMovePath('/'); }}
                            >
                                <svg fill="currentColor" viewBox="0 0 16 16" style={{ width: 16, marginRight: 6, flexShrink: 0 }}>
                                    <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM2.5 14V7.707l5.5-5.5 5.5 5.5V14H10v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4z" />
                                </svg>
                                <span style={{ marginLeft: 4 }}>/</span>
                            </StyledTreeItemLabel>
                        </StyledTreeItem>
                        {renderMoveTree(moveTree)}
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <SubmitButton text="Zatwierdź" color="dark" onClick={handleMove}
                            style={{ opacity: selectedMovePath === null ? 0.5 : 1, pointerEvents: selectedMovePath === null ? 'none' : 'auto' }} />
                        <SubmitButton text="Anuluj" color="dark" light onClick={() => {
                            setIsMoving(false);
                            setMovingItem(null);
                            setMoveErrorMessage("");
                        }} />
                    </div>
                </StyledPopup>
            }
        </StyledContainer>
        </Layout>
    )
}

export default Notes;
