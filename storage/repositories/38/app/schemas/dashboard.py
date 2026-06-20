from pydantic import BaseModel


class DashboardStatisticsResponse(BaseModel):

    repositories: int

    files: int

    users: int

    stars: int

    vulnerability_requests: int

    optimization_requests: int

    readme_requests: int

    repository_search_requests: int

class DashboardUserStatisticsResponse(BaseModel):

    repositories: int

    files: int

    stars: int

    vulnerability_requests: int

    optimization_requests: int

    readme_requests: int

    repository_search_requests: int