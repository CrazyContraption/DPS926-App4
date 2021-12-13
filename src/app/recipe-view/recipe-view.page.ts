import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';
import { Location } from '@angular/common';
import { SharedDataServiceService, IRecipe, ISavedRecipe } from '../shared-data-service.service';

@Component({
  selector: 'app-recipe-view',
  templateUrl: './recipe-view.page.html',
  styleUrls: ['./recipe-view.page.scss'],
})
export class RecipeViewPage {

  public Recipe: IRecipe | ISavedRecipe;

  public Saved: boolean;

  constructor(private _modelService: SharedDataServiceService, private route: ActivatedRoute, private location: Location, public actionSheetController: ActionSheetController) {
    this.Saved = false;
  }

  async ionViewWillEnter() {
    console.info("Refreshing `" + this.constructor.name + "` view...");

    let currentRoute = this.route.snapshot;

    console.log(currentRoute)

    if ('id' in currentRoute.params) { // Feched Recipe
      this.Saved = false;
      let id = parseInt(currentRoute.params.id);
      console.log(id)
      if ((!id && id != 0) || isNaN(id)) {
        await this._modelService.popup("Recipe Error", "The id provided could not be resolved or found, please try again.", "Oops");
        return;
      }
      this._modelService.getRecipeById(id, true).subscribe( recipe => {
        this.Recipe = recipe as IRecipe;
      });
    } else if ('index' in currentRoute.params) { // Saved Recipe
      this.Saved = true;
      let id = parseInt(currentRoute.params.index);
      if ((!id && id != 0) || isNaN(id)) {
        await this._modelService.popup("Recipe Error", "The index provided could not be resolved or found, please try again.", "Oops");
        return;
      }
      let response = this._modelService.getSavedRecipe(id);
      if (response instanceof Error)
        await this._modelService.popup("Service Error", response.message.replace("ERROR:", ""), "Oops");
      else
        this.Recipe = response;
    } else {
      await this._modelService.popup("Recipe Error", "The request made could not be granted, please try again.", "Oops");
    }
  }

  ionViewDidEnter() {
    console.info("Loading `" + this.constructor.name + "` view...");

    if (!this.Recipe)
      document.getElementById("waitBox").classList.remove("hidden");
    else
      document.getElementById("waitBox").classList.add("hidden");

    this.awaitContent();

    console.info("Finished loading `" + this.constructor.name + "`.");
  }

  async awaitContent(attempt: number = 0) {
    await this._modelService.sleep(500);
    if (!this.Recipe && attempt < 10)
      this.awaitContent(attempt + 1);
    else {
      document.getElementById("waitBox").classList.add("hidden");
      console.log(attempt, this.Recipe)
      if (attempt >= 10 && !document.getElementById("recipe")) {
        document.getElementById("toolbarAction").innerHTML = "";
        document.getElementById("recipeFeedback").classList.remove("hidden");
      } else {
        document.getElementById("toolbarAction").innerHTML = (this.Saved ? "DELETE" : "SAVE");
        document.getElementById("recipe").classList.remove("hidden");
      }
    }
  }

  async saveOrDelete() {
    if (this.Saved) {
      this._modelService.clearStorage(this.Recipe.id);
    } else {
      this._modelService.saveRecipe(this.Recipe);
      await this._modelService.sleep(800);
    }
    this.location.back();
  }
}