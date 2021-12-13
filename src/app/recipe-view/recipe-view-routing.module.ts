import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RecipeViewPage } from './recipe-view.page';

const routes: Routes = [
  {
    path: '',
    component: RecipeViewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecipeViewPageRoutingModule {}
