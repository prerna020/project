from langgraph.graph import StateGraph, START, END
from typing import TypedDict, Annotated
from langchain_core.messages import BaseMessage, HumanMessage
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langgraph.graph.message import add_messages
from langgraph.checkpoint.sqlite import SqliteSaver
from langchain_core.runnables import RunnableConfig
import sqlite3

load_dotenv()

llm = ChatGroq(model="llama-3.3-70b-versatile")


class ChatState(TypedDict): 
    messages: Annotated[list[BaseMessage], add_messages]



def chat_node(state: ChatState, config: RunnableConfig):

    messages = state['messages']
    response = llm.invoke(messages, config=config)

    return {'messages': [response]}

connection = sqlite3.connect(database="chatbot.db", check_same_thread=False)
checkpointer = SqliteSaver(conn=connection)

graph = StateGraph(ChatState)

graph.add_node('chat_node', chat_node)
graph.add_edge(START, 'chat_node')
graph.add_edge('chat_node', END)

chatbot = graph.compile(checkpointer= checkpointer)

CONFIG = {
    'configurable':{'thread_id': 'thread-1'}
}

# res = chatbot.invoke({'messages': [HumanMessage(content="Hello, how are you?")]}, config=CONFIG)
# print(res)

def retrieveThread():
    allThread = set()
    for checkpoint in checkpointer.list(None):
        threadID = checkpoint.config['configurable']['thread_id']
        allThread.add(threadID)
    
    return allThread
