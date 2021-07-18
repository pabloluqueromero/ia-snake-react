
class SnakeLinkedList {

    private row: number;
    private column: number;
    private nextNode: SnakeLinkedList | null;
    private tail: SnakeLinkedList; //keep track of tail


    constructor(positions: Array<{ row: number, column: number }>) {
        if (positions.length) {
            let position = positions.pop()
            this.setPosition(position);
            this.nextNode = new SnakeLinkedList(positions);
            this.tail = this.nextNode.getTail();
        }
        this.tail = this;
        this.nextNode = null;
    }

    getRow() {
        return this.row;
    }

    getColumn() {
        return this.column;
    }

    getPosition(): { row: number, column: number } {
        return { row: this.row, column: this.column };
    }

    getNextNode() {
        return this.column;
    }

    getTail() {
        return this.tail;
    }

    setPosition(position: { row: number, column: number }) {
        this.row = position.row;
        this.column = position.column;
    }
    setNextNode(nextNode: SnakeLinkedList) {
        this.nextNode = nextNode;
        if (nextNode!=null) {
            this.tail = this.nextNode.getTail();
        } else {
            this.tail = this;
        }
    }

    move(position: { row: number, column: number }, apple: boolean) {
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