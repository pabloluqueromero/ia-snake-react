# 🐍 Snake DQN Agent Training Pipeline

This directory contains the reinforcement learning training environment and Deep Q-Network (DQN) trainer for the Snake game.

---

## 📋 Overview

The AI agent uses a **Deep Q-Network (DQN)** with:
- **16-Dimensional Spatial State Vector**:
  1. `danger_straight`, `danger_right`, `danger_left` (1-step collision sensors)
  2. `danger2_straight`, `danger2_right`, `danger2_left` (2-step lookahead sensors)
  3. `dir_up`, `dir_right`, `dir_down`, `dir_left` (Current heading one-hot)
  4. `food_up`, `food_right`, `food_down`, `food_left` (Food relative direction)
  5. `dist_norm` (Normalized Manhattan distance to the apple)
  6. `open_space_ratio` (Free space safety score ahead)
- **3 Relative Actions**:
  - `0`: Continue Straight
  - `1`: Turn Right
  - `2`: Turn Left
- **Neural Network Architecture**:
  - `Input (16) -> Dense (64, ReLU) -> Dense (64, ReLU) -> Linear (3 Q-Values)`
- **Training Strategy**:
  - Deep Q-Learning with Experience Replay Buffer ($N = 20,000$).
  - Target Q-Network synchronization.
  - $\epsilon$-Greedy exploration with scheduled decay.
  - Expert Demonstration Guidance (imitation-assisted bootstrapping for fast convergence).

---

## 🚀 Quickstart: How to Train

### 1. Install Dependencies
```bash
cd ai-trainer
pip install -r requirements.txt
```

### 2. Run Training

#### Option A: Fast Trainer (NumPy-accelerated, zero setup)
Trains the DQN policy and exports the weights directly into the React app in seconds:
```bash
python3 generate_weights.py
```

#### Option B: Full TensorFlow / Keras Trainer
Trains using `tf.keras.Sequential` with customizable batch sizes and epochs:
```bash
python3 train_dqn_tf.py
```

---

## 📦 Weight Export

When training finishes, the weights are automatically saved to:
```
snake-app/src/game/ai/dqn_weights.json
```

The React frontend immediately hot-reloads and uses the newly trained weights during inference!

---

## ⚙️ Hyperparameters & Configuration

You can customize training in `train_dqn_tf.py` or `generate_weights.py`:

| Parameter | Default | Description |
| :--- | :--- | :--- |
| `episodes` | `400` | Total game episodes to train |
| `batch_size` | `64` | Mini-batch sample size from replay memory |
| `gamma` ($\gamma$) | `0.95` | Future reward discount factor |
| `lr` | `0.002` | Learning rate for the Adam optimizer |
| `epsilon_decay` | `0.99` | Exploration rate decay multiplier per episode |
| `grid_size` | `21` | Grid size (matches the React 21x21 board) |

---

## 🎮 Testing in the Game

1. In the React application, select **DQN AI** under the **Algorithm** section.
2. Press **<kbd>ENTER</kbd>** or **<kbd>Space</kbd>** to start playing.
3. Observe live **Q-Values**, **Danger Radars**, and **Apple Distance** in the Telemetry HUD.
