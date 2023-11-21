import * as model from './model';
// import { MODAL_CLOSE_SEC } from './config';
import recipeView from './views/recipeView';
import searchView from './views/searchView';
import resultView from './views/resultView';
import addRecipeView from './views/addRecipeView';
import paginationView from './views/paginationView';
import bookmarksView from './views/bookmarksView';
import 'core-js/stable';
import 'regenerator-runtime/runtime';

const recipeContainer = document.querySelector('.recipe');

if (module.hot) {
  module.hot.accept();
}

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;

    // Rendering Spinner
    recipeView.renderSpinner(recipeContainer);

    // Update results view to mark selected search result
    resultView.update(model.getSearchResults());

    // Updating bookmarks View
    bookmarksView.update(model.state.bookmarks);

    // Fetching Recipe
    await model.loadRecipe(id);

    // Rendering Recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    console.error(err);
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  // 1) Get Search Query
  const query = searchView.getQuery();

  if (!query) return;

  // 2) Load Search Results
  await model.loadSearchResults(query);

  // 3) Render Search Results
  resultView.render(model.getSearchResults());

  // 4) Render Initial Pagination Buttons
  paginationView.render(model.state.search);
};

const controlPaginationResults = function (goTo) {
  // 1) Render NEW search results
  resultView.render(model.getSearchResults(goTo));
  // 2) Render NEW pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Update serving size
  model.updateServings(newServings);

  // Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlBookmark = function () {
  // Add/Remove Bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // Update recipe view
  recipeView.update(model.state.recipe);

  // Render preview in booksmarks tab
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Shoe loading spinner
    addRecipeView.renderSpinner();

    // Upload the new recipe data
    await model.uploadRecipe(newRecipe);

    // Render recipe
    recipeView.render(model.state.recipe);

    // Render bookmarks View
    bookmarksView.render(model.state.bookmarks);

    // Push changed url to address bar
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Success Message
    addRecipeView.renderMessage();

    // Close form window
    setTimeout(function () {
      addRecipeView._toggleWindow();
    }, 2500);
  } catch (err) {
    console.error('💥', err);
    addRecipeView.renderError(err.message);
  }
};

const welcomeFeature = function () {
  console.log('Welcome to forkify');
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerBookmark(controlBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPaginationResults);
  addRecipeView._addHandlerUpload(controlAddRecipe);
  welcomeFeature();
};

init();

searchView.getQuery();
