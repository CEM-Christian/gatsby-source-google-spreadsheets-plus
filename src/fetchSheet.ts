import {
  // GoogleSpreadsheet,
  // GoogleSpreadsheetRow,
  GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet';
// import { ColumnTypes } from './columnTypes.d';
import { cleanRows } from './fetchSheet/cleanRows';
import { getSpreadsheet } from './fetchSheet/get';
import { hash } from './fetchSheet/hash';

export default async (
  spreadsheetId: string,
  credentials?: object,
  apiKey?: string,
  nestedWorksheets?: boolean,
) => {
  const spreadsheet = await getSpreadsheet(spreadsheetId, credentials, apiKey);
  const sheets: { [title: string]: object }[] = await Promise.all(
    spreadsheet.sheetsByIndex.map(
      async (worksheet: GoogleSpreadsheetWorksheet) => {
        const rows = await worksheet.getRows({});
        return {
          [worksheet.title]: cleanRows(rows).map((row, id) =>
            Object.assign(row, {
              id: hash(`${spreadsheetId}-${worksheet.sheetId}-${id}`),
            }),
          ),
        };
      },
    ),
  );
  if (nestedWorksheets) {
    return {
      id: hash(spreadsheetId),
      title: spreadsheet.title,
      worksheets: sheets.map(sheet => {
        return {
          sheetTitle: Object.keys(sheet)[0],
          rows: Object.values(sheet)[0],
        };
      }),
    };
  } else {
    return Object.assign({}, ...sheets, {
      id: hash(spreadsheetId),
    });
  }
};
