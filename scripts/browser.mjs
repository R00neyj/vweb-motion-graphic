import { chromium } from 'playwright';
import fs from 'node:fs';
const local = process.env.LOCALAPPDATA + '/ms-playwright/chromium-1234/chrome-win64/chrome.exe';
export const launch = () => chromium.launch(fs.existsSync(local) ? { executablePath: local } : {});
