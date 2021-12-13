import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RecipeBrowserPage } from './recipe-browser.page';

const routes: Routes = [
  {
    path: '',
    component: RecipeBrowserPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecipeBrowserPageRoutingModule {}
