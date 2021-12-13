import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SavedRecipesPageRoutingModule } from './saved-recipes-routing.module';

import { SavedRecipesPage } from './saved-recipes.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SavedRecipesPageRoutingModule
  ],
  declarations: [SavedRecipesPage]
})
export class SavedRecipesPageModule {}
