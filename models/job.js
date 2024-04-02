"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, company_handle}
   *
   * Returns { id,  title, salary, equity, company_handle}
   *
   * */

  static async create({ title, salary, equity, companyHandle }) {
    const result = await db.query(
      `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle as "companyHandle"`,
      [title, salary, equity, companyHandle]
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all companies
   * with optional filtering:
   * title - any part of the title
   * minSalary
   * hasEquity - if set to true then return jobs with Equity diff than 0, otherwise ignore
   */
  static async findAll(query) {
    let whereStatement = "";
    if (query.title) {
      whereStatement.length === 0
        ? (whereStatement += `WHERE title ilike '%${query.title}%'`)
        : (whereStatement += `and title ilike '%${query.title}%'`);
    }
    if (query.minSalary) {
      whereStatement.length === 0
        ? (whereStatement += `WHERE salary >= ${query.minSalary}`)
        : (whereStatement += `and salary >= ${query.minSalary}`);
    }

    if (query.hasEquity) {
      if (query.hasEquity === "true") {
        whereStatement.length === 0
          ? (whereStatement += `WHERE equity > 0`)
          : (whereStatement += `and equity > 0`);
      }
    }

    const jobs = await db.query(
      `SELECT id, title, salary, equity, company_handle as "companyHandle" 
      FROM jobs
      ${whereStatement}`
    );
    return jobs.rows;
  }

  // Find one job based on an id
  static async get(id) {
    const results = await db.query(
      `SELECT id, title, salary, equity, company_handle as "companyHandle" FROM jobs
           WHERE id = $1`,
      [id]
    );

    const job = results.rows[0];

    if (!job) throw new NotFoundError(`No job id: ${id}`);

    return job;
  }

  /** Update the job details
   * id cannot be changed - error if it is part of request
   * company cannot be changed - error if it is part of request
   *
   * */
  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {
      title: "title",
      salary: "salary",
      equity: "equity",
    });
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, 
                                title, 
                                salary, 
                                equity, 
                                company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job id: ${id}`);

    return job;
  }

  static async remove(id) {
    const result = await db.query(
      `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
      [id]
    );
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job id: ${id}`);
  }
}

module.exports = Job;
