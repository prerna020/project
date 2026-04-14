from langchain_huggingface import ChatHuggingFace, HuggingFaceEndpoint
from langchain.agents import create_react_agent, AgentExecutor
from langchain_core.prompts import ChatPromptTemplate, PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv
from tools import web_search, scrape_url 

load_dotenv()

llm = HuggingFaceEndpoint(
    repo_id="deepseek-ai/DeepSeek-R1",
    task="text-generation",
    max_new_tokens=512
)

model = ChatHuggingFace(llm=llm)

react_template = '''Answer the following questions as best you can. You have access to the following tools:

{tools}

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question: {input}
Thought:{agent_scratchpad}'''

react_prompt = PromptTemplate.from_template(react_template)

# 1st agent

def build_search_agent():
    tools = [web_search]
    agent = create_react_agent(
        llm = model,
        tools = tools,
        prompt = react_prompt
    )
    return AgentExecutor(agent=agent, tools=tools, verbose=True, handle_parsing_errors=True)

# 2nd agent

def build_reader_agent():
    tools = [scrape_url]
    agent = create_react_agent(
        llm = model,
        tools = tools,
        prompt = react_prompt
    )
    return AgentExecutor(agent=agent, tools=tools, verbose=True, handle_parsing_errors=True)

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are an expert research writer. Write clear, structured and insightful reports."),
    ("human", """Write a detailed research report on the topic below.

Topic: {topic}

Research Gathered:
{research}

Structure the report as:
- Introduction
- Key Findings (minimum 3 well-explained points)
- Conclusion
- Sources (list all URLs found in the research)

Be detailed, factual and professional."""),
])

parser = StrOutputParser()
writer_chain = prompt | llm | parser

critic_prompt = ChatPromptTemplate.from_messages([
     ("system", "You are a sharp and constructive research critic. Be honest and specific."),
    ("human", """Review the research report below and evaluate it strictly.

Report:
{report}

Respond in this exact format:

Score: X/10

Strengths:
- ...
- ...

Areas to Improve:
- ...
- ...

One line verdict:
..."""),
])

critic_chain = critic_prompt | llm | parser