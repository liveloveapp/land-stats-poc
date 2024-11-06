const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Configure PostgreSQL client using environment variables
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Use CORS middleware with default options (allows all origins)
app.use(cors());

// Parse JSON body data for POST requests
app.use(express.json());

// Route to fetch specific rows from the 'address' table
app.post('/addresses', async (req, res) => {
  const request = req.body;

  try {
    // Query the specified range of rows
    const query = `
            ${selectSql(request)}
            FROM state
              INNER JOIN county ON state.id = county.state_id
              INNER JOIN county_zipcode ON county.id = county_zipcode.county_id
              INNER JOIN zipcode ON county_zipcode.zipcode = zipcode.id
              INNER JOIN inventory_zipcode ON zipcode.id = inventory_zipcode.zipcode
              INNER JOIN listing ON inventory_zipcode.zipcode = listing.zipcode
            ${whereSql(request)}
            ${groupBySql(request)}
            ${orderBySql(request)}
            ${limitSql(request)}
        `;
    console.log({ query });
    const result = await pool.query(query);

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(result.rows)); // Send the selected rows as JSON response
  } catch (error) {
    console.error('Database query error:', error);
    res.status(500).send('Error querying the database');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

function selectSql(request) {
  var rowGroupCols = request.rowGroupCols;
  var valueCols = request.valueCols;
  var groupKeys = request.groupKeys;

  if (isDoingGrouping(rowGroupCols, groupKeys)) {
    var rowGroupCol = rowGroupCols[groupKeys.length];
    var colsToSelect = [rowGroupCol.id];

    valueCols.forEach(function (valueCol) {
      colsToSelect.push(
        valueCol.aggFunc + '(' + valueCol.id + ') AS ' + valueCol.id,
      );
    });

    return 'SELECT ' + colsToSelect.join(', ');
  }

  return 'SELECT listing.state as id, listing.street, listing.price, listing.status';
}

function whereSql(request) {
  var rowGroups = request.rowGroupCols;
  var groupKeys = request.groupKeys;
  var whereParts = [];

  if (groupKeys) {
    groupKeys.forEach(function (key, i) {
      var value = typeof key === 'string' ? "'" + key + "'" : key;

      whereParts.push(rowGroups[i].id + ' = ' + value);
    });
  }

  if (whereParts.length > 0) {
    return ' WHERE ' + whereParts.join(' AND ');
  }

  return '';
}

function groupBySql(request) {
  var rowGroupCols = request.rowGroupCols;
  var groupKeys = request.groupKeys;

  if (isDoingGrouping(rowGroupCols, groupKeys)) {
    var rowGroupCol = rowGroupCols[groupKeys.length];

    return ' GROUP BY ' + rowGroupCol.id + ' HAVING count(*) > 0';
  }

  return '';
}

function orderBySql(request) {
  var sortModel = request.sortModel;

  if (sortModel.length === 0) return '';

  var sorts = sortModel.map(function (s) {
    return s.colId + ' ' + s.sort.toUpperCase();
  });

  return ' ORDER BY ' + sorts.join(', ');
}

function limitSql(request) {
  if (request.endRow == undefined || request.startRow == undefined) {
    return '';
  }

  var blockSize = request.endRow - request.startRow;
  return ' LIMIT ' + blockSize + ' OFFSET ' + request.startRow;
}

function isDoingGrouping(rowGroupCols, groupKeys) {
  return rowGroupCols.length > groupKeys.length;
}
