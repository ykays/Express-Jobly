"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */
describe("create", function () {
  const newJob = {
    title: "new_title",
    salary: 90000,
    equity: 0,
    companyHandle: "c1",
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    let jobId = job.id;
    expect(job).toEqual({
      id: jobId,
      title: "new_title",
      salary: 90000,
      equity: "0",
      companyHandle: "c1",
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
             FROM jobs
             WHERE id = ${jobId}`
    );
    expect(result.rows).toEqual([
      {
        id: jobId,
        title: "new_title",
        salary: 90000,
        equity: "0",
        company_handle: "c1",
      },
    ]);
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let filter = {};
    let jobs = await Job.findAll(filter);
    expect(jobs).toEqual([
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
    ]);
  });

  test("works: title filter", async function () {
    let filter = { title: "1" };
    let jobs = await Job.findAll(filter);
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "j1",
        salary: 100000,
        equity: "0",
        companyHandle: "c1",
      },
    ]);
  });

  test("works: minSalary filter", async function () {
    let filter = { minSalary: "110000" };
    let jobs = await Job.findAll(filter);
    expect(jobs).toEqual([
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
    ]);
  });

  test("works: hasEquity: true filter", async function () {
    let filter = { hasEquity: "true" };
    let jobs = await Job.findAll(filter);
    expect(jobs).toEqual([]);
  });

  test("works: hasEquity: false filter", async function () {
    let filter = { hasEquity: "false" };
    let jobs = await Job.findAll(filter);
    expect(jobs).toEqual([
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
    ]);
  });
  test("works: all filters filter", async function () {
    let filter = { title: "3", minSalary: "100000", hasEquity: "false" };
    let jobs = await Job.findAll(filter);
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "j3",
        salary: 130000,
        equity: "0",
        companyHandle: "c3",
      },
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get("1");
    expect(job).toEqual({
      id: 1,
      title: "j1",
      salary: 100000,
      equity: "0",
      companyHandle: "c1",
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get("0");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    title: "New",
    salary: 200000,
    equity: 1,
  };

  test("works", async function () {
    let job = await Job.update("1", updateData);
    expect(job).toEqual({
      id: 1,
      title: "New",
      salary: 200000,
      equity: "1",
      companyHandle: "c1",
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
        FROM jobs
        WHERE id = 1`
    );
    expect(result.rows).toEqual([
      {
        id: 1,
        title: "New",
        salary: 200000,
        equity: "1",
        company_handle: "c1",
      },
    ]);
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(0, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update("1", {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove("1");
    const res = await db.query("SELECT id FROM jobs WHERE id=1");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove("0");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
