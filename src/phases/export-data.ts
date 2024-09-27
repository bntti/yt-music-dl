import * as fs from 'node:fs/promises';
import path from 'node:path';

import { PROJECT_ROOT } from '../config';
import { exportRenamedSongs } from '../repository';

export const exportData = async (): Promise<void> => {
    console.log('Exporting data');
    const exportFile = path.join(PROJECT_ROOT, 'export.json');
    const data = await exportRenamedSongs();
    await fs.writeFile(exportFile, JSON.stringify(data));
    console.log(`Exported data was written to ${exportFile}`);
};
