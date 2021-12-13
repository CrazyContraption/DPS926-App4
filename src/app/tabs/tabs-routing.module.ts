import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'home',
    component: TabsPage,
    children: [
      {
        path: 'browser',
        loadChildren: () => import('../recipe-browser/recipe-browser.module').then(m => m.RecipeBrowserPageModule)
      },
      {
        path: 'browser/:query',
        loadChildren: () => import('../recipes-list/recipes-list-routing.module').then(m => m.RecipesListPageRoutingModule)
      },
      {
        path: 'browser/:query/:id',
        loadChildren: () => import('../recipe-view/recipe-view-routing.module').then(m => m.RecipeViewPageRoutingModule)
      },
      {
        path: 'saved',
        loadChildren: () => import('../saved-recipes/saved-recipes.module').then(m => m.SavedRecipesPageModule)
      },
      {
        path: 'saved/:index',
        loadChildren: () => import('../recipe-view/recipe-view-routing.module').then(m => m.RecipeViewPageRoutingModule)
      },
      {
        path: '',
        redirectTo: '/home/browser',
        pathMatch: 'full'
      },
    ]
  },
  {
    path: '',
    redirectTo: '/home/browser',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
