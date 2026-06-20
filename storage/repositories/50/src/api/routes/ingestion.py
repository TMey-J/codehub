from fastapi import APIRouter, Depends, UploadFile, File, BackgroundTasks
from src.application.indexing_service import IndexingService
from src.api.dependencies import get_vector_store, get_sparse_retriever, get_graph_store, get_embedder
from src.domain.ports import VectorStorePort, SparseRetrieverPort, GraphStorePort, EmbedderPort

router = APIRouter()

@router.post("/ingest")
async def ingest_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    vector_store: VectorStorePort = Depends(get_vector_store),
    sparse: SparseRetrieverPort = Depends(get_sparse_retriever),
    graph: GraphStorePort = Depends(get_graph_store),
    embedder: EmbedderPort = Depends(get_embedder),
):
    content = await file.read()
    text = content.decode("utf-8")
    service = IndexingService(vector_store, sparse, graph, embedder)
    background_tasks.add_task(service.index_document, text, {"filename": file.filename})
    return {"status": "indexing started"}
