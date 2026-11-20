/**
 * Backend unit tests for the /api/tasks routes.
 *
 * Uses jest + supertest.  MongoDB is mocked with mongoose-mock so no real
 * database is required in CI.
 */
const request = require("supertest");

// ── mock mongoose before importing app code ──────────────────────────────────
jest.mock("../db", () => jest.fn().mockResolvedValue(undefined));

// Mock the Task model
const mockTask = {
  _id: "abc123",
  task: "Write tests",
  completed: false,
  save: jest.fn(),
};

jest.mock("../models/task", () => {
  const MockTask = jest.fn().mockImplementation((data) => ({
    ...mockTask,
    ...data,
    save: jest.fn().mockResolvedValue({ ...mockTask, ...data }),
  }));
  MockTask.find = jest.fn().mockResolvedValue([mockTask]);
  MockTask.findOneAndUpdate = jest.fn().mockResolvedValue(mockTask);
  MockTask.findByIdAndDelete = jest.fn().mockResolvedValue(mockTask);
  // new Task(data).save() is called in the POST handler
  MockTask.prototype.save = jest.fn().mockResolvedValue(mockTask);
  return MockTask;
});

// Import the express app AFTER mocks are in place
const express = require("express");
const cors = require("cors");
const tasksRouter = require("../routes/tasks");

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use(cors());
  app.get("/ok", (_req, res) => res.status(200).send("ok"));
  app.use("/api/tasks", tasksRouter);
  return app;
}

// ── tests ─────────────────────────────────────────────────────────────────────
describe("GET /ok", () => {
  it("returns 200 ok", async () => {
    const app = buildApp();
    const res = await request(app).get("/ok");
    expect(res.status).toBe(200);
    expect(res.text).toBe("ok");
  });
});

describe("GET /api/tasks", () => {
  it("returns an array of tasks", async () => {
    const app = buildApp();
    const res = await request(app).get("/api/tasks");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toMatchObject({ task: "Write tests", completed: false });
  });
});

describe("POST /api/tasks", () => {
  it("creates a new task and returns it", async () => {
    const app = buildApp();
    const res = await request(app)
      .post("/api/tasks")
      .send({ task: "Write tests" });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ task: "Write tests" });
  });
});

describe("PUT /api/tasks/:id", () => {
  it("updates a task and returns the original", async () => {
    const app = buildApp();
    const res = await request(app)
      .put("/api/tasks/abc123")
      .send({ completed: true });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ _id: "abc123" });
  });
});

describe("DELETE /api/tasks/:id", () => {
  it("deletes a task and returns it", async () => {
    const app = buildApp();
    const res = await request(app).delete("/api/tasks/abc123");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ _id: "abc123" });
  });
});
