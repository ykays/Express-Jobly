"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");
const Job = require("../models/job");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "new",
    salary: 100000,
    equity: 0,
    companyHandle: "c1",
  };

  test("ok for users", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "new",
        salary: 100000,
        equity: "0",
        companyHandle: "c1",
      },
    });
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        salary: 100000,
        equity: 0,
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        ...newJob,
        salary: "30000",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("unauthorized to create new company", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: "j1",
          salary: 100000,
          equity: "0",
          companyHandle: "c1",
        },
        {
          id: expect.any(Number),
          title: "j2",
          salary: 120000,
          equity: "0",
          companyHandle: "c2",
        },
        {
          id: expect.any(Number),
          title: "j3",
          salary: 130000,
          equity: "0",
          companyHandle: "c3",
        },
      ],
    });
  });
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const result = await Job.create({
      title: "j5",
      salary: 150000,
      equity: 0,
      companyHandle: "c1",
    });
    const jobId = result.id;
    const resp = await request(app).get(`/jobs/${jobId}`);
    expect(resp.body).toEqual({
      job: {
        id: jobId,
        title: "j5",
        salary: 150000,
        equity: "0",
        companyHandle: "c1",
      },
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/0`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works for users", async function () {
    const result = await Job.create({
      title: "j5",
      salary: 150000,
      equity: 0,
      companyHandle: "c1",
    });
    const jobId = result.id;
    const resp = await request(app)
      .patch(`/jobs/${jobId}`)
      .send({
        title: "j5-new",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      job: {
        id: jobId,
        title: "j5-new",
        salary: 150000,
        equity: "0",
        companyHandle: "c1",
      },
    });
  });

  test("unauth for anon", async function () {
    const result = await Job.create({
      title: "j5",
      salary: 150000,
      equity: 0,
      companyHandle: "c1",
    });
    const jobId = result.id;
    const resp = await request(app).patch(`/jobs/${jobId}`).send({
      name: "j5-new",
    });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job", async function () {
    const resp = await request(app)
      .patch(`/jobs/0`)
      .send({
        title: "j5-nope",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on salary change attempt", async function () {
    const result = await Job.create({
      title: "j5",
      salary: 150000,
      equity: 0,
      companyHandle: "c1",
    });
    const jobId = result.id;
    const resp = await request(app)
      .patch(`/jobs/${jobId}`)
      .send({
        salary: "200000",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid title", async function () {
    const result = await Job.create({
      title: "j5",
      salary: 150000,
      equity: 0,
      companyHandle: "c1",
    });
    const jobId = result.id;
    const resp = await request(app)
      .patch(`/jobs/${jobId}`)
      .send({
        title: 123,
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("anauthorized, not admin", async function () {
    const result = await Job.create({
      title: "j5",
      salary: 150000,
      equity: 0,
      companyHandle: "c1",
    });
    const jobId = result.id;
    const resp = await request(app)
      .patch(`/jobs/${jobId}`)
      .send({
        title: "j5-new",
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("error when attempt to change id", async function () {
    const result = await Job.create({
      title: "j5",
      salary: 150000,
      equity: 0,
      companyHandle: "c1",
    });
    const jobId = result.id;
    const resp = await request(app)
      .patch(`/jobs/${jobId}`)
      .send({
        id: 1,
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("error when attempt to change companyHandle", async function () {
    const result = await Job.create({
      title: "j5",
      salary: 150000,
      equity: 0,
      companyHandle: "c1",
    });
    const jobId = result.id;
    const resp = await request(app)
      .patch(`/jobs/${jobId}`)
      .send({
        companyHandle: "c2",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});
