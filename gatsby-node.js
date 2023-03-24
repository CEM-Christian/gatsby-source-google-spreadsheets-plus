const crypto = require('crypto');
const fetchSheet = require('./lib/fetchSheet.js').default;

exports.sourceNodes = async (
  { actions },
  { spreadsheetId, credentials, apiKey, nestedWorksheets, dataTypeSuffix },
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
    sheets.worksheets.forEach((sheet) => {
      if (Array.isArray(sheet.rows)) {
        let sheetTypeSuffix = dataTypeSuffix;
        if (!sheetTypeSuffix) {
          sheetTypeSuffix = sheet.title.replace(/[\W_]+/g, '');
          sheetTypeSuffix = sheetTypeSuffix.charAt(0).toUpperCase() + sheetTypeSuffix.slice(1);
        }

        // create worksheet node
        const worksheetNode = {
          id: sheet.id,
          parent: spreadsheetNode.id,
          children: [],
          title: sheet.title,
          internal: {
            type: `googleSpreadsheet${sheetTypeSuffix}`,
            contentDigest: crypto
              .createHash('md5')
              .update(JSON.stringify(sheet))
              .digest('hex'),
          },
        };

        // create child nodes for each row in the worksheet
        sheet.rows.forEach((row, index) => {
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
    Object.entries(sheets).forEach(([name, data]) => {
      if (Array.isArray(data)) {
        name = dataTypeSuffix ? dataTypeSuffix : name.replace(/[\W_]+/g, '');

        data.forEach(row => {
          return createNode(
            Object.assign(row, {
              parent: '__SOURCE__',
              children: [],
              internal: {
                type: `google${name.charAt(0).toUpperCase()}${name.slice(
                  1,
                )}Sheet`,
                contentDigest: crypto
                  .createHash('md5')
                  .update(JSON.stringify(row))
                  .digest('hex'),
              },
            }),
          );
        });
      }
    });
    createNode(
      Object.assign(sheets, {
        parent: '__SOURCE__',
        children: [],
        internal: {
          type: 'googleSheet',
          contentDigest: crypto
            .createHash('md5')
            .update(JSON.stringify(sheets))
            .digest('hex'),
        },
      }),
    );
  }
};
