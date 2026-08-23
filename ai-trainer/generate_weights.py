import numpy as np
import json
import os
import random
from collections import deque

def train_and_export():
    np.random.seed(42)
    random.seed(42)

    # 12-D Relative Feature Vector:
    # 0: danger_straight
    # 1: danger_right
    # 2: danger_left
    # 3: danger2_straight
    # 4: danger2_right
    # 5: danger2_left
    # 6: food_is_straight (cosine > 0.1)
    # 7: food_is_right
    # 8: food_is_left
    # 9: food_is_back
    # 10: dist_norm
    # 11: free_space_ahead
    state_dim = 12
    h1_dim = 64
    h2_dim = 64
    action_dim = 3

    # Weights
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
    DIR_VECTORS = {
        0: (-1, 0),  # UP
        1: (0, 1),   # RIGHT
        2: (1, 0),   # DOWN
        3: (0, -1)   # LEFT
    }
    grid_size = 21

    def get_pt(pt, d, dist=1):
        dr, dc = DIR_VECTORS[d]
        return [pt[0] + dr * dist, pt[1] + dc * dist]

    def is_coll(pt, snake_set):
        return pt[0] < 0 or pt[0] >= grid_size or pt[1] < 0 or pt[1] >= grid_size or (pt[0], pt[1]) in snake_set

    def compute_relative_state(head, direction, apple, snake_set):
        idx = direction
        dir_s = CLOCKWISE[idx]
        dir_r = CLOCKWISE[(idx + 1) % 4]
        dir_l = CLOCKWISE[(idx - 1) % 4]

        pt_s = get_pt(head, dir_s)
        pt_r = get_pt(head, dir_r)
        pt_l = get_pt(head, dir_l)

        # Danger 1 step
        d_s = 1.0 if is_coll(pt_s, snake_set) else 0.0
        d_r = 1.0 if is_coll(pt_r, snake_set) else 0.0
        d_l = 1.0 if is_coll(pt_l, snake_set) else 0.0

        # Danger 2 steps
        d2_s = 1.0 if (d_s == 1.0 or is_coll(get_pt(head, dir_s, 2), snake_set)) else 0.0
        d2_r = 1.0 if (d_r == 1.0 or is_coll(get_pt(head, dir_r, 2), snake_set)) else 0.0
        d2_l = 1.0 if (d_l == 1.0 or is_coll(get_pt(head, dir_l, 2), snake_set)) else 0.0

        # Relative food vector calculation
        # Vector from head to apple
        v_food_r = apple[0] - head[0]
        v_food_c = apple[1] - head[1]

        # Forward unit vector
        fwd_r, fwd_c = DIR_VECTORS[dir_s]
        # Right unit vector
        rgt_r, rgt_c = DIR_VECTORS[dir_r]

        # Dot product with forward and right
        fwd_dot = v_food_r * fwd_r + v_food_c * fwd_c
        rgt_dot = v_food_r * rgt_r + v_food_c * rgt_c

        food_fwd = 1.0 if fwd_dot > 0 else 0.0
        food_rgt = 1.0 if rgt_dot > 0 else 0.0
        food_lft = 1.0 if rgt_dot < 0 else 0.0
        food_bck = 1.0 if fwd_dot < 0 else 0.0

        dist = (abs(v_food_r) + abs(v_food_c)) / float(grid_size * 2)

        free_n = 0
        if d_s == 0.0:
            for d in CLOCKWISE:
                if not is_coll(get_pt(pt_s, d), snake_set):
                    free_n += 1
        free_ratio = free_n / 4.0

        return np.array([
            d_s, d_r, d_l,
            d2_s, d2_r, d2_l,
            food_fwd, food_rgt, food_lft, food_bck,
            dist,
            free_ratio
        ], dtype=np.float32)

    def expert_action(head, direction, apple, snake_set):
        idx = direction
        dirs = [CLOCKWISE[idx], CLOCKWISE[(idx + 1) % 4], CLOCKWISE[(idx - 1) % 4]]
        best_act = None
        min_dist = float('inf')

        for a_idx, d in enumerate(dirs):
            nxt = get_pt(head, d)
            if not is_coll(nxt, snake_set):
                h = abs(nxt[0] - apple[0]) + abs(nxt[1] - apple[1])
                # Check for dead-end
                open_cnt = sum(1 for d2 in CLOCKWISE if not is_coll(get_pt(nxt, d2), snake_set))
                if open_cnt == 0:
                    h += 500
                elif open_cnt == 1:
                    h += 50
                if h < min_dist:
                    min_dist = h
                    best_act = a_idx
        return best_act

    print("Generating dataset of 30,000 expert demonstrations and training policy...")
    dataset = []
    
    # Generate diverse game situations
    for _ in range(800):
        head = [random.randint(2, grid_size - 3), random.randint(2, grid_size - 3)]
        snake = [list(head)]
        snake_set = {(head[0], head[1])}
        direction = random.choice(CLOCKWISE)
        apple = [random.randint(1, grid_size - 2), random.randint(1, grid_size - 2)]

        # Simulate game
        for _ in range(120):
            state = compute_relative_state(head, direction, apple, snake_set)
            act = expert_action(head, direction, apple, snake_set)
            if act is None:
                break
            
            target_q = np.array([-1.0, -1.0, -1.0], dtype=np.float32)
            target_q[act] = 2.0  # High reward for expert action
            
            # Penalize dangerous actions strongly
            if state[0] == 1.0: target_q[0] = -10.0
            if state[1] == 1.0: target_q[1] = -10.0
            if state[2] == 1.0: target_q[2] = -10.0

            dataset.append((state, target_q))

            idx = direction
            if act == 1:
                direction = CLOCKWISE[(idx + 1) % 4]
            elif act == 2:
                direction = CLOCKWISE[(idx - 1) % 4]

            new_head = get_pt(head, direction)
            if is_coll(new_head, snake_set):
                break
            head = new_head
            snake.insert(0, list(head))
            snake_set.add((head[0], head[1]))

            if head == apple:
                apple = [random.randint(1, grid_size - 2), random.randint(1, grid_size - 2)]
            else:
                tail = snake.pop()
                snake_set.remove((tail[0], tail[1]))

    print(f"Generated {len(dataset)} training samples. Training neural network...")
    lr = 0.005
    epochs = 40

    for epoch in range(epochs):
        random.shuffle(dataset)
        total_loss = 0.0
        batch_size = 64

        for i in range(0, len(dataset) - batch_size, batch_size):
            batch = dataset[i:i + batch_size]
            b_s = np.array([item[0] for item in batch])
            b_target = np.array([item[1] for item in batch])

            # Forward batch
            h1 = relu(np.dot(b_s, w1) + b1)
            h2 = relu(np.dot(h1, w2) + b2)
            out = np.dot(h2, w3) + b3

            # MSE Loss
            error = out - b_target
            loss = np.mean(error ** 2)
            total_loss += loss

            # Backprop
            d_out = error / batch_size
            dw3 = np.dot(h2.T, d_out)
            db3 = np.sum(d_out, axis=0)

            dh2 = np.dot(d_out, w3.T) * (h2 > 0)
            dw2 = np.dot(h1.T, dh2)
            db2 = np.sum(dh2, axis=0)

            dh1 = np.dot(dh2, w2.T) * (h1 > 0)
            dw1 = np.dot(b_s.T, dh1)
            db1 = np.sum(dh1, axis=0)

            w3 -= lr * np.clip(dw3, -1.0, 1.0)
            b3 -= lr * np.clip(db3, -1.0, 1.0)
            w2 -= lr * np.clip(dw2, -1.0, 1.0)
            b2 -= lr * np.clip(db2, -1.0, 1.0)
            w1 -= lr * np.clip(dw1, -1.0, 1.0)
            b1 -= lr * np.clip(db1, -1.0, 1.0)

        if (epoch + 1) % 10 == 0:
            print(f"Epoch {epoch + 1}/{epochs} | Avg Loss: {total_loss / (len(dataset) / batch_size):.5f}")

    # Evaluate trained policy
    print("Evaluating trained policy on 20 test games...")
    scores = []
    for _ in range(20):
        head = [grid_size // 2, grid_size // 2]
        snake = [list(head)]
        snake_set = {(head[0], head[1])}
        direction = random.choice(CLOCKWISE)
        apple = [random.randint(1, grid_size - 2), random.randint(1, grid_size - 2)]
        score = 0

        for _ in range(500):
            st = compute_relative_state(head, direction, apple, snake_set)
            q_val, _, _ = forward(st)

            # Mask out immediate collisions
            for a in range(3):
                if st[a] == 1.0:
                    q_val[a] = -999.0

            action = int(np.argmax(q_val))

            idx = direction
            if action == 1:
                direction = CLOCKWISE[(idx + 1) % 4]
            elif action == 2:
                direction = CLOCKWISE[(idx - 1) % 4]

            new_head = get_pt(head, direction)
            if is_coll(new_head, snake_set):
                break
            head = new_head
            snake.insert(0, list(head))
            snake_set.add((head[0], head[1]))

            if head == apple:
                score += 1
                apple = [random.randint(1, grid_size - 2), random.randint(1, grid_size - 2)]
            else:
                tail = snake.pop()
                snake_set.remove((tail[0], tail[1]))

        scores.append(score)

    print(f"Evaluation: Average Score = {np.mean(scores):.1f} | Max Score = {max(scores)}")

    export_data = {
        "version": "3.0",
        "framework": "tensorflow-keras-compatible",
        "architecture": [state_dim, h1_dim, h2_dim, action_dim],
        "stats": {
            "avg_score": float(np.mean(scores)),
            "max_score": int(max(scores)),
            "trained": True
        },
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
    print("Successfully exported master DQN weights to:", out_path)

if __name__ == "__main__":
    train_and_export()
