import streamlit as st
from chat import chatbot, retrieveThread
from langchain_core.messages import HumanMessage, AIMessage
import uuid

# config = {
#     'configurable': {
#         'thread_id': 'thread-1'
#     }
# }

def generate_thread_id():
    thread_id = uuid.uuid4()
    return thread_id

def reset_chat():
    thread_id = generate_thread_id()
    st.session_state['thread_id'] = thread_id
    addThread(st.session_state['thread_id'])
    st.session_state['msgHistory'] = []

def addThread(thread_id):
    if thread_id not in st.session_state['chat_threads']:
        st.session_state['chat_threads'].append(thread_id)

def loadConversation(thread_id):
    state = chatbot.get_state(config={'configurable': {'thread_id': thread_id}})
    # Check if messages key exists in state values, return empty list if not
    return state.values.get('messages', [])


if 'msgHistory' not in st.session_state:
    st.session_state['msgHistory'] = []

if 'thread_id' not in st.session_state:
    st.session_state['thread_id'] = generate_thread_id()

if 'chat_threads' not in st.session_state:
    st.session_state['chat_threads'] = list(retrieveThread())

addThread(st.session_state['thread_id'])




st.sidebar.title('Chatbot')
if st.sidebar.button('New Chat'):
    reset_chat()
st.sidebar.header('Recents')
 

for thread_id in st.session_state['chat_threads'][::-1]:
    if st.sidebar.button(str(thread_id)):
        st.session_state['thread_id'] = thread_id
        messages = loadConversation(thread_id)

        temp_messages = []

        for msg in messages:
            if isinstance(msg, HumanMessage):
                role='user'
            else:
                role='assistant'
            temp_messages.append({'role': role, 'content': msg.content})

        st.session_state['msgHistory'] = temp_messages



# loading the conversation history
for message in st.session_state['msgHistory']:
    with st.chat_message(message['role']):
        st.text(message['content'])

#{'role': 'user', 'content': 'Hi'}
#{'role': 'assistant', 'content': 'Hi=ello'}

user_input = st.chat_input('Ask anything...')


if user_input:

    # first add the message to msgHistory
    st.session_state['msgHistory'].append({'role': 'user', 'content': user_input})
    with st.chat_message('user'):
        st.text(user_input)

    CONFIG = {
        "configurable": {"thread_id": st.session_state["thread_id"]},
        "metadata": {
            "thread_id": st.session_state["thread_id"]
        },
        "run_name": "chat_turn",
    }

    # first add the message to msgHistory
    with st.chat_message('assistant'):
        def ai_only_stream():
            for message_chunk, metadata in chatbot.stream(
                {'messages': [HumanMessage(content=user_input)]},
                config=CONFIG,
                stream_mode= 'messages'
            ):
              if isinstance(message_chunk, AIMessage) and message_chunk.content: 
                yield message_chunk.content

        aiMsg = st.write_stream(ai_only_stream())

    st.session_state['msgHistory'].append({'role': 'assistant', 'content': aiMsg})