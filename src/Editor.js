import TextareaAutosize from 'react-textarea-autosize';
import React, {useState, useEffect, useRef} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import * as Actions from './store/actions';
import { useDispatch, useSelector } from 'react-redux';
import {socket} from 'context/socket';
import moment from 'moment';
import $ from 'jquery'; 
import TextField from '@material-ui/core/TextField';
import { useTranslation } from 'react-i18next';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState } from 'draft-js';
import '../../../../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { useForm, useController } from "react-hook-form";


const useStyles = makeStyles(theme => ({
    editor:{
        border:'solid 1px #ccc',
        padding: "0 12px",
    },
	textareaForward:{
		height: '143px',
        width: '100%',
        border: 'solid 1px #ccc',
        padding: '6px',
	},
    textarea:{
        bottom: '0px',
        padding: '6px',
        width: '-webkit-fill-available',
        border: 'none',
        resize: 'none',
        '&:focus-visible':{
            border: 'none',
            outline: 'none!important'
        }
	},
}))


function TextInput(props){
    const dispatch = useDispatch();
    const state = useSelector(({ chatApp }) => chatApp);
    const chat = useSelector(({ chatApp }) => chatApp.chat);
    const connectedUser = useSelector(({ user }) => user.user);
    const classes = useStyles(props);
    const [query, setQuery] = useState("");
    const [displayMessage, setDisplayMessage] = useState("");
    const [typingStartedApiCalled, setTypingStartedApiCalled]  = useState(false);
    const [displayEditor, setDisplayEditor] = useState(false);
    const editorRef = useRef(null);
    const { t } = useTranslation('chat');

    const { handleSubmit, control } = useForm();
    const { field } = useController({
        name: "editorField",
        control,
        defaultValue: EditorState.createEmpty()
    });

    useEffect(() => {
        editorRef && editorRef.current && editorRef.current.focusEditor();
    }, [editorRef]);

    const onSubmit = handleSubmit((data) => {
        console.log(data);
      });

    useEffect(() => {
        let _formValues = {}

        if (props.parent === "Chat"){
            _formValues.chatId = chat.chatwith.chatId;
            _formValues.userId = connectedUser.id;
            _formValues.isTyping = query !== '' ? true : false;
            query !== '' ? startTyping(_formValues) : doneTyping (_formValues)
        }   

        const timeOutId = setTimeout(() => setDisplayMessage(query), 50);
        return () => clearTimeout(timeOutId);
        
      }, [query]);

    useEffect(() => {
        dispatch(Actions.forwardedMessageOpt(displayMessage))
    },[displayMessage])
    
    const startTyping = (_formValue) => {
        if (!typingStartedApiCalled) {
            socket.emit("typing_started", _formValue)
            setTypingStartedApiCalled(true)
        }
    } 

    const doneTyping = (_formValue) => {
        if (typingStartedApiCalled) {
          socket.emit("typing_stoped", _formValue)
          setTypingStartedApiCalled(false)
        }
    }

    const sendingMessage = async () => {
        console.log("state", state)
		if (displayMessage === '') {
			return;
		}

        const BROWSE_TAB_IDENTITY = moment(new Date()).format('YYYYMMDHHmmssSSS');
        let _msgData = {
            senderId: connectedUser.id,
            chatId: chat.chatwith.chatId,
            msgContent: displayMessage,
            msgAsText: displayMessage.replace(/<[^>]*>?/gm, ''),
            msgInlineStyleContent: displayMessage,
            msgType: "Text",
            msgToken: BROWSE_TAB_IDENTITY,
        }

        if (state.actions.reply) { 
            _msgData.repliedMessage =  state.actions.messageId;
            socket.emit('send_chat_message', _msgData)
        }
        if (!state.actions.reply) {
            socket.emit('send_chat_message', _msgData)
        }

        addSendMsgToContainer(_msgData)
        scrollToLastMessage(_msgData.msgToken)
        setQuery('');
        setDisplayMessage('');
        setDisplayEditor(false);
        dispatch(Actions.closeReply())
    }

    const addSendMsgToContainer = async (_msgData) => {
        console.log("Msgdata", _msgData)
        $('.typingNotification').before('<div id="message-'+ _msgData.msgToken +'" class="makeStyles-messageRow flex flex-col flex-grow-0 flex-shrink-0 items-start justify-end relative px-16 pb-4 messageRow me">'+
            '<div class="bubble flex relative items-center justify-center p-12 max-w-full">'+
                '<div class="MuiGrid-root MuiGrid-container MuiGrid-spacing-xs-3">'+
                    '<div class="MuiGrid-root MuiGrid-item MuiGrid-grid-xs-12">'+
                        '<div>'+
                            '<div class="makeStyles-wordBreak-485"><p>'+ _msgData.msgAsText +'</p></div>'+
                        '</div>'+
                    '</div>'+
                '</div>'+
                '<div class="makeStyles-moreOptionsMe-487"></div>'+
                '<div class="makeStyles-displayedChkboxSelection-500"></div>'+
                '<p class="MuiTypography-root time absolute  w-full text-11 mt-8 -mb-24 /*ltr:left-0 rtl:right-0 bottom-0*/ whitespace-no-wrap MuiTypography-body1 MuiTypography-colorTextSecondary">'+ moment().local().format('HH:mm') +'</p>'+
            '</div>'+
            '<div class="makeStyles-notifMessageSent-479">'+
                
            '</div>'+
        '</div>')
    }

    function scrollToLastMessage(lastMessageID){
		//test until the element for the last message is created, then scroll into it
		var checkExist = setInterval(function() {
			if ($('#message-'+lastMessageID).length) {
			   document.getElementById('message-'+lastMessageID).scrollIntoView()
			   window.scrollBy(0, -20); //useful to display avatar when message is seen
			   clearInterval(checkExist);
			}
		 }, 100); // check every 100ms
	}

    function handleReturn(e){
        e.preventDefault()
        e.stopPropagation()
        console.log("handleReturn? = ",e)
        
    }

    function handleKeyCommand(command) {
        
        if (command === 'split-block') {
            console.log("enter has been pressed")
            //sendingMessage(e)
        }
        if (command === 'delete-me') {
          // Do what you want to here, then tell Draft that we've taken care of this command
          return 'handled'
        }
      
        // This wasn't the 'delete-me' command, so we want Draft to handle it instead. 
        // We do this by telling Draft we haven't handled it. 
        return 'not-handled'
      }
  

    return(
        <>
            {props.parent === "ModalForward" &&
                <TextareaAutosize
                    className={classes.textareaForward}
                    minRows={3}
                    maxRows={6}
                    defaultValue={displayMessage}
                    autoFocus 
                    onChange={event => setQuery(event.target.value)}
                />}

            {props.parent === "Chat" && 
                <Editor
                    toolbarHidden
                    ref={editorRef}
                    editorState={field.value}
                    toolbarClassName="toolbarClassName"
                    wrapperClassName="wrapperClassName"
                    editorClassName={classes.editor}
                    onEditorStateChange={field.onChange}
                    onBlur={field.onBlur}
                    //editorStyle={{ }}
                    placeholder={t('message') + ' ' + chat.chatwith.name}
                    autoFocus
                    //handleKeyCommand={(e) => handleKeyCommand(e)} 
                    handleReturn={(e) => handleReturn(e)}
                />
               /* <TextField
                    id="standard-multiline-flexible"
                    label=""
                    multiline
                    maxRows={4}
                    autoFocus
                    value={query}
                    onChange={event => setQuery(event.target.value)}
                    onKeyPress={e => {
                        if (e.key === 'Enter') {
                            sendingMessage(e)
                        }
                    }}  
                />*/

               /* <TextareaAutosize
                    className={classes.textarea}
                    minRows={3}
                    maxRows={6}
                    defaultValue={displayMessage}
                    value={query}
                    autoFocus 
                    onChange={event => setQuery(event.target.value)}
                    onKeyPress={event => {
                        if (event.key === 'Enter') {
                            handleSendingMessage()
                        }
                    }}
                /> */
            }

            {props.parent === "ChatExpanded" && 
                <TextareaAutosize
                    className={classes.textareaExpanded}
                    minRows={20}
                    maxRows={50}
                    defaultValue={displayMessage}
                    autoFocus
                    onChange={event => setQuery(event.target.value)}
                />}
        </>
    )
}

export default TextInput