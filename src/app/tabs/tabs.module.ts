import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TabsPageRoutingModule } from './tabs-routing.module';

import { TabsPage } from './tabs.page';
import { RecipesListPage } from '../recipes-list/recipes-list.page';
import { RecipeViewPage } from '../recipe-view/recipe-view.page';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TabsPageRoutingModule
  ],
  declarations: [TabsPage, RecipesListPage, RecipeViewPage]
})
export class TabsPageModule {}
