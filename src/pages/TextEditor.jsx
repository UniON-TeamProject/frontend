import Markdown from 'react-markdown'
import { React, useState } from 'react'

const markdown = `A paragraph with *emphasis* and **strong importance**`

const TextEditor = () => {
    const [text, setText] = useState(markdown);
    return (
        <>
            <Markdown>{text}</Markdown>
        </>
    )
}

export default TextEditor;