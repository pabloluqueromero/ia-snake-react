import Direction from "../controls/Direction";
import SnakeGame from "../controls/SnakeGame";

export default interface Player {
    init(): void;
    setGame(game: SnakeGame): void;
    changeVisualize(): void;
    getNextMove(): Promise<Direction>;
}
