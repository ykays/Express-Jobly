const { BadRequestError } = require("../expressError");

// Helper function that creates SQL values for a partial update
// Takes the req.body data coming from the patch request and:
// 1. checks if there is anything to be updated, if not -> error
// 2. If there is data to change, prepares two things for SQL update statements:
////1. setCols - which are column names to be used directly in the UPDATE SQL query ($1, $2, etc)
////////-as the 2nd parameter passed to a function are only 3 columns (firstName, lastName, isAdmin)
/////// if anything outside of these 3 items is changed, it will also be added to setCols
////2. values - which will contain the actual values, included at the end of an Update statement in []

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
