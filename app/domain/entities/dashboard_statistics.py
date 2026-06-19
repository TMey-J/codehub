# app/domain/entities/dashboard_statistics.py

from dataclasses import dataclass


@dataclass
class DashboardStatistics:
    repositories: int
    files: int
    users: int
    stars: int

    vulnerability_requests: int
    optimization_requests: int
    readme_requests: int
    repository_search_requests: int

@dataclass
class DashboardUserStatistics:
    repositories: int
    files: int
    stars: int

    vulnerability_requests: int
    optimization_requests: int
    readme_requests: int
    repository_search_requests: int