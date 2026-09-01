# ml-service/app/models/deeplog.py
import torch
import torch.nn as nn

class DeepLogLSTM(nn.Module):
    def __init__(self, vocab_size, embed_dim=64, hidden_size=64, num_layers=2):
        super(DeepLogLSTM, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=0)
        self.lstm = nn.LSTM(embed_dim, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, vocab_size)

    def forward(self, x):
        # x shape: [batch_size, sequence_length]
        embedded = self.embedding(x)  # shape: [batch_size, sequence_length, embed_dim]
        out, _ = self.lstm(embedded)   # out shape: [batch_size, sequence_length, hidden_size]
        # Predict the next log template using the hidden state of the last sequence step
        logits = self.fc(out[:, -1, :])  # shape: [batch_size, vocab_size]
        return logits