const crypto = require('crypto');
const fetchSheet = require('./lib/fetchSheet.js').default;

exports.sourceNodes = async (
  { actions },
  { spreadsheetId, credentials, apiKey, nestedWorksheets, dataTypeSuffix, excludeWorksheetPrefix },
) => {
  const { createNode } = actions;
  console.log('Fetching Google Sheet', fetchSheet, spreadsheetId);
  const sheets = await fetchSheet(spreadsheetId, credentials, apiKey, nestedWorksheets);

  if (nestedWorksheets) {
    // const fileTitle = sheets.title.replace(/[\W_]+/g, '');

    // create Google Spreadsheet node
    const spreadsheetNode = {
      id: sheets.id,
      parent: '__SOURCE__',
      children: [],
      title: sheets.title,
      internal: {
        type: `googleSpreadsheet`,
        contentDigest: crypto
          .createHash('md5')
          .update(JSON.stringify(sheets))
          .digest('hex'),
      },
    };

    // create child nodes for each worksheet
    sheets.worksheets.forEach((worksheet) => {
      if (Array.isArray(worksheet.rows) || (excludeWorksheetPrefix && !worksheet.title.toLowerCase().startsWith(excludeWorksheetPrefix.toLowerCase()))) {
        let sheetTypeSuffix = dataTypeSuffix;
        if (!sheetTypeSuffix) {
          sheetTypeSuffix = worksheet.title.replace(/[\W_]+/g, '');
          sheetTypeSuffix = sheetTypeSuffix.charAt(0).toUpperCase() + sheetTypeSuffix.slice(1);
        }

        console.log("Processing Worksheet: ", worksheet.title, " (", worksheet.id, ")");

        // create worksheet node
        const worksheetNode = {
          id: worksheet.id,
          parent: spreadsheetNode.id,
          children: [],
          title: worksheet.title,
          internal: {
            type: `googleSpreadsheet${sheetTypeSuffix}`,
            contentDigest: crypto
              .createHash('md5')
              .update(JSON.stringify(worksheet))
              .digest('hex')
          }
        };

        // create child nodes for each row in the worksheet
        worksheet.rows.forEach((row, index) => {
          const rowNode = {
            ...row, // add row data as fields to the node
            parent: worksheetNode.id,
            children: [],
            internal: {
              type: `googleSpreadsheet${sheetTypeSuffix}Row`,
              contentDigest: crypto
                .createHash('md5')
                .update(JSON.stringify(row))
                .digest('hex'),
            }
          };
          worksheetNode.children.push(rowNode.id); // add row as child of worksheet
          createNode(rowNode);
        });

        spreadsheetNode.children.push(worksheetNode.id); // add worksheet as child of spreadsheet
        createNode(worksheetNode);
      }
    });

    createNode(spreadsheetNode);
  } else {
    // sheets = a single worksheet
    Object.entries(sheets).forEach(([name, data]) => {
      let sheetTypeSuffix = dataTypeSuffix;
      if (!sheetTypeSuffix) {
        sheetTypeSuffix = name.replace(/[\W_]+/g, '');
        sheetTypeSuffix = sheetTypeSuffix.charAt(0).toUpperCase() + sheetTypeSuffix.slice(1);
      }

      const worksheetNode = Object.assign(sheets, {
        parent: `googleSpreadsheet${sheetTypeSuffix}`,
        children: [],
        internal: {
          type: 'googleSpreadsheet',
          contentDigest: crypto
            .createHash('md5')
            .update(JSON.stringify(sheets))
            .digest('hex'),
        }
      });

      if (Array.isArray(data)) {
        data.forEach(row => {
          // Add each row as a child of the worksheet node
          worksheetNode.children.push(row.id);

          // Create the row node
          return createNode(Object.assign(row, {
            parent: worksheetNode.id,
            children: [],
            internal: {
              type: `googleSpreadsheet${sheetTypeSuffix}Row`,
              contentDigest: crypto
                .createHash('md5')
                .update(JSON.stringify(row))
                .digest('hex'),
            },
          }));
        });
      }
      // Finally, create the worksheet node
      createNode(worksheetNode);
    });
  }
};
