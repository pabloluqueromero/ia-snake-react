export class Position {
    setColumn(column: number) {
        this.column = column;
    }
    setRow(row: number) {
        this.row = row;
    }
    private row: number;
    private column: number;

    constructor(row: number, column: number) {
        this.row = row;
        this.column = column
    }

    equals(position: Position){
        return position.getColumn() === this.getColumn() && 
               position.getRow() === this.getRow();
    }

    compareRows(position:Position){
        if(position.getRow() === this.getRow()) return 0;
        if(position.getRow() < this.getRow()) return 1;
        return -1;
    }
    
    compareColumns(position:Position){
        if(position.getColumn() === this.getColumn()) return 0;
        if(position.getColumn() < this.getColumn()) return 1;
        return -1;
    }

    getRow(){
        return this.row;
    }

    getColumn(){
        return this.column;
    }
    toList() {
        return [this.row, this.column];
    }
}