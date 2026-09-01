# ml-service/app/utils/log_parser.py
import os
from drain3 import TemplateMiner
from drain3.template_miner_config import TemplateMinerConfig
from drain3.file_persistence import FilePersistence

class LogTemplateParser:
    def __init__(self, config_path=None, persistence_path="drain_state.bin"):
        self.persistence_path = persistence_path
        
        # Ensure parent directory exists for persistence path
        dir_name = os.path.dirname(persistence_path)
        if dir_name:
            os.makedirs(dir_name, exist_ok=True)
            
        config = TemplateMinerConfig()
        persistence = FilePersistence(self.persistence_path)
        self.miner = TemplateMiner(persistence_handler=persistence, config=config)
    def parse_message(self, message: str, update_templates=True) -> int:
        """
        Parses a raw log message, updates templates, and returns the unique Template ID.
        """
        if update_templates:
            result = self.miner.add_log_message(message)
            # Persist parsing state using the persistence handler configured on init
            self.miner.save_state("update")
            template_id = result.get("cluster_id")
        else:
            cluster = self.miner.match(message)
            template_id = cluster.cluster_id if cluster is not None else 0
            
        return template_id if template_id is not None else 0  # 0 represents unknown/padding

    @property
    def vocab_size(self):
        return len(self.miner.drain.clusters) + 1  # Add 1 for the fallback/padding token (0)