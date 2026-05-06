from langgraph.graph import StateGraph, START, END
from typing import TypedDict, Annotated
from langchain_core.messages import BaseMessage, HumanMessage
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langgraph.graph.message import add_messages
from langgraph.checkpoint.sqlite import SqliteSaver
from langchain_core.runnables import RunnableConfig
from langchain_core.tools import tool
from langchain_community.tools import DuckDuckGoSearchRun
import sqlite3
import requests

load_dotenv()

llm = ChatGroq(model="llama-3.3-70b-versatile")

# tools
search_tool = DuckDuckGoSearchRun(region="us-en")

@tool
def calculator(first_num: float, second_num: float, operation: str) -> dict:
    """
    Perform a basic arithmetic operation on two numbers.
    Supported operations: add, sub, mul, div
    """
    try:
        if operation == "add":
            result = first_num + second_num
        elif operation == "sub":
            result = first_num - second_num
        elif operation == "mul":
            result = first_num * second_num
        elif operation == "div":
            if second_num == 0:
                return {"error": "Division by zero is not allowed"}
            result = first_num / second_num
        else:
            return {"error": f"Unsupported operation '{operation}'"}
        
        return {"first_num": first_num, "second_num": second_num, "operation": operation, "result": result}
    except Exception as e:
        return {"error": str(e)}


@tool
def get_stock_price(symbol: str) -> dict:
    """
    Fetch the current stock price for a given symbol using a public API.
    """
    try:
        api_url = f"https://finnhub.io/api/v1/quote?symbol={symbol}&token"
        response = requests.get(api_url)
        data = response.json()
        return {"symbol": symbol, "price": data.get("c")}
    except Exception as e:
        return {"error": str(e)}



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
