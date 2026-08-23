import AStarPlayer from './AStarPlayer';
import Position from '../game-utils/Position';
import Direction from '../controls/Direction';
import SnakeGame from '../controls/SnakeGame';

describe('AStarPlayer', () => {
    test('AStarPlayer initializes and cleans up properly', () => {
        const player = new AStarPlayer();
        player.init();
        expect(typeof player.getNextMove).toBe('function');
        expect(typeof player.destroy).toBe('function');
        player.destroy();
    });

    test('calculates correct distance heuristic', () => {
        const player = new AStarPlayer();
        const p1 = new Position(2, 3);
        const p2 = new Position(5, 7);
        const distance = player.getDistance(p1, p2);
        // |2 - 5| + |3 - 7| = 3 + 4 = 7
        expect(distance).toBe(7);
    });

    test('reconstructPath returns empty array for null node', () => {
        const player = new AStarPlayer();
        const path = player.reconstructPath(null as any);
        expect(path).toEqual([]);
    });
});
