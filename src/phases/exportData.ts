import * as fs from 'fs/promises';
import path from 'path';

import { exportRenamedSongs } from '../repository';

export const exportData = async (): Promise<void> => {
    console.log('Exporting data');
    const exportFile = path.join(__dirname, '..', '..', 'export.json');
    const data = await exportRenamedSongs();
    await fs.writeFile(exportFile, JSON.stringify(data));
    console.log(`Exported data was written to ${exportFile}`);
};
