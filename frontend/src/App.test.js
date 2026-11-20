import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import App from './App';

vi.mock('./services/taskServices', () => ({
  getTasks:   vi.fn().mockResolvedValue({ data: [] }),
  addTask:    vi.fn().mockResolvedValue({ data: {} }),
  updateTask: vi.fn().mockResolvedValue({ data: {} }),
  deleteTask: vi.fn().mockResolvedValue({ data: {} }),
}));

describe('App', () => {
  it('renders the TO-DO heading', () => {
    render(<App />);
    expect(screen.getByText('TO-DO')).toBeInTheDocument();
  });

  it('renders the Add task button', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
  });

  it('renders the task input placeholder', () => {
    render(<App />);
    expect(screen.getByPlaceholderText(/add new to-do/i)).toBeInTheDocument();
  });
});
