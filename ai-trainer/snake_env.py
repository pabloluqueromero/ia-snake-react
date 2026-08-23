import random
from collections import deque
from enum import IntEnum
import numpy as np

class Direction(IntEnum):
    UP = 0
    RIGHT = 1
    DOWN = 2
    LEFT = 3

class Point:
    def __init__(self, row: int, col: int):
        self.row = row
        self.col = col

    def __eq__(self, other):
        if not isinstance(other, Point):
            return False
        return self.row == other.row and self.col == other.col

    def __hash__(self):
        return hash((self.row, self.col))

    def __repr__(self):
        return f"Point({self.row}, {self.col})"

class SnakeEnv:
    """
    Snake environment matching React Snake rules and coordinates.
    Grid: (rows, cols)
    Row increases downwards, Col increases rightwards.
    """
    CLOCKWISE = [Direction.UP, Direction.RIGHT, Direction.DOWN, Direction.LEFT]

    def __init__(self, rows: int = 21, cols: int = 21):
        self.rows = rows
        self.cols = cols
        self.reset()

    def reset(self):
        # Start snake in center
        center_r = self.rows // 2
        center_c = self.cols // 2
        self.head = Point(center_r, center_c)
        self.snake = deque([self.head])
        self.body_set = {self.head}
        
        # Initial direction random or UP
        self.direction = random.choice(self.CLOCKWISE)
        self.score = 0
        self.steps = 0
        self.steps_since_food = 0
        self.apple = self._place_apple()
        return self.get_state()

    def _place_apple(self) -> Point:
        while True:
            r = random.randint(0, self.rows - 1)
            c = random.randint(0, self.cols - 1)
            p = Point(r, c)
            if p not in self.body_set and p != self.head:
                return p

    def is_collision(self, pt: Point = None) -> bool:
        if pt is None:
            pt = self.head
        # Wall collision
        if pt.row < 0 or pt.row >= self.rows or pt.col < 0 or pt.col >= self.cols:
            return True
        # Body collision
        if pt in self.body_set and pt != self.snake[-1]:
            return True
        return False

    def _get_next_point(self, pt: Point, direction: Direction) -> Point:
        if direction == Direction.UP:
            return Point(pt.row - 1, pt.col)
        elif direction == Direction.RIGHT:
            return Point(pt.row, pt.col + 1)
        elif direction == Direction.DOWN:
            return Point(pt.row + 1, pt.col)
        elif direction == Direction.LEFT:
            return Point(pt.row, pt.col - 1)
        return pt

    def get_state(self) -> np.ndarray:
        """
        Returns a 12-dimensional feature vector:
        [danger_straight, danger_right, danger_left,
         dir_up, dir_right, dir_down, dir_left,
         food_up, food_right, food_down, food_left,
         dist_norm]
        """
        idx = self.CLOCKWISE.index(self.direction)
        dir_straight = self.CLOCKWISE[idx]
        dir_right = self.CLOCKWISE[(idx + 1) % 4]
        dir_left = self.CLOCKWISE[(idx - 1) % 4]

        pt_straight = self._get_next_point(self.head, dir_straight)
        pt_right = self._get_next_point(self.head, dir_right)
        pt_left = self._get_next_point(self.head, dir_left)

        danger_straight = 1.0 if self.is_collision(pt_straight) else 0.0
        danger_right = 1.0 if self.is_collision(pt_right) else 0.0
        danger_left = 1.0 if self.is_collision(pt_left) else 0.0

        dir_up = 1.0 if self.direction == Direction.UP else 0.0
        dir_right = 1.0 if self.direction == Direction.RIGHT else 0.0
        dir_down = 1.0 if self.direction == Direction.DOWN else 0.0
        dir_left = 1.0 if self.direction == Direction.LEFT else 0.0

        food_up = 1.0 if self.apple.row < self.head.row else 0.0
        food_right = 1.0 if self.apple.col > self.head.col else 0.0
        food_down = 1.0 if self.apple.row > self.head.row else 0.0
        food_left = 1.0 if self.apple.col < self.head.col else 0.0

        manhattan_dist = (abs(self.apple.row - self.head.row) + abs(self.apple.col - self.head.col)) / (self.rows + self.cols)

        return np.array([
            danger_straight, danger_right, danger_left,
            dir_up, dir_right, dir_down, dir_left,
            food_up, food_right, food_down, food_left,
            manhattan_dist
        ], dtype=np.float32)

    def step(self, action: int):
        """
        action:
          0 -> Straight
          1 -> Turn Right
          2 -> Turn Left
        """
        self.steps += 1
        self.steps_since_food += 1

        # Determine new direction
        idx = self.CLOCKWISE.index(self.direction)
        if action == 1:
            self.direction = self.CLOCKWISE[(idx + 1) % 4]
        elif action == 2:
            self.direction = self.CLOCKWISE[(idx - 1) % 4]

        prev_dist = abs(self.apple.row - self.head.row) + abs(self.apple.col - self.head.col)

        new_head = self._get_next_point(self.head, self.direction)
        self.head = new_head

        max_steps_without_food = self.rows * self.cols * 2
        if self.is_collision(new_head) or self.steps_since_food > max_steps_without_food:
            reward = -10.0
            done = True
            return self.get_state(), reward, done, {"score": self.score, "steps": self.steps}

        self.snake.appendleft(new_head)
        self.body_set.add(new_head)

        reward = 0.0
        done = False

        if new_head == self.apple:
            self.score += 1
            reward = 10.0
            self.steps_since_food = 0
            if len(self.snake) == self.rows * self.cols:
                done = True
            else:
                self.apple = self._place_apple()
        else:
            tail = self.snake.pop()
            self.body_set.remove(tail)
            
            curr_dist = abs(self.apple.row - self.head.row) + abs(self.apple.col - self.head.col)
            if curr_dist < prev_dist:
                reward = 0.15
            else:
                reward = -0.20

        return self.get_state(), reward, done, {"score": self.score, "steps": self.steps}
