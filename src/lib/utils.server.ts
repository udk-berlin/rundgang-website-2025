import { appendFileSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

export function logger(input: unknown): void {
	if (typeof window !== 'undefined') return;
	const logPath = join(process.cwd(), 'app.log');
	if (!existsSync(logPath)) {
		writeFileSync(logPath, '', { encoding: 'utf8' });
	}
	const entry = `[${new Date().toISOString()}] ${typeof input === 'string' ? input : JSON.stringify(input)}\n`;
	appendFileSync(logPath, entry, { encoding: 'utf8' });
	console.log(input);
}
