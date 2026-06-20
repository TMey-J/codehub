from fastapi import APIRouter, Depends, Request, HTTPException
from src.api.dependencies import get_pipeline
from src.application.retrieval_pipeline import RetrievalPipeline
from src.domain.entities import Query, Answer
from src.config import settings
from slowapi import Limiter, util
from slowapi.util import get_remote_address

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.post("/query")
@limiter.limit(settings.rate_limit)
async def query_endpoint(
    request: Request,
    query_data: Query,
    pipeline: RetrievalPipeline = Depends(get_pipeline),
):
    # Add user groups from JWT (set by middleware)
    user_groups = getattr(request.state, "user_groups", [])
    query_data.filters["allowed_groups"] = user_groups  # simplified
    answer = await pipeline.execute(query_data.text, query_data.filters)
    return answer
