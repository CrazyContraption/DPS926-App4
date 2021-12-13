import { Injectable } from '@angular/core';
import { toastController } from '@ionic/core';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Storage } from '@ionic/storage';

import { Observable, of, zip } from 'rxjs';
import { retry, catchError } from "rxjs/operators";
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

export interface ISearchComplete {
  id: number;
  title: string;
  imageType?: string;
}

export interface ISearchResult extends ISearchComplete {
  calories?: number;
  carbs?: string;
  fat?: string;
  image: string;
  protein?: string;
}

export interface ISearchResults extends ISearchComplete {
  offset: number;
  number?: number;
  results: ISearchResult[];
  totalResults?: number;
}

export interface IRecipe extends ISearchResult {
  vegitarian?: boolean;
  vegan?: boolean;
  glutenFree?: boolean;
  dairyFree?: boolean;
  veryPopular?: boolean;
  sustainable?: boolean;
  weightWatcherPoints?: number;
  lowFodmap?: boolean;
  likes?: number;
  spoonScore?: number;
  healthScore?: number;
  creditsText?: string;
  license?: string;
  sourceName?: string;
  pricePerServing?: number;
  summary?: string;
  Instructions?: string;
}

export interface ISet {
  image?: string;
  include?: boolean;
  name: string;
}

export interface IAnalysis {
  dishes: ISet[];
  ingredients?: ISet[];
  cuisines?: ISet[];
  modifiers?: ISet[];
}

export interface ISavedRecipe extends IRecipe {
  notes?: string;
}

interface IParam {
  param: string;
  value: string;
}

@Injectable({
  providedIn: 'root'
})
export class SharedDataServiceService implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((err: any) => {
        if(err instanceof HttpErrorResponse) {
          console.error(err);
          if (err.error?.code == 402)
          SharedDataServiceService._API_KEY = "1febd37b3f8e478eab12e086f470071d";
          req.url.replace("2fa953be9058495c8061f04d871144fa", "1febd37b3f8e478eab12e086f470071d");
          req.urlWithParams.replace("2fa953be9058495c8061f04d871144fa", "1febd37b3f8e478eab12e086f470071d");
        }
        return of(err);
      }
    ), retry(2)) as Observable<HttpEvent<any>>;
  }

  private static _API_KEY: string = "2fa953be9058495c8061f04d871144fa";
  private _URL: string = "https://api.spoonacular.com/";
  private _STORAGE_NAME: string = "SpoonacularSavedRecipes";

  private _saved_recipes: ISavedRecipe[] = [];
  private static _idCount: number = 0;

  private _HEADERS = new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  });

  constructor(private _client: HttpClient, private _storage: Storage, private router: Router, public alertController: AlertController) {
    this.loadLocalData();
    for (let index = 0; index < this._saved_recipes.length; index++) {
      if (this._saved_recipes[index].id > SharedDataServiceService._idCount)
        SharedDataServiceService._idCount = this._saved_recipes[index].id;
    }
    SharedDataServiceService._idCount++;
  }

  private loadLocalData() {
    this._saved_recipes = [];
    this._storage.get(this._STORAGE_NAME).then((recipes) => {
      this._saved_recipes = recipes as ISavedRecipe[];
      if (!this._saved_recipes || this._saved_recipes == null)
        this._saved_recipes = [];
    });
  }

  private buildURI(params: IParam[], route: string): string {
    let builder = "?";
    params.push({param: "apiKey", value:SharedDataServiceService._API_KEY});
    params.forEach(param => {
      if (builder.length > 1)
        builder += "&";
      builder += param.param + '=' + param.value;
    });
    return this._URL + route + builder.toString();
  }

  getSavedRecipes(): ISavedRecipe[] {
    return this._saved_recipes;
  }

  getSavedRecipe(id: number): ISavedRecipe | undefined | Error {
    if (!this._saved_recipes)
      return new Error("ERROR:\nSaved recipes hasn't been initialised yet.");
    if (id < 0 || id >= this._saved_recipes.length)
      return new Error("ERROR:\nProvided recipe id was outside of acceptable ranges.");
    return this._saved_recipes[id];
  }

  getRecipeById(id: number, includeNutrition: boolean = false): Observable<IRecipe> {
    return this._client.get<IRecipe>(this.buildURI([
      { param: "includeNutrition", value: includeNutrition ? "true" : "false" }
    ], "recipes/" + id + "/information"), { headers: this._HEADERS });
  }

  saveRecipe(recipe: IRecipe): undefined | Error {
    recipe.id = SharedDataServiceService._idCount;
    SharedDataServiceService._idCount++;
    console.debug("Saving recipe with ID: " + recipe.id, recipe);
    this._saved_recipes.unshift(recipe);
    this.syncStorage();
    this.popup("Success!", "Successfully added recipe to your saved items!", "3000");
    return;
  }

  private syncStorage(): undefined | Error {
    console.debug("Syncing storage...");
    this._storage.set(this._STORAGE_NAME, this._saved_recipes);
    return;
  }

  autocomplete(searchTerm: string): Observable<ISearchComplete[]> {
    return this._client.get<ISearchComplete[]>(this.buildURI([
      { param: "query", value: this.normalise(searchTerm) }
    ], "recipes/autocomplete"), { headers: this._HEADERS });
  }

  // Combines 3 different calls, and zips the responses together into one observable for best search potential!
  doFullSearch(id: number, analyzedSearch?: IAnalysis, page: number = 0): Observable<[IRecipe, ISearchResults | IRecipe[]]> {
    let secondaryRequest: Observable<ISearchResults | IRecipe[]>;
    if (analyzedSearch && analyzedSearch.dishes.length > 0)
      secondaryRequest = this._client.get<ISearchResults>(this.buildURI([
        { param: "query", value: analyzedSearch.dishes[0].name },
        { param: "sort", value: "popularity"}

        // TODO: Implement other analyzedSearch properties into search request here

      ], "recipes/complexSearch"), { headers: this._HEADERS })
    else 
      secondaryRequest = this._client.get<IRecipe[]>(this.buildURI([
        { param: "query", value: "10" }
      ], "recipes/" + id + "/similar"), { headers: this._HEADERS })
    return zip( // Zips the two observables together, and resolves subscribers when both conclude
      this.getRecipeById(id),
      secondaryRequest
    );
  }

  // Breaks down a search query to reveal true intentions of the search terms, gramatically
  analyzeSearchQuery(query: string): Observable<IAnalysis> {
    return this._client.get<IAnalysis>(this.buildURI([
      { param: "q", value: this.normalise(query) }
    ], "recipes/queries/analyze"), { headers: this._HEADERS });
  }

  // Pops up an alert if provided a button text, or a toast if given a time, defaults to a toast
  async popup(heading: string, body: string, buttonOrTime?: string) {
    let time = parseInt(buttonOrTime);
    if (buttonOrTime && !time) {
      const alert = await this.alertController.create({
        header: heading,
        subHeader: '',
        message: body,
        buttons: [buttonOrTime],
      });
      await alert.present();
    }
    else {
      const toast = await toastController.create({
        header: heading,
        message: body,
        color: 'dark',
        duration: (time ?? 3000)
      });
      await toast.present();
    }
  }

  normalise(dirtyInput: string): string {
    return dirtyInput.replace('"','').replace('<','').replace('>','').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  async sleep(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  getStats() {
    console.info("=== START SERVICE INFO ===");
    console.info("Storage Label: ", this._STORAGE_NAME);
    console.info("API Endpoint URL: ", this._URL);
    console.info("Storage info", this._saved_recipes);
    console.info("=== END SERVICE INFO ===");
  }

  clearStorage(id?: number) {
    if (id || id == 0) {
      console.warn("Clearing storage id #" + id);
      if (id >= 0)
        for (let index = 0; index < this._saved_recipes.length; index++) {
          if (this._saved_recipes[index].id == id) {
            this._saved_recipes.splice(index, 1);
            console.debug(this._saved_recipes)
            this.syncStorage();
            console.info("Cleared storage item");
            return;
          }
        }
        
    } else {
      console.warn("Clearing local storage...");
      this._storage.clear().then( () => {
        this._saved_recipes = [];
        this.syncStorage();
        SharedDataServiceService._idCount = 0;
        console.info("Cleared local storage");
      });
    }
  }
}