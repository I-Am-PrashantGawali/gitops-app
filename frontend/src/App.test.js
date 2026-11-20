import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock the task service — must return { data: [] } to match
// the destructuring in Tasks.js:  const { data } = await getTasks()
jest.mock('./services/taskServices', () => ({
  getTasks:    jest.fn().mockResolvedValue({ data: [] }),
  addTask:     jest.fn().mockResolvedValue({ data: {} }),
  updateTask:  jest.fn().mockResolvedValue({ data: {} }),
  deleteTask:  jest.fn().mockResolvedValue({ data: {} }),
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
