from neo4j import AsyncGraphDatabase
from src.domain.ports import GraphStorePort
from src.domain.entities import Document
from src.config import settings
from typing import List, Dict, Any

class Neo4jAdapter(GraphStorePort):
    def __init__(self):
        self.driver = AsyncGraphDatabase.driver(
            settings.neo4j_uri,
            auth=(settings.neo4j_user, settings.neo4j_password)
        )

    async def traverse(self, entities: List[str], depth: int = 2) -> List[Document]:
        async with self.driver.session() as session:
            query = f"""
            MATCH (e:Entity)-[:RELATES_TO]->(d:Document)
            WHERE e.name IN $entities
            RETURN d.id AS id, d.content AS content, d.metadata AS metadata
            LIMIT 50
            """
            result = await session.run(query, entities=entities)
            records = await result.data()
            return [
                Document(
                    id=rec["id"],
                    content=rec["content"],
                    metadata=rec.get("metadata", {}),
                    score=1.0,
                )
                for rec in records
            ]

    async def upsert_entity(self, entity_name: str, entity_type: str, metadata: Dict[str, Any]) -> None:
        async with self.driver.session() as session:
            await session.run(
                "MERGE (e:Entity {name: $name}) SET e.type = $type, e.metadata = $metadata",
                name=entity_name, type=entity_type, metadata=metadata
            )

    async def link_entity_to_document(self, entity_name: str, doc_id: str) -> None:
        async with self.driver.session() as session:
            await session.run(
                "MATCH (e:Entity {name: $entity}), (d:Document {id: $doc_id}) "
                "MERGE (e)-[:RELATES_TO]->(d)",
                entity=entity_name, doc_id=doc_id
            )
