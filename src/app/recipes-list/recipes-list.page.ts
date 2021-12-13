import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';
import { IRecipe, ISearchResult, ISearchResults, SharedDataServiceService } from '../shared-data-service.service';

@Component({
  selector: 'app-recipes-list',
  templateUrl: './recipes-list.page.html',
  styleUrls: ['./recipes-list.page.scss'],
})
export class RecipesListPage implements OnInit {

  public FoundRecipes: ISearchResult[];

  constructor(private _modelService: SharedDataServiceService, private route: ActivatedRoute, private router: Router, public actionSheetController: ActionSheetController) { this.FoundRecipes = []; }

  ngOnInit(): void {
    this.FoundRecipes = [];
  }

  async ionViewWillEnter() {
    console.info("Refreshing `" + this.constructor.name + "` view...");

    let currentRoute = this.route.snapshot;
    let id = parseInt(currentRoute.queryParams.id);

    console.debug(currentRoute)

    if (!id || isNaN(id)) {
      await this._modelService.popup("Recipes Error", "The id provided could not be resolved or found, please try again.", "Oops");
      return;
    }
    
    if (this.FoundRecipes.length <= 0 || this.FoundRecipes[0].id != id) {
      this._modelService.analyzeSearchQuery(currentRoute.params.query).subscribe( analyzedSearch => {
        this._modelService.doFullSearch(id, analyzedSearch, Math.max(Math.min(currentRoute.queryParams.page ?? 0, 900), 0)).subscribe( results => {
          if (results[0] instanceof Error || results[1] instanceof Error) {
            this._modelService.popup("Recipes Error", "We encountered a fatal issue! Please try again later.", "Oops");
          } else {
            this.FoundRecipes = [];
            this.FoundRecipes.push(results[0] as IRecipe);
            if ('results' in results[1]) {// if true, is ISearchResults
              (results[1] as ISearchResults).results.forEach( result => {
                result.image = result.image.replace("312x231", "556x370");
                this.FoundRecipes.push(result);
              });
            } else { // is IRecipe[] instead
              (results[1] as IRecipe[]).forEach( recipe => {
                this.FoundRecipes.push(recipe);
              });
            } 
          }
        });
      });
    }
  }

  ionViewDidEnter() {
    console.info("Loading `" + this.constructor.name + "` view...");

    if (this.FoundRecipes.length <= 0)
      document.getElementById("loadBox")?.classList.remove("hidden");
    else
      document.getElementById("loadBox")?.classList.add("hidden");

    this.awaitContent();

    console.info("Finished loading `" + this.constructor.name + "`.");
  }

  async awaitContent(attempt: number = 0) {
    await this._modelService.sleep(500);
    if (this.FoundRecipes.length <= 0 && attempt < 10)
      this.awaitContent(attempt + 1);
    else {
      document.getElementById("loadBox")?.classList.add("hidden");
      if (attempt >= 10)
        document.getElementById("searchFeedback")?.classList.remove("hidden");
      else
        document.querySelectorAll(".recipeResult")?.forEach( element => {
          element.classList.remove("hidden");
        });
    }
  }

  async viewRecipe(index: number) {
    document.querySelectorAll(".recipeResult")[index].classList.add("active");
    const actionSheet = await this.actionSheetController.create({
      header: this._modelService.normalise(this.FoundRecipes[index].title),
      buttons: [
        {
          text: 'View Recipe',
          role: 'view',
          icon: 'share'
        },
        {
          text: 'Save Recipe',
          role: 'save',
          icon: 'heart'
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
    document.querySelectorAll(".recipeResult")?.forEach( element => {
      element.classList.remove("active");
    });
    let currentRoute = this.route.snapshot;
    switch (role) {
      case "view":
        this.router.navigate(['/home/browser/' + currentRoute.params.query + '/' + this.FoundRecipes[index].id]);
        break;

      case "save":
        this._modelService.getRecipeById(this.FoundRecipes[index].id).subscribe( recipeToSave => {
          this._modelService.saveRecipe(recipeToSave);
        });
        break;
    }
  }
}
