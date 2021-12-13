import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SavedRecipesPage } from './saved-recipes.page';

const routes: Routes = [
  {
    path: '',
    component: SavedRecipesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SavedRecipesPageRoutingModule {}
