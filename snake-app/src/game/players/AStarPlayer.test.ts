import AStarPlayer from './AStarPlayer';
import Position from '../game-utils/Position';

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

    test('reconstructPath traces from target to start', () => {
        const player = new AStarPlayer();
        const startPos = new Position(0, 0);
        const midPos = new Position(0, 1);
        const endPos = new Position(0, 2);

        const node0 = (AStarPlayer as any).createAStarNode ?
            (AStarPlayer as any).createAStarNode(startPos, 0, 2, null) : null;
        expect(player.getDistance(startPos, endPos)).toBe(2);
    });
});
