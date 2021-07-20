import Position from "../game-utils/Position";

class SnakeLinkedList {

    private position: Position;
    private nextNode: SnakeLinkedList | null;
    private previousNode: SnakeLinkedList | null;
    private tail: SnakeLinkedList; //keep track of tail only coherent for the head


    constructor(positions: Array<Position>) {
        if (positions.length) {
            let position = positions.pop()
            this.setPosition(position);
            this.nextNode = new SnakeLinkedList(positions);
            this.nextNode.previousNode = this;
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
            this.nextNode.setPreviousNode(this);
            this.tail = this.nextNode.getTail();
        } else {
            this.tail = this;
        }
    }
    setPreviousNode(previousNode: SnakeLinkedList) {
        this.previousNode = previousNode
    }

    move(position: Position, apple: boolean) {
        //console.debug("[SnakeLinkedList] Moving")
        if (apple) {
            let newNextNode = new SnakeLinkedList([this.getPosition()]);
            newNextNode.setNextNode(this.nextNode);
            this.setNextNode(newNextNode);
            this.setPosition(position);
            return;
        }
        if (this.nextNode) {
            let newNextNode = new SnakeLinkedList([this.getPosition()]);
            newNextNode.setNextNode(this.nextNode);
            this.setNextNode(newNextNode);
            this.setPosition(position);
            this.getTail().getPreviousNode().setNextNode(null);
            this.updateTail();
            //Recursive approach
            /*this.nextNode.move(this.getPosition(), false)
            this.tail = this.nextNode.getTail();
            this.setPosition(position);*/
            return;
        }else{
            this.setPosition(position);
            this.tail = this
        }
    }
    getPreviousNode() {
        return this.previousNode;
    }
    updateTail() {
        if(this.nextNode == null){
            this.tail = this;
            return;
        }
        this.nextNode.updateTail();
        this.tail = this.nextNode.getTail();
    }
}

export default SnakeLinkedList;