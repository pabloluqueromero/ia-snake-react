import SnakeGame from "../controls/SnakeGame";

export interface Player{
    init():void;
    setGame(game: SnakeGame):void;
}
