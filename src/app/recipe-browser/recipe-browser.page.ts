import { Component } from '@angular/core';
import { ISearchComplete, SharedDataServiceService } from '../shared-data-service.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recipe-browser',
  templateUrl: './recipe-browser.page.html',
  styleUrls: ['./recipe-browser.page.scss'],
})
export class RecipeBrowserPage {

  public Results: ISearchComplete[];

  public SearchTerm: string;

  public ShowAdminStuff: boolean;

  constructor(private _modelService: SharedDataServiceService, private router: Router) { this.Results = []; this.SearchTerm = ""; this.ShowAdminStuff = !environment.production; }

  ionViewWillEnter() {
    console.info("Refreshing `" + this.constructor.name + "` view...");
  }

  ionViewDidEnter() {
    console.info("Loading `" + this.constructor.name + "` view...");
    document.getElementById("loadCard").classList.add("hidden");
    document.getElementById("searchBox").classList.remove("hidden");
    document.getElementById("infoBox").classList.remove("hidden");
    document.getElementById("adminBox")?.classList.remove("hidden");
    console.info("Finished loading `" + this.constructor.name + "`.");
  }

  loadSearch(event) {
    document.querySelectorAll(".searchResult").forEach( element => {
      element.classList.add("hidden");
    });
    if (event.target.value && event.target.value.length > 0)
      document.getElementById("loadCard").classList.remove("hidden");
  }

  async doSearch() {
    if (!this.SearchTerm || this.SearchTerm.length <= 0) {
      document.getElementById("loadCard").classList.add("hidden");
      this.Results = [];
      return;
    }
    this._modelService.autocomplete(this.SearchTerm).subscribe( async response => {
      console.debug (response);
      if (response instanceof Error) {
        await this._modelService.popup('Search Error', '\nSomething went wrong, please try again!', 'Oops');
      } else {
        this.Results = response as ISearchComplete[];
        if (this.Results.length <= 0)
          this.Results = [{ id: -1, title: "No results found for '" + this._modelService.normalise(this.SearchTerm) + "'", imageType: "" }];
        document.getElementById("loadCard").classList.add("hidden");
        await this._modelService.sleep(200);
        document.querySelectorAll(".searchResult").forEach( element => {
          element.classList.remove("hidden");
        });
      }
    });
  }

  doAdminThing(action: string) {
    switch (action) {
      case 'rr':
        this.router.navigate(['/home/browser/random/' + Math.floor(Math.random() * 99999)]);
        break;

      case 'ps':
        this._modelService.getStats();
        break;

      case 'cs':
        this._modelService.clearStorage();
        break;
    
      default:
        console.warn("User attempted to do invalid Admin activity");
        break;
    }
  }
}
