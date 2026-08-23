import numpy as np
import json
import os
import random
from collections import deque

def train_and_export():
    np.random.seed(42)
    random.seed(42)

    # 16-Dimensional Feature Vector:
    # 0..2: Immediate danger (Straight, Right, Left)
    # 3..5: 2-step danger (Straight 2, Right 2, Left 2)
    # 6..9: Heading one-hot (UP, RIGHT, DOWN, LEFT)
    # 10..13: Food direction (UP, RIGHT, DOWN, LEFT)
    # 14: Normalized Manhattan distance to food
    # 15: Open neighbor ratio (safety score)
    state_dim = 16
    h1_dim = 64
    h2_dim = 64
    action_dim = 3

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

    CLOCKWISE = [0, 1, 2, 3]  # 0: UP, 1: RIGHT, 2: DOWN, 3: LEFT
    grid_size = 21

    def get_pt(pt, d, dist=1):
        if d == 0: return [pt[0] - dist, pt[1]]
        if d == 1: return [pt[0], pt[1] + dist]
        if d == 2: return [pt[0] + dist, pt[1]]
        if d == 3: return [pt[0], pt[1] - dist]
        return pt

    def is_coll(pt, snake_set):
        return pt[0] < 0 or pt[0] >= grid_size or pt[1] < 0 or pt[1] >= grid_size or (pt[0], pt[1]) in snake_set

    def compute_state(head, direction, apple, snake_set):
        idx = direction
        dir_s = CLOCKWISE[idx]
        dir_r = CLOCKWISE[(idx + 1) % 4]
        dir_l = CLOCKWISE[(idx - 1) % 4]

        pt_s = get_pt(head, dir_s)
        pt_r = get_pt(head, dir_r)
        pt_l = get_pt(head, dir_l)

        # Immediate danger
        d_s = 1.0 if is_coll(pt_s, snake_set) else 0.0
        d_r = 1.0 if is_coll(pt_r, snake_set) else 0.0
        d_l = 1.0 if is_coll(pt_l, snake_set) else 0.0

        # 2-step danger
        d2_s = 1.0 if (d_s == 1.0 or is_coll(get_pt(head, dir_s, 2), snake_set)) else 0.0
        d2_r = 1.0 if (d_r == 1.0 or is_coll(get_pt(head, dir_r, 2), snake_set)) else 0.0
        d2_l = 1.0 if (d_l == 1.0 or is_coll(get_pt(head, dir_l, 2), snake_set)) else 0.0

        # Fast free neighbor count around pt_s
        free_neighbors = 0
        if d_s == 0.0:
            for d in CLOCKWISE:
                if not is_coll(get_pt(pt_s, d), snake_set):
                    free_neighbors += 1
        free_ratio = free_neighbors / 4.0

        dist = (abs(apple[0] - head[0]) + abs(apple[1] - head[1])) / float(grid_size * 2)

        return np.array([
            d_s, d_r, d_l,
            d2_s, d2_r, d2_l,
            1.0 if direction == 0 else 0.0,
            1.0 if direction == 1 else 0.0,
            1.0 if direction == 2 else 0.0,
            1.0 if direction == 3 else 0.0,
            1.0 if apple[0] < head[0] else 0.0,
            1.0 if apple[1] > head[1] else 0.0,
            1.0 if apple[0] > head[0] else 0.0,
            1.0 if apple[1] < head[1] else 0.0,
            dist,
            free_ratio
        ], dtype=np.float32)

    def expert_action(head, direction, apple, snake_set):
        idx = direction
        dirs = [CLOCKWISE[idx], CLOCKWISE[(idx + 1) % 4], CLOCKWISE[(idx - 1) % 4]]
        best_act = None
        min_h = float('inf')

        for a_idx, d in enumerate(dirs):
            nxt = get_pt(head, d)
            if not is_coll(nxt, snake_set):
                h = abs(nxt[0] - apple[0]) + abs(nxt[1] - apple[1])
                # Check dead end (0-1 open neighbors)
                open_n = sum(1 for d2 in CLOCKWISE if not is_coll(get_pt(nxt, d2), snake_set))
                if open_n <= 1:
                    h += 50
                if h < min_h:
                    min_h = h
                    best_act = a_idx
        return best_act

    print("Fast training 400 episodes...")
    episodes = 400
    memory = deque(maxlen=20000)
    gamma = 0.95
    lr = 0.003
    epsilon = 0.7

    for ep in range(episodes):
        head = [random.randint(4, grid_size - 5), random.randint(4, grid_size - 5)]
        snake = [list(head)]
        snake_set = {(head[0], head[1])}
        direction = random.choice(CLOCKWISE)
        apple = [random.randint(1, grid_size - 2), random.randint(1, grid_size - 2)]
        done = False
        steps = 0

        while not done and steps < 300:
            steps += 1
            state = compute_state(head, direction, apple, snake_set)
            q, _, _ = forward(state)

            exp_prob = max(0.05, 0.75 * (1.0 - ep / float(episodes)))
            if random.random() < exp_prob:
                act = expert_action(head, direction, apple, snake_set)
                action = act if act is not None else random.randrange(3)
            elif random.random() < epsilon:
                safe_acts = [a for a in range(3) if state[a] == 0.0]
                action = random.choice(safe_acts) if safe_acts else random.randrange(3)
            else:
                masked_q = q.copy()
                for a in range(3):
                    if state[a] == 1.0:
                        masked_q[a] = -999.0
                action = int(np.argmax(masked_q))

            idx = direction
            if action == 1:
                direction = CLOCKWISE[(idx + 1) % 4]
            elif action == 2:
                direction = CLOCKWISE[(idx - 1) % 4]

            prev_dist = abs(apple[0] - head[0]) + abs(apple[1] - head[1])
            new_head = get_pt(head, direction)

            if is_coll(new_head, snake_set):
                reward = -15.0
                done = True
                next_state = state
            else:
                head = new_head
                snake.insert(0, list(head))
                snake_set.add((head[0], head[1]))
                curr_dist = abs(apple[0] - head[0]) + abs(apple[1] - head[1])

                if head == apple:
                    reward = 15.0
                    apple = [random.randint(1, grid_size - 2), random.randint(1, grid_size - 2)]
                else:
                    tail = snake.pop()
                    snake_set.remove((tail[0], tail[1]))
                    reward = 0.3 if curr_dist < prev_dist else -0.35

                next_state = compute_state(head, direction, apple, snake_set)

            memory.append((state, action, reward, next_state, done))

            if len(memory) >= 64 and steps % 2 == 0:
                batch = random.sample(memory, 64)
                for b_s, b_a, b_r, b_ns, b_d in batch:
                    out, h1, h2 = forward(b_s)
                    next_out, _, _ = forward(b_ns)
                    target = b_r if b_d else b_r + gamma * np.max(next_out)

                    d_out = np.zeros(action_dim)
                    d_out[b_a] = out[b_a] - target

                    dw3 = np.outer(h2, d_out)
                    db3 = d_out
                    dh2 = np.dot(d_out, w3.T) * (h2 > 0)
                    dw2 = np.outer(h1, dh2)
                    db2 = dh2
                    dh1 = np.dot(dh2, w2.T) * (h1 > 0)
                    dw1 = np.outer(b_s, dh1)
                    db1 = dh1

                    w3 -= lr * np.clip(dw3, -1.0, 1.0)
                    b3 -= lr * np.clip(db3, -1.0, 1.0)
                    w2 -= lr * np.clip(dw2, -1.0, 1.0)
                    b2 -= lr * np.clip(db2, -1.0, 1.0)
                    w1 -= lr * np.clip(dw1, -1.0, 1.0)
                    b1 -= lr * np.clip(db1, -1.0, 1.0)

        if epsilon > 0.02:
            epsilon *= 0.99

    export_data = {
        "version": "2.0",
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
