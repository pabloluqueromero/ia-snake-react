import os
import json
import random
from collections import deque
import numpy as np

try:
    import tensorflow as tf
    from tensorflow import keras
    from tensorflow.keras import layers
    TF_AVAILABLE = True
except ImportError:
    TF_AVAILABLE = False

from snake_env import SnakeEnv

class DQNAgentTF:
    def __init__(self, state_dim=12, action_dim=3, gamma=0.95, lr=0.001):
        self.state_dim = state_dim
        self.action_dim = action_dim
        self.gamma = gamma
        self.lr = lr
        self.epsilon = 1.0
        self.epsilon_min = 0.01
        self.epsilon_decay = 0.995
        self.batch_size = 64
        self.memory = deque(maxlen=20000)

        if TF_AVAILABLE:
            self.model = self._build_model()
            self.target_model = self._build_model()
            self.update_target_model()
        else:
            self.model = None

    def _build_model(self):
        model = keras.Sequential([
            layers.Input(shape=(self.state_dim,)),
            layers.Dense(64, activation='relu'),
            layers.Dense(64, activation='relu'),
            layers.Dense(self.action_dim, activation='linear')
        ])
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=self.lr),
            loss='huber'
        )
        return model

    def update_target_model(self):
        if TF_AVAILABLE:
            self.target_model.set_weights(self.model.get_weights())

    def remember(self, state, action, reward, next_state, done):
        self.memory.append((state, action, reward, next_state, done))

    def act(self, state, evaluate=False):
        if not evaluate and random.random() < self.epsilon:
            return random.randrange(self.action_dim)
        if TF_AVAILABLE:
            q_values = self.model.predict(state.reshape(1, -1), verbose=0)[0]
            return int(np.argmax(q_values))
        return 0

    def replay(self):
        if not TF_AVAILABLE or len(self.memory) < self.batch_size:
            return 0.0

        minibatch = random.sample(self.memory, self.batch_size)
        states = np.array([m[0] for m in minibatch])
        actions = np.array([m[1] for m in minibatch])
        rewards = np.array([m[2] for m in minibatch])
        next_states = np.array([m[3] for m in minibatch])
        dones = np.array([m[4] for m in minibatch])

        targets = self.model.predict(states, verbose=0)
        target_next = self.target_model.predict(next_states, verbose=0)

        for i in range(self.batch_size):
            if dones[i]:
                targets[i][actions[i]] = rewards[i]
            else:
                targets[i][actions[i]] = rewards[i] + self.gamma * np.max(target_next[i])

        history = self.model.fit(states, targets, epochs=1, verbose=0, batch_size=self.batch_size)
        
        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.epsilon_decay

        return history.history['loss'][0]

    def export_weights_json(self, output_path: str, stats=None):
        if not TF_AVAILABLE:
            print("TensorFlow not installed, cannot export weights.")
            return

        weights = self.model.get_weights()
        export_dict = {
            "version": "1.0",
            "framework": "tensorflow-keras",
            "architecture": [self.state_dim, 64, 64, self.action_dim],
            "stats": stats or {},
            "weights": {
                "w1": weights[0].tolist(),
                "b1": weights[1].tolist(),
                "w2": weights[2].tolist(),
                "b2": weights[3].tolist(),
                "w3": weights[4].tolist(),
                "b3": weights[5].tolist()
            }
        }

        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        with open(output_path, 'w') as f:
            json.dump(export_dict, f)
        print(f"Weights successfully exported to: {output_path}")


def train(episodes=300, grid_size=21, target_export_path="../snake-app/src/game/ai/dqn_weights.json"):
    if not TF_AVAILABLE:
        print("TensorFlow is required for training. Please run: pip install -r requirements.txt")
        return

    env = SnakeEnv(rows=grid_size, cols=grid_size)
    agent = DQNAgentTF(state_dim=12, action_dim=3)

    high_score = 0
    scores_history = []
    print(f"Starting TensorFlow DQN Training for {episodes} episodes on {grid_size}x{grid_size} grid...")

    for ep in range(1, episodes + 1):
        state = env.reset()
        total_reward = 0
        done = False
        steps = 0

        while not done:
            action = agent.act(state)
            next_state, reward, done, info = env.step(action)
            agent.remember(state, action, reward, next_state, done)
            state = next_state
            total_reward += reward
            steps += 1

            if len(agent.memory) >= agent.batch_size:
                agent.replay()

        if ep % 5 == 0:
            agent.update_target_model()

        score = info['score']
        scores_history.append(score)
        if score > high_score:
            high_score = score

        if ep % 10 == 0:
            avg_score = np.mean(scores_history[-10:])
            print(f"Episode {ep:4d}/{episodes} | Score: {score:2d} | Avg(10): {avg_score:.2f} | High: {high_score:2d} | Eps: {agent.epsilon:.3f} | Steps: {steps}")

    stats = {
        "episodes": episodes,
        "high_score": high_score,
        "final_avg_score": float(np.mean(scores_history[-20:])),
        "grid_size": grid_size
    }
    agent.export_weights_json(target_export_path, stats)

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    target_json = os.path.join(script_dir, "../snake-app/src/game/ai/dqn_weights.json")
    train(episodes=250, grid_size=21, target_export_path=target_json)
