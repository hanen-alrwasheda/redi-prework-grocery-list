/**
 * Note to reviewer: I worked on the small project in few houres only because I had to submit the prework quickly.
 * So it may have multiple minore issues and useless logs.
 */


import functions from "./functions.js";
const { updateGroceryListElement, createAndAddToLocalStorage, clearGroceryList, toggleClearListButton } = functions;
const form = document.querySelector('#grocery-form');
const groceryList = document.querySelector('#grocery-list');
const clearGroceryListButton = document.querySelector('#remove-all-grocery-items');

// event listeners
form.addEventListener('submit', (event) => {
    event.preventDefault();
    console.log('Form submitted');
    const input = document.querySelector('#new-item-input'); // get current input value
    // create a new grocery item and add it to the local storage
    createAndAddToLocalStorage(input);
    // fill the grocery list with updated items
    updateGroceryListElement(groceryList);
    // clear the input field
    input.value = '';
});

clearGroceryListButton.addEventListener('click', () => {
    console.log('Clear grocery list button clicked');
    clearGroceryList(groceryList);
});


// loadin the grocery list on page load
window.addEventListener('DOMContentLoaded', () => {
    updateGroceryListElement(groceryList);
    toggleClearListButton(groceryList, clearGroceryListButton);
});