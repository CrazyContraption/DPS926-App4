import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RecipeBrowserPageRoutingModule } from './recipe-browser-routing.module';

import { RecipeBrowserPage } from './recipe-browser.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RecipeBrowserPageRoutingModule
  ],
  declarations: [RecipeBrowserPage]
})
export class RecipeBrowserPageModule {}
