
import Direction from "../controls/Direction";
import SnakeGame from "../controls/SnakeGame";
import Player from "./Player";
import Position from "../game-utils/Position";
import { GameUtils } from "../game-utils/GameUtils";


class HamiltonianPlayer implements Player {
    private nextMove: Map<number, Direction>;
    private game: SnakeGame;
    


    init() {
        console.info("[Player] Hamiltonian player");
    }

    setGame(game: SnakeGame): void {
        this.game = game;
        this.nextMove = new Map();
        this.computeHamiltonianPath();
    }

    computeHamiltonianPath(visitedPostions = new Set<number>(), positionList: Position[] = [new Position(0,0)]) {
        
        let position = positionList.pop();
        let positionId = GameUtils.getPositionID(position,this.game.getDimensions());
        console.log(`Row: ${position.getRow()}  Column: ${position.getColumn()}`)
        if(positionList.length===0 && 
           this.nextMove.size === this.game.getDimensions().reduce(Math.imul)-1 ){
            // Path found
            return position;
        }
        //isVisited
        if (visitedPostions.has(positionId)){
            //backtrack
            return new Position(-1,-1);
        }
        
        let neighbours = GameUtils.getNeighboursWithoutSnake(position, this.game.getDimensions())
            .filter(neighbour => !visitedPostions.has(GameUtils.getPositionID(neighbour,this.game.getDimensions())))
        
        visitedPostions.add(positionId);
        if(neighbours.length!==0){
            for(let neighbour of neighbours){
                positionList.push(neighbour);
                let positionReturned = this.computeHamiltonianPath(visitedPostions, positionList);
                if (positionReturned.getRow()!==-1){
                    //Path Found
                    this.nextMove.set(positionId,GameUtils.getDirection(position, positionReturned))
                    return position
                }
            }
            visitedPostions.delete(positionId);
            return new Position(-1,-1);
            //backtrack
        }else{
            if(positionList.length===0){
                //backtrack
                visitedPostions.delete(positionId);
                return new Position(-1,-1);
            }
            let positionReturned = this.computeHamiltonianPath(visitedPostions, positionList);
            if (positionReturned.getRow()!==-1){
                //Path Found
                this.nextMove.set(positionId,GameUtils.getDirection(position, positionReturned))
                return position
            }
            
            visitedPostions.delete(positionId);
            return new Position(-1,-1);

        }
        
        //backtrack
        visitedPostions.delete(positionId);
        return new Position(-1,-1);
        
        
    }

    changeVisualize(): void {
        /*Not implemented yet*/
    }

    async getNextMove(): Promise<Direction> {
        /*Not implemented yet*/
        return new Promise((resolve, reject) => {
            let headPositionID = GameUtils.getPositionID(this.game.getHeadSnakePosition(),this.game.getDimensions())
            resolve( this.nextMove.get(headPositionID))});
    }
    
    getNeighbours(currentNode: Position): Position[] {
        return GameUtils.allDirections
            .map(direction => GameUtils.applyDirection(currentNode, direction))
            .filter(position => GameUtils.isValidPosition(position, this.game.getDimensions(), this.game.getSnake()));
    }

}
export default HamiltonianPlayer;