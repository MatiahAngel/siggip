import { Router } from 'express';
const r = Router();
r.get('/', (_, res) => res.json({ status: 'ok' }));
export default r;
