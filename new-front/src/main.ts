(window as any).global = window;
(window as any).process = {
  env: { DEBUG: undefined },
};
import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app.module';

platformBrowser()
  .bootstrapModule(AppModule)
  .catch((err: unknown) => console.error(err));
