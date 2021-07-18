
import Direction from "../controls/Direction";
import SnakeGame from "../controls/SnakeGame";
import { Player } from "./Player";

class HumanPlayer implements Player {
    private move = Direction.DOWN;
    private game: SnakeGame;
    init(): void {
        document.addEventListener("keydown", (event) => {
            /* if(Math. abs(currentTime-this.lastKey)<5000){
                 return
             } */
            switch (event.key) {
                case 'ArrowDown':
                    if ((this.game.isSnakeMoving() && this.game.getLastMovement() !== Direction.UP) || this.game.getSnakeLength() === 1) {
                        this.move = Direction.DOWN;
                    }
                    return;
                case 'ArrowUp':
                    if ((this.game.isSnakeMoving() && this.game.getLastMovement() !== Direction.DOWN) || this.game.getSnakeLength() === 1) {
                        this.move = Direction.UP;
                    }
                    return;
                case 'ArrowRight':

                    if ((this.game.isSnakeMoving() && this.game.getLastMovement() !== Direction.LEFT) || this.game.getSnakeLength() === 1) {
                        this.move = Direction.RIGHT;
                    }
                    return;
                case 'ArrowLeft':

                    if ((this.game.isSnakeMoving() && this.game.getLastMovement() !== Direction.RIGHT) || this.game.getSnakeLength() === 1) {
                        this.move = Direction.LEFT;
                    }
                    return;
                case 'p':
                    if (this.game.isSnakeMoving()) {
                        this.game.pause();
                        return;
                    }
                    this.game.resume();
                    return;
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
