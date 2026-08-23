import Snake from './Snake';
import Position from '../game-utils/Position';
import Direction from './Direction';

describe('Snake Engine', () => {
    test('moves snake forward when no apple eaten', () => {
        const initialPositions = [new Position(5, 5)];
        const snake = new Snake(10, 10, initialPositions);

        const applePos = new Position(0, 0);
        const moveResult = snake.move(Direction.RIGHT, applePos);

        expect(moveResult.appleEaten).toBe(false);
        expect(snake.getHeadPosition().getRow()).toBe(5);
        expect(snake.getHeadPosition().getColumn()).toBe(6);
        expect(snake.getSize()).toBe(1);
    });

    test('grows snake when apple is eaten', () => {
        const initialPositions = [new Position(5, 5)];
        const snake = new Snake(10, 10, initialPositions);

        const applePos = new Position(5, 6);
        const moveResult = snake.move(Direction.RIGHT, applePos);

        expect(moveResult.appleEaten).toBe(true);
        expect(snake.getSize()).toBe(2);
        expect(snake.getHeadPosition().getRow()).toBe(5);
        expect(snake.getHeadPosition().getColumn()).toBe(6);
    });

    test('throws error on wall collision', () => {
        const initialPositions = [new Position(0, 0)];
        const snake = new Snake(10, 10, initialPositions);

        const applePos = new Position(5, 5);
        expect(() => {
            snake.move(Direction.UP, applePos);
        }).toThrow('Collision');
    });
});
