import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import { EditorState } from "draft-js";
import { Editor } from "react-draft-wysiwyg"
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import targetImage from './assets/a.png'
import './textEditorCustom.css'


export const App = () => {

  const [editorState, setEditorState] = useState('')
  const [toolbarHidden, setToolbarHidden] = useState()

  const onEditorStateChange = (editorState) => {
    setEditorState(editorState)
  }

  const toggleToolbar = () => {
    const _toolbarHidden = !toolbarHidden;
    setToolbarHidden(_toolbarHidden)
  };


  useEffect(() => {
    setEditorState(EditorState.createEmpty())
  }, [])

  return (
    <div style={{ padding: 50 }}>
      <div className='target'>
        <h5 className='editor-title'>Hello Custom react-draft-wysiwyg Editor</h5>
        <div className='sample-image'>
          <h6 className='ml-2'>sample image</h6>
          <img src={targetImage} alt='' />
        </div>
        <br /><br />
        <hr />
        <br /><br />
      </div>
      <div className='editor-wrapper'>
        <Editor
          toolbarHidden={toolbarHidden}
          toolbarClassName="rdw-storybook-toolbar"
          wrapperClassName="rdw-storybook-wrapper"
          editorClassName="rdw-storybook-editor"
          toolbar={{
            options: ['inline', 'link', 'list', 'blockType'],
            inline: {
              inDropdown: false,
              options: ['bold', 'italic', 'strikethrough'],
            },
            link: {
              inDropdown: false,
              options: ['link'],
            },
            list: {
              inDropdown: false,
              options: ['ordered', 'unordered'],
            },
            blockType: {
              inDropdown: false,
              options: ['Blockquote', 'Code'],
            },
            textAlign: { inDropdown: false },
            // link: { inDropdown: true },
            // history: { inDropdown: true },
          }}
        />
        <div className='editor-toolbar'>
          
        </div>
      </div>

        <div style={{ margin: '30px' }}>
          <div className="rdw-storybook-locale-wrapper">
            <span className="rdw-storybook-locale-lbl">Show / Hide toolbar</span>
            <button onClick={() => toggleToolbar()}>{toolbarHidden ? 'show' : 'Hide'}</button>
          </div>
        </div>


    </div>
  )
}
export default App
