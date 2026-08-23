import numpy as np
import json
import os
import random
from collections import deque

def train_and_export():
    np.random.seed(42)
    random.seed(42)

    state_dim = 12
    h1_dim = 64
    h2_dim = 64
    action_dim = 3

    # Kaiming / He normal initialization
    w1 = np.random.randn(state_dim, h1_dim) * np.sqrt(2.0 / state_dim)
    b1 = np.zeros(h1_dim)
    w2 = np.random.randn(h1_dim, h2_dim) * np.sqrt(2.0 / h1_dim)
    b2 = np.zeros(h2_dim)
    w3 = np.random.randn(h2_dim, action_dim) * np.sqrt(2.0 / h2_dim)
    b3 = np.zeros(action_dim)

    def relu(x):
        return np.maximum(0, x)

    def forward(s):
        h1 = relu(np.dot(s, w1) + b1)
        h2 = relu(np.dot(h1, w2) + b2)
        out = np.dot(h2, w3) + b3
        return out, h1, h2

    CLOCKWISE = [0, 1, 2, 3] # UP, RIGHT, DOWN, LEFT
    episodes = 200
    memory = deque(maxlen=15000)
    epsilon = 1.0
    gamma = 0.95
    lr = 0.003
    grid_size = 21

    print("Training DQN baseline...")
    for ep in range(episodes):
        head = [grid_size // 2, grid_size // 2]
        snake = [list(head)]
        direction = random.choice(CLOCKWISE)
        apple = [random.randint(2, grid_size - 3), random.randint(2, grid_size - 3)]
        done = False
        steps = 0
        
        while not done and steps < 400:
            steps += 1
            idx = direction
            dir_straight = CLOCKWISE[idx]
            dir_right = CLOCKWISE[(idx + 1) % 4]
            dir_left = CLOCKWISE[(idx - 1) % 4]
            
            def get_pt(pt, d):
                if d == 0: return [pt[0] - 1, pt[1]]
                if d == 1: return [pt[0], pt[1] + 1]
                if d == 2: return [pt[0] + 1, pt[1]]
                if d == 3: return [pt[0], pt[1] - 1]
                return pt
                
            def is_coll(pt):
                return pt[0] < 0 or pt[0] >= grid_size or pt[1] < 0 or pt[1] >= grid_size or pt in snake[:-1]
                
            d_s = 1.0 if is_coll(get_pt(head, dir_straight)) else 0.0
            d_r = 1.0 if is_coll(get_pt(head, dir_right)) else 0.0
            d_l = 1.0 if is_coll(get_pt(head, dir_left)) else 0.0
            
            state = np.array([
                d_s, d_r, d_l,
                1.0 if direction == 0 else 0.0,
                1.0 if direction == 1 else 0.0,
                1.0 if direction == 2 else 0.0,
                1.0 if direction == 3 else 0.0,
                1.0 if apple[0] < head[0] else 0.0,
                1.0 if apple[1] > head[1] else 0.0,
                1.0 if apple[0] > head[0] else 0.0,
                1.0 if apple[1] < head[1] else 0.0,
                (abs(apple[0] - head[0]) + abs(apple[1] - head[1])) / float(grid_size * 2)
            ], dtype=np.float32)
            
            q, _, _ = forward(state)
            
            if random.random() < epsilon:
                valid_actions = [a for a, danger in enumerate([d_s, d_r, d_l]) if danger == 0]
                action = random.choice(valid_actions) if valid_actions else random.randrange(3)
            else:
                action = int(np.argmax(q))
                
            if action == 1:
                direction = CLOCKWISE[(idx + 1) % 4]
            elif action == 2:
                direction = CLOCKWISE[(idx - 1) % 4]
                
            prev_dist = abs(apple[0] - head[0]) + abs(apple[1] - head[1])
            new_head = get_pt(head, direction)
            
            if is_coll(new_head):
                reward = -10.0
                done = True
                next_state = state
            else:
                head = new_head
                snake.insert(0, list(head))
                curr_dist = abs(apple[0] - head[0]) + abs(apple[1] - head[1])
                if head == apple:
                    reward = 10.0
                    apple = [random.randint(1, grid_size - 2), random.randint(1, grid_size - 2)]
                else:
                    snake.pop()
                    reward = 0.2 if curr_dist < prev_dist else -0.25
                    
                idx2 = direction
                next_s_danger = [
                    1.0 if is_coll(get_pt(head, CLOCKWISE[idx2])) else 0.0,
                    1.0 if is_coll(get_pt(head, CLOCKWISE[(idx2 + 1) % 4])) else 0.0,
                    1.0 if is_coll(get_pt(head, CLOCKWISE[(idx2 - 1) % 4])) else 0.0
                ]
                next_state = np.array([
                    next_s_danger[0], next_s_danger[1], next_s_danger[2],
                    1.0 if direction == 0 else 0.0,
                    1.0 if direction == 1 else 0.0,
                    1.0 if direction == 2 else 0.0,
                    1.0 if direction == 3 else 0.0,
                    1.0 if apple[0] < head[0] else 0.0,
                    1.0 if apple[1] > head[1] else 0.0,
                    1.0 if apple[0] > head[0] else 0.0,
                    1.0 if apple[1] < head[1] else 0.0,
                    (abs(apple[0] - head[0]) + abs(apple[1] - head[1])) / float(grid_size * 2)
                ], dtype=np.float32)
                
            memory.append((state, action, reward, next_state, done))
            
            if len(memory) >= 64:
                batch = random.sample(memory, 64)
                for b_state, b_action, b_reward, b_next_state, b_done in batch:
                    out, h1, h2 = forward(b_state)
                    next_out, _, _ = forward(b_next_state)
                    target = b_reward if b_done else b_reward + gamma * np.max(next_out)
                    
                    d_out = np.zeros(action_dim)
                    d_out[b_action] = (out[b_action] - target)
                    
                    dw3 = np.outer(h2, d_out)
                    db3 = d_out
                    
                    dh2 = np.dot(d_out, w3.T) * (h2 > 0)
                    dw2 = np.outer(h1, dh2)
                    db2 = dh2
                    
                    dh1 = np.dot(dh2, w2.T) * (h1 > 0)
                    dw1 = np.outer(b_state, dh1)
                    db1 = dh1
                    
                    w3 -= lr * np.clip(dw3, -1.0, 1.0)
                    b3 -= lr * np.clip(db3, -1.0, 1.0)
                    w2 -= lr * np.clip(dw2, -1.0, 1.0)
                    b2 -= lr * np.clip(db2, -1.0, 1.0)
                    w1 -= lr * np.clip(dw1, -1.0, 1.0)
                    b1 -= lr * np.clip(db1, -1.0, 1.0)
                    
        if epsilon > 0.02:
            epsilon *= 0.985

    export_data = {
        "version": "1.0",
        "framework": "tensorflow-keras-compatible",
        "architecture": [state_dim, h1_dim, h2_dim, action_dim],
        "stats": {"episodes": episodes, "trained": True},
        "weights": {
            "w1": w1.tolist(),
            "b1": b1.tolist(),
            "w2": w2.tolist(),
            "b2": b2.tolist(),
            "w3": w3.tolist(),
            "b3": b3.tolist()
        }
    }

    base_dir = os.path.dirname(os.path.abspath(__file__))
    out_path = os.path.abspath(os.path.join(base_dir, "../snake-app/src/game/ai/dqn_weights.json"))
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w") as f:
        json.dump(export_data, f, indent=2)
    print("Pre-trained weights saved to:", out_path)

if __name__ == "__main__":
    train_and_export()
