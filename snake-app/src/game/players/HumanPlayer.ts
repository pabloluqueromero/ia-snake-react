
import Direction from "../controls/Direction";
import SnakeGame from "../controls/SnakeGame";
import { Player } from "./Player";

class HumanPlayer implements Player {
    private lastKey = new Date();
    private game: SnakeGame;
    init(): void {
        document.addEventListener("keydown", (event) => {
            let currentTime = new Date()
            console.log(currentTime);
            /* if(Math. abs(currentTime-this.lastKey)<5000){
                 return
             } */
            switch (event.key) {
                case 'ArrowDown':
                    if ((this.game.getLastMovement() !== Direction.UP && this.game.isSnakeMoving()) || this.game.getSnakeLength() === 1) {
                        this.game.setLastMovement(Direction.DOWN);
                    }
                    return;
                case 'ArrowUp':
                    if ((this.game.getLastMovement() !== Direction.DOWN && this.game.isSnakeMoving()) || this.game.getSnakeLength() === 1) {
                        this.game.setLastMovement(Direction.UP);
                    }
                    return;
                case 'ArrowRight':

                    if ((this.game.getLastMovement() !== Direction.LEFT && this.game.isSnakeMoving()) || this.game.getSnakeLength() === 1) {
                        this.game.setLastMovement(Direction.RIGHT);
                    }
                    return;
                case 'ArrowLeft':

                    if ((this.game.getLastMovement() !== Direction.RIGHT && this.game.isSnakeMoving()) || this.game.getSnakeLength() === 1) {
                        this.game.setLastMovement(Direction.LEFT);
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
}

export default HumanPlayer;
