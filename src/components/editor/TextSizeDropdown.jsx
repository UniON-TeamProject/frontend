import React, { useState, useEffect, useRef } from 'react';
import { useEditorState } from '@tiptap/react';
import styled from 'styled-components';
import { headingOptions } from '../../helpers/textEditor/slashItems.jsx';

const StyledDropdownWrapper = styled.div`
  position:relative;
`

const StyledDropdownTrigger = styled.button`
  padding:9px;
  border:none;
  background-color:rgba(50,50,50,0.1);
  border-radius:10px;
  display:flex;
  flex-flow: row nowrap;
  align-items:flex-end;
  cursor:pointer;
  color:${({ theme }) => theme.colors.text};
  >svg{
    width:20px;
    height:20px;
  }
  .arrow{
    height:10px;
    width:10px;
    margin:0 0 3px 2px;
    color:${({ theme }) => theme.colors.dark};
  }
`

const StyledDropdownMenu = styled.div`
  position:absolute;
  top:100%;
  left:0;
  margin-top:4px;
  background:#fff;
  border-radius:13px;
  padding:3px;
  display:flex;
  flex-direction:column;
  overflow-y:auto;
  max-height:200px;
  min-width:160px;
  box-shadow:0 2px 8px rgba(0,0,0,0.12);
  z-index:20;
`

const StyledDropdownItem = styled.button`
  border:none;
  border-radius:10px;
  cursor:pointer;
  padding:6px 10px;
  text-align:left;
  font-size:14px;
  font-weight:600;
  width:100%;
  display:flex;
  align-items:center;
  background-color:${({ $active }) => $active ? '#f0f0f0' : '#fff'};
  &:hover{
    background-color:#f0f0f0;
  }
  >svg{
    width:18px;
    height:18px;
    margin-right:8px;
    flex-shrink:0;
  }
`

function TextSizeDropdown({ editor }) {
  if (!editor) return null;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const editorState = useEditorState({
    editor,
    selector: (ctx) => ({
      currentHeading:
        ctx.editor.isActive('heading', { level: 1 })
          ? 'h1'
          : ctx.editor.isActive('heading', { level: 2 })
            ? 'h2'
            : ctx.editor.isActive('heading', { level: 3 })
              ? 'h3'
              : 'paragraph',
    }),
  });

  const currentOption = headingOptions.find(o => o.value === editorState.currentHeading) || headingOptions[0];

  const handleSelect = (value) => {
    if (value === 'paragraph') editor.chain().focus().setParagraph().run();
    else editor.chain().focus().setHeading({ level: Number(value.replace('h', '')) }).run();
    setIsOpen(false);
  };

  return (
    <StyledDropdownWrapper ref={dropdownRef}>
      <StyledDropdownTrigger onClick={() => setIsOpen(!isOpen)}>
        {currentOption.icon}
        <svg className="arrow" fill="currentColor" viewBox="0 0 16 16">
          <path d="M3.204 5h9.592L8 10.481zm-.753.659 4.796 5.48a1 1 0 0 0 1.506 0l4.796-5.48c.566-.647.106-1.659-.753-1.659H3.204a1 1 0 0 0-.753 1.659" />
        </svg>
      </StyledDropdownTrigger>
      {isOpen && (
        <>
          <StyledDropdownMenu>
            {headingOptions.map((option) => (
              <StyledDropdownItem
                key={option.value}
                $active={option.value === editorState.currentHeading}
                onClick={() => handleSelect(option.value)}
              >
                {option.icon}
                {option.label}
              </StyledDropdownItem>
            ))}
          </StyledDropdownMenu>
        </>
      )}
    </StyledDropdownWrapper>
  );
}

export default TextSizeDropdown;
