import { LightningElement } from "lwc";
import getRandomRecipe from "@salesforce/apex/Spoonacular.getRandomReceipe";
import getRecipeByIngredients from "@salesforce/apex/Spoonacular.getRecipeWithIngrediants";
//import getRecipeByNutrients from "@salesforce/apex/Spoonacular.findByNutrients";

export default class RecipeSearch extends LightningElement {

    recipes = [];
    fetchRandomRecipe() {
      getRandomRecipe()
        .then((data) => {
          this.recipes =
            JSON.parse(data) && JSON.parse(data).recipes
              ? JSON.parse(data).recipes
              : [];
        })
        .catch((error) => {
          console.error(error);
        });
    }
  
    fetchRecipesByIngredients() {
      const ingredients = this.template.querySelector(".ingredient-input").value;
      getRecipeByIngredients({ ingredients })
        .then((data) => {
          this.recipes = JSON.parse(data);
        })
        .catch((error) => {
          console.error(error);
        });

    //     const Nutrients = this.template.querySelector(".ingredient-input").value;
    //   getRecipeByIngredients({ ingredients })
    //     .then((data) => {
    //       this.recipes = JSON.parse(data);
    //     })
    //     .catch((error) => {
    //       console.error(error);
    //     });
    }

    
}