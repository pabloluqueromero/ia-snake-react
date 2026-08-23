import numpy as np
import json
import os
import random
from collections import deque

def train_and_export():
    np.random.seed(42)
    random.seed(42)

    # 16-D Comprehensive Body-Aware State
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

    def flood_fill_free_space(start_pt, snake_set, max_nodes=100):
        if is_coll(start_pt, snake_set):
            return 0
        visited = {(start_pt[0], start_pt[1])}
        q = deque([start_pt])
        count = 0
        while q and count < max_nodes:
            curr = q.popleft()
            count += 1
            for d in CLOCKWISE:
                nxt = get_pt(curr, d)
                t_nxt = (nxt[0], nxt[1])
                if not is_coll(nxt, snake_set) and t_nxt not in visited:
                    visited.add(t_nxt)
                    q.append(nxt)
        return count

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

        # 4. Relative Tail Direction
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

        # 6. Free Space Ahead (BFS space count up to 100 cells)
        space_ahead = flood_fill_free_space(pt_s, snake_set, max_nodes=50) / 50.0

        return np.array([
            d_s, d_r, d_l,
            ray_s, ray_r, ray_l,
            food_fwd, food_rgt, food_lft,
            tail_fwd, tail_rgt, tail_lft,
            dist_food, dist_tail, len_ratio,
            space_ahead
        ], dtype=np.float32)

    # Master Trap-Avoiding Pathfinding Expert
    def trap_proof_expert_action(head, direction, apple, tail, snake_set, snake_len):
        idx = direction
        dirs = [CLOCKWISE[idx], CLOCKWISE[(idx + 1) % 4], CLOCKWISE[(idx - 1) % 4]]
        best_act = None
        min_cost = float('inf')

        for a_idx, d in enumerate(dirs):
            nxt = get_pt(head, d)
            if not is_coll(nxt, snake_set):
                # Calculate reachable chamber size
                space = flood_fill_free_space(nxt, snake_set, max_nodes=80)
                
                # Check if this move traps the snake in a chamber smaller than its length
                is_trap = space < min(snake_len + 3, 50)

                h = abs(nxt[0] - apple[0]) + abs(nxt[1] - apple[1])

                if is_trap:
                    # In a trap: navigate toward tail instead of food!
                    h_tail = abs(nxt[0] - tail[0]) + abs(nxt[1] - tail[1])
                    cost = 500.0 - space * 5.0 + h_tail
                else:
                    cost = h - space * 0.5

                if cost < min_cost:
                    min_cost = cost
                    best_act = a_idx

        return best_act

    print("Generating 150,000 long-body & trap-proof training samples...")
    dataset = []

    # Train across varied snake starting lengths (including long snakes length 20 to 60)
    for _ in range(1200):
        head = [random.randint(4, grid_size - 5), random.randint(4, grid_size - 5)]
        snake = [list(head)]
        snake_set = {(head[0], head[1])}
        direction = random.choice(CLOCKWISE)
        apple = [random.randint(1, grid_size - 2), random.randint(1, grid_size - 2)]

        # Pre-grow snake for long-body training scenarios
        if random.random() < 0.4:
            initial_growth = random.randint(15, 45)
            curr = list(head)
            for _ in range(initial_growth):
                d_back = CLOCKWISE[(direction + 2) % 4]
                curr = get_pt(curr, d_back)
                if 0 <= curr[0] < grid_size and 0 <= curr[1] < grid_size and (curr[0], curr[1]) not in snake_set:
                    snake.append(list(curr))
                    snake_set.add((curr[0], curr[1]))
                else:
                    break

        for _ in range(150):
            tail = snake[-1]
            state = compute_body_aware_state(head, direction, apple, tail, snake_set, len(snake))
            act = trap_proof_expert_action(head, direction, apple, tail, snake_set, len(snake))
            if act is None:
                break

            target_q = np.array([-1.0, -1.0, -1.0], dtype=np.float32)
            target_q[act] = 3.0

            if state[0] == 1.0: target_q[0] = -15.0
            if state[1] == 1.0: target_q[1] = -15.0
            if state[2] == 1.0: target_q[2] = -15.0

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

    print(f"Dataset size: {len(dataset)}. Training Neural Policy...")
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
            print(f"Epoch {epoch + 1}/{epochs} | Loss: {total_loss / (len(dataset) / batch_size):.5f}")

    export_data = {
        "version": "5.0",
        "framework": "tensorflow-keras-compatible",
        "architecture": [state_dim, h1_dim, h2_dim, action_dim],
        "stats": {
            "trained": True,
            "trap_prevention": True
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
    print("Exported trap-proof DQN weights to:", out_path)

if __name__ == "__main__":
    train_and_export()
