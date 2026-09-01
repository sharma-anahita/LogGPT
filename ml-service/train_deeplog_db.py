# ml-service/train_deeplog_db.py
import os
import argparse
import psycopg2
from dotenv import load_dotenv
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset

from app.utils.log_parser import LogTemplateParser
from app.models.deeplog import DeepLogLSTM

load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL")
POSTGRES_HOST = os.environ.get("POSTGRES_HOST")
POSTGRES_PORT = int(os.environ.get("POSTGRES_PORT", 5432))
POSTGRES_DB = os.environ.get("POSTGRES_DB", "loggpt")
POSTGRES_USER = os.environ.get("POSTGRES_USER", "postgres")
POSTGRES_PASSWORD = os.environ.get("POSTGRES_PASSWORD", "")
POSTGRES_SSL = os.environ.get("POSTGRES_SSL", "false").lower() == "true"

def get_db_conn():
    if DATABASE_URL:
        return psycopg2.connect(DATABASE_URL, sslmode="require")
    return psycopg2.connect(
        host=POSTGRES_HOST,
        port=POSTGRES_PORT,
        dbname=POSTGRES_DB,
        user=POSTGRES_USER,
        password=POSTGRES_PASSWORD,
        sslmode="require" if POSTGRES_SSL else "prefer",
    )

def fetch_logs(session_id=None):
    """
    Fetch normal logs (excluding ERROR levels) from PostgreSQL database.
    If session_id is provided, limit to that session.
    """
    conn = get_db_conn()
    cur = conn.cursor()
    
    query = "SELECT message FROM logs WHERE level != 'error' AND level != 'fatal'"
    params = []
    
    if session_id:
        query += " AND session_id = %s"
        params.append(session_id)
        
    query += " ORDER BY timestamp ASC"
    
    print(f"Fetching logs from DB... Query: {query} with params {params}")
    cur.execute(query, tuple(params))
    rows = cur.fetchall()
    
    logs = [row[0] for row in rows]
    cur.close()
    conn.close()
    
    print(f"Successfully fetched {len(logs)} log messages from the database.")
    return logs

def prepare_dataset(log_messages, parser, window_size=10):
    template_ids = [parser.parse_message(msg) for msg in log_messages]
    
    inputs = []
    targets = []
    for i in range(len(template_ids) - window_size):
        inputs.append(template_ids[i:i + window_size])
        targets.append(template_ids[i + window_size])
        
    return torch.tensor(inputs, dtype=torch.long), torch.tensor(targets, dtype=torch.long)

def main():
    parser = argparse.ArgumentParser(description="Train DeepLog LSTM using database logs.")
    parser.add_argument("--session_id", type=int, help="Session ID to pull training logs from.")
    parser.add_argument("--epochs", type=int, default=10, help="Number of training epochs.")
    parser.add_argument("--batch_size", type=int, default=64, help="Batch size for training.")
    parser.add_argument("--window_size", type=int, default=10, help="Sliding window size.")
    args = parser.parse_args()
    
    # 1. Fetch training logs
    try:
        normal_logs = fetch_logs(session_id=args.session_id)
    except Exception as e:
        print(f"Error fetching logs from database: {e}")
        print("Please check your database environment variables or ensure PostgreSQL is running.")
        return
        
    if len(normal_logs) < args.window_size + 1:
        print(f"Not enough log samples for training. Need at least {args.window_size + 1} logs.")
        return

    # 2. Extract templates and build PyTorch datasets
    log_parser = LogTemplateParser(persistence_path="d:/LogGPT/model/drain_state.bin")
    X, y = prepare_dataset(normal_logs, log_parser, args.window_size)
    dataset = TensorDataset(X, y)
    dataloader = DataLoader(dataset, batch_size=args.batch_size, shuffle=True)

    vocab_size = log_parser.vocab_size
    print(f"Dataset Vocab Size: {vocab_size}, Samples: {len(X)}")

    # 3. Initialize model and optimization
    model = DeepLogLSTM(vocab_size=vocab_size)
    criterion = nn.CrossEntropyLoss(ignore_index=0)
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    # 4. Training loop
    model.train()
    for epoch in range(args.epochs):
        epoch_loss = 0.0
        for batch_x, batch_y in dataloader:
            optimizer.zero_grad()
            outputs = model(batch_x)
            loss = criterion(outputs, batch_y)
            loss.backward()
            optimizer.step()
            epoch_loss += loss.item()
        print(f"Epoch {epoch+1}/{args.epochs} - Loss: {epoch_loss / len(dataloader):.4f}")

    # 5. Save the trained artifacts
    os.makedirs("d:/LogGPT/model", exist_ok=True)
    torch.save({
        'model_state_dict': model.state_dict(),
        'vocab_size': vocab_size,
        'window_size': args.window_size
    }, "d:/LogGPT/model/deeplog_model.pth")
    print("DeepLog Model and Parser State successfully saved to d:/LogGPT/model/")

if __name__ == "__main__":
    main()
