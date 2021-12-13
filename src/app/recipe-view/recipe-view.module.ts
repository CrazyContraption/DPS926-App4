import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RecipeViewPageRoutingModule } from './recipe-view-routing.module';

import { RecipeViewPage } from './recipe-view.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RecipeViewPageRoutingModule
  ],
  declarations: [RecipeViewPage]
})
export class RecipeViewPageModule {}
