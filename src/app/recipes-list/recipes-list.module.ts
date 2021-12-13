import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RecipesListPageRoutingModule } from './recipes-list-routing.module';

import { RecipesListPage } from './recipes-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RecipesListPageRoutingModule
  ],
  declarations: [RecipesListPage]
})
export class RecipesListPageModule {}
