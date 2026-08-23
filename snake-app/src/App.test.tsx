import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders snake game title and controls', () => {
  render(<App />);
  const titleElement = screen.getByRole('heading', { level: 1, name: /Snake AI/i });
  expect(titleElement).toBeInTheDocument();

  const speedLabel = screen.getByText(/Game Speed/i);
  expect(speedLabel).toBeInTheDocument();

  const humanOption = screen.getByRole('button', { name: /Human/i });
  expect(humanOption).toBeInTheDocument();

  const astarOption = screen.getByRole('button', { name: /A\* AI/i });
  expect(astarOption).toBeInTheDocument();
});
