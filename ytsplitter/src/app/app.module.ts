import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import {ClipboardModule} from '@angular/cdk/clipboard';

import {MatCardModule} from '@angular/material/card';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MusicPlayerModule } from './music-player/music-player.module';
import { ContextFormComponent } from './context-form/context-form.component';
import { ContextGuard } from './service/context.guard';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BasicAuthInterceptor } from './service/basic-auth.interceptor';

@NgModule({
  declarations: [AppComponent, ContextFormComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ClipboardModule,

    HttpClientModule,

    MusicPlayerModule,

    MatCardModule,
    MatIconModule,
    MatButtonModule,

    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,

    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
    }),
    RouterModule.forRoot([
    {
        path: '',
        component: HomeComponent,
    },
    {
      path: 'context',
      component: ContextFormComponent,
    },
    {
        path: 'splitter',
        canActivate: [ContextGuard],
        loadChildren: () => import('./splitter/splitter.module').then((m) => m.SplitterModule),
    },
    {
       path: 'explorer',
       canActivate: [ContextGuard],
       loadChildren: () => import('./music-explorer/music-explorer.module').then((m) => m.MusicExplorerModule),
    }
], { relativeLinkResolution: 'legacy' }),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: BasicAuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
