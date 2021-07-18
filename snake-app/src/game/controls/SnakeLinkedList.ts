import { Position } from "../game-utils/Position";

class SnakeLinkedList {

    private position: Position;
    private nextNode: SnakeLinkedList | null;
    private tail: SnakeLinkedList; //keep track of tail


    constructor(positions: Array<Position>) {
        if (positions.length) {
            let position = positions.pop()
            this.setPosition(position);
            this.nextNode = new SnakeLinkedList(positions);
            this.tail = this.nextNode.getTail();
        }
        this.tail = this;
        this.nextNode = null;
    }
    getPosition(): Position {
        return this.position;
    }

    getNextNode() {
        return this.nextNode;
    }

    getTail() {
        return this.tail;
    }

    setPosition(position: Position) {
        this.position = position;
    }
    setNextNode(nextNode: SnakeLinkedList) {
        this.nextNode = nextNode;
        if (nextNode!=null) {
            this.tail = this.nextNode.getTail();
        } else {
            this.tail = this;
        }
    }

    move(position: Position, apple: boolean) {
        if (apple) {
            let newNextNode = new SnakeLinkedList([this.getPosition()]);
            newNextNode.setNextNode(this.nextNode);
            this.setNextNode(newNextNode);
            this.setPosition(position);
            return;
        }
        if (this.nextNode) {
            this.nextNode.move(this.getPosition(), false)
            this.tail = this.nextNode.getTail();
            this.setPosition(position);
            return;
        }else{
            this.setPosition(position);
        }
        this.tail = this
    }
}

export default SnakeLinkedList;