import styled from "styled-components";

const TagsContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  margin-bottom: 10px;
  box-sizing: border-box;
  gap: 6px;

  > p {
    color: ${({ theme }) => theme.colors.darkGrey};
    font-size: 1rem;
    margin-right: 7px;
    font-weight: 600;
  }
`;

const StyledTag = styled.div`
    padding: 2px 10px;
    margin: 3px;
    background-color: ${({ theme, $inactive }) =>
      $inactive ? theme.colors.borderLight : theme.colors.secondary};
    border-radius: 10px;
    color: ${({ theme, $inactive }) => ($inactive ? theme.colors.textLight : theme.colors.white)};
    font-weight: 500;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    cursor: ${({ $inactive }) => ($inactive ? "pointer" : "default")};
    transition: all 0.2s;

    &:hover {
        opacity: 0.8;
    }

    > div {
        cursor: pointer;
        font-weight: 700;
        font-size: 1rem;
        margin-left: 6px;
        line-height: 1;
        display: ${({ $inactive }) => ($inactive ? "none" : "block")};
    }
`;

const StyledAddTagButton = styled.div`
  padding: 4px 12px;
  background-color: transparent;
  border: 1px dashed ${({ theme }) => theme.colors.darkGrey};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.textLight};
  font-weight: 600;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  white-space: nowrap;
  display: inline-flex;

  &:hover {
    background-color: ${({ theme }) => theme.colors.lightGrey};
    color: ${({ theme }) => theme.colors.text};
    border-color: ${({ theme }) => theme.colors.text};
  }
`;

const StyledTagInput = styled.input`
  padding: 4px 10px;
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.white};
  border: none;
  width: 90px;
  font-size: 0.8rem;
  font-weight: 600;
  font-family: inherit;
  background-color: ${({ theme }) => theme.colors.secondary};
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
  }
`;

export default function TagSelector({
  suggestedTags = [],
  chosenTags = [],
  isAddingTag = false,
  newTag = "",
  onToggleTag,
  onAddNewTag,
  onRemoveTag,
  onSetIsAddingTag,
  onSetNewTag,
  label = "Tagi: ",
}) {
  return (
    <TagsContainer style={{ justifyContent: "flex-start", marginBottom: "30px" }}>
      <p>{label}</p>
      {[...new Set([...suggestedTags, ...chosenTags])].map((tag, index) => {
        const isActive = chosenTags.includes(tag);
        return (
          <StyledTag
            $inactive={!isActive}
            key={index}
            onClick={() => {
              if (isActive) {
                onRemoveTag(tag);
              } else {
                onToggleTag(tag);
              }
            }}
          >
            {tag}
            {!suggestedTags.includes(tag) && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveTag(tag);
                }}
              >
                x
              </div>
            )}
          </StyledTag>
        );
      })}
      {isAddingTag && (
        <StyledTagInput
          autoFocus
          value={newTag}
          onChange={(e) => onSetNewTag(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && newTag.trim()) {
              onAddNewTag(newTag.trim());
              onSetNewTag("");
            }
            if (e.key === "Escape") {
              onSetIsAddingTag(false);
              onSetNewTag("");
            }
          }}
          onBlur={() => {
            onSetIsAddingTag(false);
            onSetNewTag("");
          }}
        />
      )}
      {!isAddingTag && (
        <StyledAddTagButton onClick={() => onSetIsAddingTag(true)}>
          + Dodaj
        </StyledAddTagButton>
      )}
    </TagsContainer>
  );
}
