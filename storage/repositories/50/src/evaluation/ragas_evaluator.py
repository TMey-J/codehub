from datasets import Dataset
from ragas import evaluate
from ragas.metrics import faithfulness, answer_relevancy, context_relevancy
import pandas as pd

def run_ragas_eval(question: str, answer: str, contexts: list, ground_truth: str = None):
    data = {
        "question": [question],
        "answer": [answer],
        "contexts": [contexts],
        "ground_truth": [ground_truth] if ground_truth else [None],
    }
    dataset = Dataset.from_pandas(pd.DataFrame(data))
    result = evaluate(dataset, metrics=[faithfulness, answer_relevancy, context_relevancy])
    return result
