import React from 'react';
import { Link } from 'react-router-dom';

function Info() {
    return (
        <div style={{
            maxWidth: '800px',
            margin: '40px auto',
            padding: '24px',
            fontFamily: 'Inter, system-ui, sans-serif',
            color: '#1a202c',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
            <Link to="/" style={{ color: '#578A34', textDecoration: 'none', fontWeight: 600 }}>&larr; Back to Game</Link>
            <h1 style={{ marginTop: '16px', color: '#2d3748' }}>
                About Snake AI Visualizer
            </h1>
            <p style={{ lineHeight: '1.6', color: '#4a5568' }}>
                This project allows you to play the classic Snake game or watch AI pathfinding algorithms navigate the grid to consume food safely.
            </p>
            <h2 style={{ color: '#2d3748', marginTop: '24px' }}>Implemented Algorithms</h2>
            <ul style={{ lineHeight: '1.8', color: '#4a5568' }}>
                <li><strong>Human Player:</strong> Manual control using Arrow keys or WASD with pause support (P).</li>
                <li><strong>A* Search:</strong> Uses a priority queue and Manhattan distance heuristic to find the optimal shortest path to the food while visualizing explored and expanded search frontiers.</li>
                <li><strong>Hamiltonian Cycle:</strong> Traverses a structured cycle to safely visit all board cells.</li>
            </ul>
        </div>
    );
}

export default Info;

