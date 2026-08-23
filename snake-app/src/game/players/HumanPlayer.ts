
import Direction from "../controls/Direction";
import SnakeGame from "../controls/SnakeGame";
import Player from "./Player";


const controlKeys: { [key: string]: Direction } = {
    'ArrowDown': Direction.DOWN,
    'ArrowUp': Direction.UP,
    'ArrowLeft': Direction.LEFT,
    'ArrowRight': Direction.RIGHT,
    's': Direction.DOWN,
    'w': Direction.UP,
    'a': Direction.LEFT,
    'd': Direction.RIGHT,
    'S': Direction.DOWN,
    'W': Direction.UP,
    'A': Direction.LEFT,
    'D': Direction.RIGHT,
};

const controlKeysOpposite: { [key: string]: Direction } = {
    'ArrowDown': Direction.UP,
    'ArrowUp': Direction.DOWN,
    'ArrowLeft': Direction.RIGHT,
    'ArrowRight': Direction.LEFT,
    's': Direction.UP,
    'w': Direction.DOWN,
    'a': Direction.RIGHT,
    'd': Direction.LEFT,
    'S': Direction.UP,
    'W': Direction.DOWN,
    'A': Direction.RIGHT,
    'D': Direction.LEFT,
};

class HumanPlayer implements Player {
    private move = Direction.DOWN;
    private game: SnakeGame;
    private keydownHandler: ((event: KeyboardEvent) => void) | null = null;

    init(): void {
        this.destroy();
        this.keydownHandler = (event: KeyboardEvent) => {
            const key = event.key;
            if (controlKeys[key] !== undefined) {
                if ((this.game.getLastMovement() !== controlKeysOpposite[key]) || this.game.getSnakeLength() === 1) {
                    this.move = controlKeys[key];
                    if (!this.game.isSnakeMoving()) {
                        this.game.resume();
                    }
                }
            } else if (key === 'p' || key === 'P') {
                if (this.game.isSnakeMoving()) {
                    console.log("pausing");
                    this.game.pause();
                    return;
                }
                this.game.resume();
            }
        };
        document.addEventListener("keydown", this.keydownHandler, false);
    }

    destroy(): void {
        if (this.keydownHandler) {
            document.removeEventListener("keydown", this.keydownHandler, false);
            this.keydownHandler = null;
        }
    }

    changeVisualize(): void {
        // No action needed for HumanPlayer
    }

    setGame(game: SnakeGame): void {
        this.game = game;
    }

    getNextMove(): Promise<Direction> {
        return Promise.resolve(this.move);
    }
}

export default HumanPlayer;
