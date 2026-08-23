import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders snake game title and controls', () => {
  render(<App />);
  const titleElement = screen.getByText(/Snake Game AI/i);
  expect(titleElement).toBeInTheDocument();
  
  const speedLabel = screen.getByText(/Select Speed/i);
  expect(speedLabel).toBeInTheDocument();

  const humanOptions = screen.getAllByText(/Human/i);
  expect(humanOptions.length).toBeGreaterThanOrEqual(1);

  const instructions = screen.getByText(/Press ENTER to start playing/i);
  expect(instructions).toBeInTheDocument();
});

