import { HeapQueue } from './HeapQueue';

describe('HeapQueue', () => {
    test('min strategy pops elements in ascending order', () => {
        const queue = new HeapQueue<string>();
        queue.setStrategy('min');
        queue.insert('item3', 30);
        queue.insert('item1', 10);
        queue.insert('item2', 20);

        expect(queue.size()).toBe(3);
        expect(queue.peek()).toBe('item1');
        expect(queue.pop()).toBe('item1');
        expect(queue.pop()).toBe('item2');
        expect(queue.pop()).toBe('item3');
        expect(queue.isEmpty()).toBe(true);
    });

    test('max strategy pops elements in descending order', () => {
        const queue = new HeapQueue<string>();
        queue.setStrategy('max');
        queue.insert('item1', 10);
        queue.insert('item3', 30);
        queue.insert('item2', 20);

        expect(queue.size()).toBe(3);
        expect(queue.peek()).toBe('item3');
        expect(queue.pop()).toBe('item3');
        expect(queue.pop()).toBe('item2');
        expect(queue.pop()).toBe('item1');
        expect(queue.isEmpty()).toBe(true);
    });
});
