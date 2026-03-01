import { ReactRenderer } from "@tiptap/react";
import CommandsList from "../../components/editor/CommandsList.jsx";

export default function createSuggestion(slashItems) {
  return {
    char: "/",
    command: ({ editor, range, props }) => props.command({ editor, range }),

    items: ({ query }) =>
      slashItems
        .filter((item) => {
          const q = query.toLowerCase();
          return (
            item.title.toLowerCase().startsWith(q) ||
            (item.aliases &&
              item.aliases.some((a) => a.toLowerCase().startsWith(q)))
          );
        })
        .slice(0, 10),

    render: () => {
      let component;
      let popup;

      return {
        onStart: (props) => {
          component = new ReactRenderer(CommandsList, {
            props,
            editor: props.editor,
          });
          popup = document.createElement("div");
          popup.style.position = "absolute";
          popup.style.zIndex = "50";
          document.body.appendChild(popup);
          popup.appendChild(component.element);
          updatePopupPosition(props, popup);
        },
        onUpdate(props) {
          component.updateProps(props);
          updatePopupPosition(props, popup);
        },
        onKeyDown(props) {
          if (props.event.key === "Escape") {
            popup?.remove();
            component?.destroy();
            return true;
          }
          return component?.ref?.onKeyDown(props);
        },
        onExit() {
          popup?.remove();
          component?.destroy();
        },
      };
    },
  };
}

function updatePopupPosition(props, popup) {
  if (!props.clientRect || !popup) return;
  const rect = props.clientRect();
  if (!rect) return;
  popup.style.left = `${rect.left + window.scrollX}px`;
  popup.style.top = `${rect.bottom + window.scrollY + 4}px`;
  popup.style.width = "max-content";
}
