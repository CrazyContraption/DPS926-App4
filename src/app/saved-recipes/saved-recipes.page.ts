import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';
import { ISavedRecipe, SharedDataServiceService } from '../shared-data-service.service';

@Component({
  selector: 'app-saved-recipes',
  templateUrl: './saved-recipes.page.html',
  styleUrls: ['./saved-recipes.page.scss'],
})
export class SavedRecipesPage {

  public SavedRecipes: ISavedRecipe[];

  constructor(private _modelService: SharedDataServiceService, private router: Router, public actionSheetController: ActionSheetController) { this.SavedRecipes = []; }

  async ionViewWillEnter() {
    console.info("Refreshing `" + this.constructor.name + "` view...");
    await this._modelService.sleep(100);
    let results = this._modelService.getSavedRecipes();
    if (results instanceof Error) {
      this._modelService.popup("Storage Error", "Something went horribly wrong with your local storage, try restarting the app, or reinstalling.", "Oops")
    } else {
      this.SavedRecipes = results as ISavedRecipe[];
    }
  }

  async ionViewDidEnter() {
    await this._modelService.sleep(200);
    console.info("Loading `" + this.constructor.name + "` view...");
    if (!this.SavedRecipes || this.SavedRecipes.length <= 0)
      document.getElementById("helpBox")?.classList.add("hidden");
    else
      document.querySelectorAll(".savedRecipe")?.forEach( element => {
        element.classList.remove("hidden");
      });
    console.info("Finished loading `" + this.constructor.name + "`.");
  }

  async viewRecipe(index: number) {
    console.log(this.SavedRecipes)
    document.querySelectorAll(".savedRecipe")[index].classList.add("active");
    const actionSheet = await this.actionSheetController.create({
      header: this._modelService.normalise(this.SavedRecipes[index].title),
      buttons: [
        {
          text: 'View Recipe',
          role: 'view',
          icon: 'share'
        },
        {
          text: 'Delete Recipe',
          role: 'delete',
          icon: 'trash'
        },
        {
          text: 'Edit Recipe',
          role: 'view',
          icon: 'pencil'
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel'
        },
      ],
    });
    await actionSheet.present();
    const { role } = await actionSheet.onDidDismiss();
    document.querySelectorAll(".savedRecipe").forEach( element => {
      element.classList.remove("active");
    });
    switch (role) {
      case "view":
      case "edit":
        // Navigate to index
        this.router.navigate(['/home/saved/' + index]);
        break;

      case "delete":
        document.querySelectorAll(".savedRecipe")[index].classList.add("hidden");
        console.log(index)
        await this._modelService.sleep(701);
        this._modelService.clearStorage(this.SavedRecipes[index].id);
        //this.SavedRecipes.splice(index, 1);
        document.querySelectorAll(".savedRecipe")[index].classList.remove("hidden");
        break;
    }
  }
}
