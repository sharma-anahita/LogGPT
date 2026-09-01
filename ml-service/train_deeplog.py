# ml-service/train_deeplog.py
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
from app.utils.log_parser import LogTemplateParser
from app.models.deeplog import DeepLogLSTM

def prepare_dataset(log_messages, parser, window_size=10):
    # Parse all raw logs to template IDs
    template_ids = [parser.parse_message(msg) for msg in log_messages]
    
    # Create sliding windows
    inputs = []
    targets = []
    for i in range(len(template_ids) - window_size):
        inputs.append(template_ids[i:i + window_size])
        targets.append(template_ids[i + window_size])
        
    return torch.tensor(inputs, dtype=torch.long), torch.tensor(targets, dtype=torch.long)

def train_deeplog(normal_logs, epochs=10, batch_size=64, window_size=10):
    import os
    os.makedirs("d:/LogGPT/model", exist_ok=True)
    parser = LogTemplateParser(persistence_path="d:/LogGPT/model/drain_state.bin")
    
    print("Parsing logs and preparing datasets...")
    X, y = prepare_dataset(normal_logs, parser, window_size)
    dataset = TensorDataset(X, y)
    dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True)
    
    vocab_size = parser.vocab_size
    print(f"Dataset generated. Vocabulary size: {vocab_size}, Samples: {len(X)}")
    
    model = DeepLogLSTM(vocab_size=vocab_size)
    criterion = nn.CrossEntropyLoss(ignore_index=0)
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    
    model.train()
    for epoch in range(epochs):
        epoch_loss = 0.0
        for batch_x, batch_y in dataloader:
            optimizer.zero_grad()
            outputs = model(batch_x)
            loss = criterion(outputs, batch_y)
            loss.backward()
            optimizer.step()
            epoch_loss += loss.item()
            
        print(f"Epoch {epoch+1}/{epochs} - Loss: {epoch_loss / len(dataloader):.4f}")
        
    # Save the model weights
    torch.save({
        'model_state_dict': model.state_dict(),
        'vocab_size': vocab_size,
        'window_size': window_size
    }, "d:/LogGPT/model/deeplog_model.pth")
    print("Model and parser state saved successfully in d:/LogGPT/model/")

if __name__ == "__main__":
    import os
    import csv
    
    csv_path = "d:/LogGPT/ml-service/HDFS_2k.log_structured.csv"
    if os.path.exists(csv_path):
        print(f"Found HDFS 2k structured dataset at {csv_path}. Loading logs...")
        with open(csv_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            normal_logs = [row["Content"] for row in reader if row.get("Content")]
        print(f"Loaded {len(normal_logs)} log lines from CSV.")
    else:
        print(f"CSV dataset not found at {csv_path}. Falling back to mock logs.")
        # Dummy mock normal logs for demonstration
        normal_logs = [
            "User admin logged in successfully",
            "Connection established to DB",
            "Query executed SELECT * FROM users",
            "Transaction committed",
            "Connection closed"
        ] * 200  # Expand to simulate log flow
        
    train_deeplog(normal_logs, epochs=15)