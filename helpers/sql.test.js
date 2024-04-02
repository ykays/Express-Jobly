const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("./sql");

describe("Partial Update SQL", function () {
  test("All params passed", function () {
    const update = sqlForPartialUpdate(
      {
        firstName: "UpdateFirstName",
        lastName: "UpdateLastName",
        email: "update@gmail.com",
        isAdmin: "true",
        password: "updatepassword",
      },
      {
        firstName: "first_name",
        lastName: "last_name",
        isAdmin: "is_admin",
      }
    );
    expect(update).toEqual({
      setCols:
        '"first_name"=$1, "last_name"=$2, "email"=$3, "is_admin"=$4, "password"=$5',
      values: [
        "UpdateFirstName",
        "UpdateLastName",
        "update@gmail.com",
        "true",
        "updatepassword",
      ],
    });
  });

  test("Some params passed", function () {
    const update = sqlForPartialUpdate(
      {
        firstName: "UpdateFirstName",
        lastName: "UpdateLastName",
      },
      {
        firstName: "first_name",
        lastName: "last_name",
        isAdmin: "is_admin",
      }
    );
    expect(update).toEqual({
      setCols: '"first_name"=$1, "last_name"=$2',
      values: ["UpdateFirstName", "UpdateLastName"],
    });
  });

  test("Some params passed not in 2nd parameter", function () {
    const update = sqlForPartialUpdate(
      {
        email: "update@gmail.com",
        password: "updatepassword",
      },
      {
        firstName: "first_name",
        lastName: "last_name",
        isAdmin: "is_admin",
      }
    );
    expect(update).toEqual({
      setCols: '"email"=$1, "password"=$2',
      values: ["update@gmail.com", "updatepassword"],
    });
  });

  test("No params - error", function () {
    const update = function () {
      sqlForPartialUpdate(
        {},
        {
          firstName: "first_name",
          lastName: "last_name",
          isAdmin: "is_admin",
        }
      );
    };
    expect(update).toThrow("No data");
  });
});
