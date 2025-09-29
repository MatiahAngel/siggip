import app from './app.js';
import { cfg } from './configuracion/entorno.js';
import { dbConnect } from './configuracion/baseDatos.js';

(async () => {
  await dbConnect();
  app.listen(cfg.port, () => {
    console.log(`API http://localhost:${cfg.port}`);
  });
})();
