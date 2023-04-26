export type BookEntry = {
  text: string;
  vector: string;

  index: number;
};

export function parseBookEntries(sheetData: string[][]): BookEntry[] {
  sheetData.shift();
  return sheetData.map((entry, index) => ({
    text: entry[0],
    vector: entry[1],
    index: index + 2,
  }));
}
