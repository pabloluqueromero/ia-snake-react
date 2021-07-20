
import Direction from "../controls/Direction";
import SnakeGame from "../controls/SnakeGame";
import Player from "./Player";


const controlKeys = {
    'ArrowDown': Direction.DOWN,
    'ArrowUp': Direction.UP,
    'ArrowLeft': Direction.LEFT,
    'ArrowRight': Direction.RIGHT
}
const controlKeysOposite = {
    'ArrowDown': Direction.UP,
    'ArrowUp': Direction.DOWN,
    'ArrowLeft': Direction.RIGHT,
    'ArrowRight': Direction.LEFT
}
class HumanPlayer implements Player {
    private move = Direction.DOWN;
    private game: SnakeGame;
    
    init(): void {
        document.addEventListener("keydown", (event) => {
            switch (event.key) {
                case 'ArrowDown':
                case 'ArrowRight':
                case 'ArrowUp':
                case 'ArrowLeft':
                    if ((this.game.getLastMovement() !== controlKeysOposite[event.key]) || this.game.getSnakeLength() === 1) {
                        this.move = controlKeys[event.key];
                        if (!this.game.isSnakeMoving()) {
                            this.game.resume();
                        }
                    }
                    break;
                case 'p':
                    if (this.game.isSnakeMoving()) {
                        this.game.pause();
                        return;
                    }
                    this.game.resume();
            }
        }, false)
    }

    setGame(game: SnakeGame): void {
        this.game = game;
    }

    getNextMove(): Direction {
        return this.move;
    }
}

export default HumanPlayer;
