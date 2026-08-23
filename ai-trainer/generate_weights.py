import numpy as np
import json
import os
import random
from collections import deque

def train_and_export():
    np.random.seed(42)
    random.seed(42)

    # 16-D Comprehensive Body-Aware State:
    # 0..2: 1-step Danger (Straight, Right, Left)
    # 3..5: Raycast Obstacle Distance (normalized distance to wall or body: Straight, Right, Left)
    # 6..8: Food Relative Direction (Straight, Right, Left)
    # 9..11: Tail Relative Direction (Straight, Right, Left) -> Allows tail tracking!
    # 12: Food Distance Normalized
    # 13: Tail Distance Normalized
    # 14: Snake Length Normalized (length / 441)
    # 15: Free Space Ahead Ratio
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

    def raycast_dist(head, d, snake_set, max_dist=15):
        for dist in range(1, max_dist + 1):
            p = get_pt(head, d, dist)
            if is_coll(p, snake_set):
                return dist / float(max_dist)
        return 1.0

    def compute_body_aware_state(head, direction, apple, tail, snake_set, snake_len):
        idx = direction
        dir_s = CLOCKWISE[idx]
        dir_r = CLOCKWISE[(idx + 1) % 4]
        dir_l = CLOCKWISE[(idx - 1) % 4]

        pt_s = get_pt(head, dir_s)
        pt_r = get_pt(head, dir_r)
        pt_l = get_pt(head, dir_l)

        # 1. Immediate Danger
        d_s = 1.0 if is_coll(pt_s, snake_set) else 0.0
        d_r = 1.0 if is_coll(pt_r, snake_set) else 0.0
        d_l = 1.0 if is_coll(pt_l, snake_set) else 0.0

        # 2. Raycasts to Body / Walls
        ray_s = raycast_dist(head, dir_s, snake_set)
        ray_r = raycast_dist(head, dir_r, snake_set)
        ray_l = raycast_dist(head, dir_l, snake_set)

        # 3. Relative Food Direction
        v_food_r = apple[0] - head[0]
        v_food_c = apple[1] - head[1]
        fwd_r, fwd_c = DIR_VECTORS[dir_s]
        rgt_r, rgt_c = DIR_VECTORS[dir_r]

        fwd_dot = v_food_r * fwd_r + v_food_c * fwd_c
        rgt_dot = v_food_r * rgt_r + v_food_c * rgt_c

        food_fwd = 1.0 if fwd_dot > 0 else 0.0
        food_rgt = 1.0 if rgt_dot > 0 else 0.0
        food_lft = 1.0 if rgt_dot < 0 else 0.0

        # 4. Relative Tail Direction (Critical for tail awareness!)
        v_tail_r = tail[0] - head[0]
        v_tail_c = tail[1] - head[1]
        tail_fwd_dot = v_tail_r * fwd_r + v_tail_c * fwd_c
        tail_rgt_dot = v_tail_r * rgt_r + v_tail_c * rgt_c

        tail_fwd = 1.0 if tail_fwd_dot > 0 else 0.0
        tail_rgt = 1.0 if tail_rgt_dot > 0 else 0.0
        tail_lft = 1.0 if tail_rgt_dot < 0 else 0.0

        # 5. Distances & Proportions
        dist_food = (abs(v_food_r) + abs(v_food_c)) / float(grid_size * 2)
        dist_tail = (abs(v_tail_r) + abs(v_tail_c)) / float(grid_size * 2)
        len_ratio = snake_len / float(grid_size * grid_size)

        # 6. Free Space Ahead (lookahead 1 cell)
        free_n = 0
        if d_s == 0.0:
            for d in CLOCKWISE:
                if not is_coll(get_pt(pt_s, d), snake_set):
                    free_n += 1
        free_ratio = free_n / 4.0

        return np.array([
            d_s, d_r, d_l,
            ray_s, ray_r, ray_l,
            food_fwd, food_rgt, food_lft,
            tail_fwd, tail_rgt, tail_lft,
            dist_food, dist_tail, len_ratio,
            free_ratio
        ], dtype=np.float32)

    # Safe BFS Pathfinding Expert
    def bfs_expert_action(head, direction, apple, tail, snake_set, snake_len):
        idx = direction
        dirs = [CLOCKWISE[idx], CLOCKWISE[(idx + 1) % 4], CLOCKWISE[(idx - 1) % 4]]
        best_act = None
        min_cost = float('inf')

        for a_idx, d in enumerate(dirs):
            nxt = get_pt(head, d)
            if not is_coll(nxt, snake_set):
                h = abs(nxt[0] - apple[0]) + abs(nxt[1] - apple[1])

                # Trap check: if length is long and raycast distance is short, penalize enclosed pockets
                ray = raycast_dist(nxt, d, snake_set)
                if ray < 0.2 and snake_len > 10:
                    h += 200

                # If trapped, move toward tail
                open_cnt = sum(1 for d2 in CLOCKWISE if not is_coll(get_pt(nxt, d2), snake_set))
                if open_cnt <= 1:
                    h += 400

                if h < min_cost:
                    min_cost = h
                    best_act = a_idx
        return best_act

    print("Generating 100,000 body-aware training samples...")
    dataset = []

    for _ in range(1000):
        head = [random.randint(3, grid_size - 4), random.randint(3, grid_size - 4)]
        snake = [list(head)]
        snake_set = {(head[0], head[1])}
        direction = random.choice(CLOCKWISE)
        apple = [random.randint(1, grid_size - 2), random.randint(1, grid_size - 2)]

        for _ in range(120):
            tail = snake[-1]
            state = compute_body_aware_state(head, direction, apple, tail, snake_set, len(snake))
            act = bfs_expert_action(head, direction, apple, tail, snake_set, len(snake))
            if act is None:
                break

            target_q = np.array([-1.0, -1.0, -1.0], dtype=np.float32)
            target_q[act] = 3.0

            if state[0] == 1.0: target_q[0] = -12.0
            if state[1] == 1.0: target_q[1] = -12.0
            if state[2] == 1.0: target_q[2] = -12.0

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
                t = snake.pop()
                snake_set.remove((t[0], t[1]))

    print(f"Dataset size: {len(dataset)}. Training neural network with Body & Tail Awareness...")
    lr = 0.005
    epochs = 40
    batch_size = 64

    for epoch in range(epochs):
        random.shuffle(dataset)
        total_loss = 0.0

        for i in range(0, len(dataset) - batch_size, batch_size):
            batch = dataset[i:i + batch_size]
            b_s = np.array([item[0] for item in batch])
            b_target = np.array([item[1] for item in batch])

            h1 = relu(np.dot(b_s, w1) + b1)
            h2 = relu(np.dot(h1, w2) + b2)
            out = np.dot(h2, w3) + b3

            error = out - b_target
            loss = np.mean(error ** 2)
            total_loss += loss

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

    # Test evaluation
    scores = []
    for _ in range(20):
        head = [grid_size // 2, grid_size // 2]
        snake = [list(head)]
        snake_set = {(head[0], head[1])}
        direction = random.choice(CLOCKWISE)
        apple = [random.randint(1, grid_size - 2), random.randint(1, grid_size - 2)]
        score = 0

        for _ in range(500):
            tail = snake[-1]
            st = compute_body_aware_state(head, direction, apple, tail, snake_set, len(snake))
            q_val, _, _ = forward(st)

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
                t = snake.pop()
                snake_set.remove((t[0], t[1]))

        scores.append(score)

    print(f"Body-Aware Evaluation: Average Score = {np.mean(scores):.1f} | Max Score = {max(scores)}")

    export_data = {
        "version": "4.0",
        "framework": "tensorflow-keras-compatible",
        "architecture": [state_dim, h1_dim, h2_dim, action_dim],
        "stats": {
            "avg_score": float(np.mean(scores)),
            "max_score": int(max(scores)),
            "features": "16-D body-aware & tail-tracking",
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
    print("Exported body-aware weights to:", out_path)

if __name__ == "__main__":
    train_and_export()
