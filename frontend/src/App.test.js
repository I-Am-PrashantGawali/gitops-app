import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

// Mock the task service so tests never hit the network
jest.mock("./services/taskServices", () => ({
  getTasks: jest.fn().mockResolvedValue({ data: [] }),
  addTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
}));

describe("App", () => {
  it("renders the TO-DO heading", async () => {
    render(<App />);
    expect(screen.getByText("TO-DO")).toBeInTheDocument();
  });

  it("renders the Add task button", () => {
    render(<App />);
    expect(screen.getByRole("button", { name: /add task/i })).toBeInTheDocument();
  });

  it("renders the task input placeholder", () => {
    render(<App />);
    expect(screen.getByPlaceholderText(/add new to-do/i)).toBeInTheDocument();
  });
});
