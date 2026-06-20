from langgraph.graph import StateGraph, END
from typing import TypedDict, List
from src.domain.entities import Document
from src.application.retrieval_pipeline import RetrievalPipeline

class AgentState(TypedDict):
    query: str
    documents: List[Document]
    answer: str
    grade: float
    iterations: int

def build_supervisor(pipeline: RetrievalPipeline):
    graph = StateGraph(AgentState)

    async def retrieve(state):
        # Use pipeline's retrieval method (without generation)
        docs = await pipeline._retrieve(state["query"])
        return {"documents": docs}

    async def grade(state):
        grade = await pipeline.grader.grade(state["query"], state["documents"])
        return {"grade": grade.score, "iterations": state.get("iterations", 0) + 1}

    async def rewrite(state):
        new_query = await pipeline.rewriter.rewrite(state["query"], f"Previous grade: {state['grade']}")
        return {"query": new_query}

    async def generate(state):
        answer = await pipeline._generate(state["query"], state["documents"])
        return {"answer": answer}

    graph.add_node("retrieve", retrieve)
    graph.add_node("grade", grade)
    graph.add_node("rewrite", rewrite)
    graph.add_node("generate", generate)

    graph.set_entry_point("retrieve")
    graph.add_edge("retrieve", "grade")
    graph.add_conditional_edges(
        "grade",
        lambda state: "rewrite" if state["grade"] < 0.7 and state["iterations"] < 2 else "generate",
        {"rewrite": "retrieve", "generate": END}
    )
    graph.add_edge("rewrite", "retrieve")
    graph.add_edge("generate", END)

    return graph.compile()
