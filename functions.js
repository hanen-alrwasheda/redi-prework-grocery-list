
// create new grocery item and add it to the local storage
const createAndAddToLocalStorage = (input) => {
    // validate input 
    if (input.value === '') {
        notify('Please enter a grocery item', 'error');
        return;
    }
    // create a new grocery item
    const createdAt = new Date().toISOString(); // to keep the items sorted
    const title = input.value;
    addToLocalStorage({ title, createdAt });
}

const formatDate = (date) => {
    return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    }).replace(",", "");
}

const updateGroceryListElement = (groceryList) => {
    const groceryItems = getGroceryItems();
    if (groceryItems.length === 0) {
        console.log('No grocery items found');
        return;
    }
    const sortedGroceryItems = sortGroceryItemsByDate(groceryItems, 'createdAt'); // mostly not needed because adding to local storage is already sorted
    groceryList.innerHTML = "";  // clear the list before adding new items to avoid duplicates
    let elementCount = 0; // add as suffix to each element and its child-elements to locate elements easily when deleting or editing
    groceryItems.forEach((groceryObj) => {
        const newGroceryElement = document.createElement('li');
        newGroceryElement.classList.add('grocery-item');
        newGroceryElement.id = `grocery-item-${elementCount}` // ? maybe a bad idea to use a counter to locate needed elements when editing or removing?
        const formattedDate = formatDate(new Date(groceryObj.createdAt));
        const title = groceryObj.title;
        newGroceryElement.innerHTML = `
        <div class="adding-mode mode">
            <div class="mode-container">
                <div class="grocery-item-data">
                    <p class="grocery-item-title">${title}</p>
                    <p class="grocery-item-creation-date">created at: ${formattedDate}</p> <!-- todo: show only on hover? -->
                </div>
                <div class="grocery-item-buttons flex-buttons">
                    <button id="grocery-item-edit-button-${elementCount}" class="button grocery-item-edit-button">
                    edit
                    </button>
                    <button id="grocery-item-delete-button-${elementCount}" class="button grocery-item-delete-button">
                    delete
                    </button>
                </div>
            </div>
        </div>
        <div class="editing-mode mode" hidden>
            <div class="mode-container">
                <div class="grocery-item-edit-input-container">
                    <input type="text" class="grocery-item-edit-input" value="${title}">
                </div>
                <div class="grocery-item-edit-buttons flex-buttons">
                    <button id="grocery-item-edit-button-save-${elementCount}" class="button grocery-item-edit-button-save">
                    save
                    </button>
                    <button id="grocery-item-edit-button-cancel-${elementCount}" class="button grocery-item-edit-button-cancel">
                    cancel
                    </button>
                </div>
            </div>
        </div>
        `;
        // add event listeners to the buttons in normal adding mode
        const editButton = newGroceryElement.querySelector(`.grocery-item-edit-button`);
        editButton.addEventListener('click', (event) => {
            console.log('Edit button clicked');
            editGroceryItem(event.target);
        });
        const deleteButton = newGroceryElement.querySelector(`.grocery-item-delete-button`);
        deleteButton.addEventListener('click', (event) => {
            console.log('Delete button clicked');
            deleteGroceryItem(event.target);
        });
        // add event listeners to the buttons in editing mode
        const saveButton = newGroceryElement.querySelector(`.grocery-item-edit-button-save`);
        saveButton.addEventListener('click', (event) => {
            console.log('Save button clicked');
            // collect data
            const itemIndex = getElementIndex(event.target); // index of button will be same as index of item
            const item = document.querySelector(`#grocery-item-${itemIndex}`);
            console.log("🚀 ~ saveButton.addEventListener ~ item:", item)
            const input = item.querySelector('.grocery-item-edit-input'); // get the input field
            const newTitle = input.value; // get the new title
            console.log("🚀 ~ saveButton.addEventListener ~ newTitle:", newTitle)
            // TODO: Maybe add updatedAt field to the item instead of keeping the original createdAt? 
            // update local storage and UI
            const groceryItems = getGroceryItems();
            // search if any item with the same new title already exists
            // TODO: Maybe it would be better to throw no 'item exists' error if no changes were made to the current title? 
            const foundIndex = groceryItems.findIndex((groceryItem) => groceryItem.title === newTitle);
            console.log("🚀 ~ saveButton.addEventListener ~ foundIndex:", foundIndex)
            if (foundIndex !== -1) { // if item already exists in local storage simply do nothing
                console.log('Item already exists in local storage');
                notify('Item already exists', 'error');
                return;
            }
            // find the item and update it
            const itemToUpdate = groceryItems[parseInt(itemIndex)];
            deleteFromLocalStorage(itemToUpdate); // delete the old item from local storage
            itemToUpdate.title = newTitle;
            addToLocalStorage(itemToUpdate, true); // update the item in local storage
            updateGroceryListElement(groceryList);
            // TODO: Adding the new item is causing it to be added in the wrong position. Maybe because createdAt is being calculated again?
        });
        const cancelButton = newGroceryElement.querySelector(`.grocery-item-edit-button-cancel`);
        cancelButton.addEventListener('click', (event) => {
            console.log('Cancel button clicked');
            // hide editing mode
            const itemIndex = getElementIndex(event.target); // index of button will be same as index of item
            const item = document.querySelector(`#grocery-item-${itemIndex}`);
            item.querySelector('.adding-mode').hidden = false // show the adding mode
            item.querySelector('.editing-mode').hidden = true // hide the editing mode
            return;
        });
        groceryList.appendChild(newGroceryElement);
        elementCount++;
    });
}

const getGroceryItems = () => {
    return JSON.parse(localStorage.getItem('groceryItems')) || [];
}

// mostly will not be needed because we adding elements sequencially to the array in the local storage
const sortGroceryItemsByDate = (array, key) => {
    return array.sort((a, b) => {
        return array.sort((a, b) => new Date(a[key]) - new Date(b[key])); // sort by date
    });
}

const getElementIndex = (element) => {
    const elementId = element.id;
    const elementIndex = elementId.split('-').pop();
    return elementIndex;
}

const deleteGroceryItem = (self) => {
    const itemIndex = getElementIndex(self); // index of button will be same as index of item
    const item = document.querySelector(`#grocery-item-${itemIndex}`);
    item.remove();
    // we also need to remove it from local storage
    const groceryItems = getGroceryItems();
    const itemToDelete = groceryItems[parseInt(itemIndex)];
    console.log("🚀 ~ deleteGroceryItem ~ itemToDelete:", itemToDelete)
    deleteFromLocalStorage(itemToDelete);
    notify('Grocery item deleted', 'warning');
    toggleClearListButton(document.querySelector('#grocery-list'), document.querySelector('#remove-all-grocery-items')); // quick solution
}

const notify = (message, type) => {
    const notificationElement = document.querySelector('#notification');
    notificationElement.className = ""; // remove all applied classes to set new type class
    notificationElement.classList.add(type);
    notification.innerText = message;
    setTimeout(() => {
        // hide notification after 3 seconds
        notification.classList.add('hidden');
    }, 3000);
}

const addToLocalStorage = (item, editing = false) => {
    console.log("🚀 ~ addToLocalStorage ~ item:", item)
    const groceryItems = getGroceryItems();
    const foundIndex = groceryItems.findIndex((groceryItem) => groceryItem.title === item.title);
    if (foundIndex !== -1) { // if item already exists in local storage simply do nothing
        console.log('Item already exists in local storage');
        notify('Item already exists', 'error');
        return;
    }
    groceryItems.push(item);
    const sortedGroceryItems = sortGroceryItemsByDate(groceryItems, 'createdAt'); // ? needed? Check if elements maintain order 
    localStorage.setItem('groceryItems', JSON.stringify(sortedGroceryItems)); // save the updated and sorted items list
    notify(`Grocery item ${editing ? 'edited' : 'added'} successfully`, 'success'); // ? what if an error occured at list-updating level?
    toggleClearListButton(document.querySelector('#grocery-list'), document.querySelector('#remove-all-grocery-items')); // quick solution
}

const deleteFromLocalStorage = (item) => {
    const groceryItems = getGroceryItems();
    const foundIndex = groceryItems.findIndex((groceryItem) => groceryItem.title === item.title);
    if (groceryItems.length === 0 || foundIndex === -1) { // if item not found in local storage simply do nothing
        console.log('Item not found in local storage');
        return;
    }
    const updatedGroceryItems = groceryItems.filter((groceryItem) => groceryItem.title !== item.title); // remove the item. No need to re-sort because it is already sorted
    console.log("🚀 ~ deleteFromLocalStorage ~ updatedGroceryItems:", updatedGroceryItems)
    localStorage.setItem('groceryItems', JSON.stringify(updatedGroceryItems)); // resave the updated items list
}

const editGroceryItem = (self) => {
    const itemIndex = getElementIndex(self); // index of button will be same as index of item
    const item = document.querySelector(`#grocery-item-${itemIndex}`);
    console.log("🚀 ~ editGroceryItem ~ item:", item)
    item.querySelector('.adding-mode').hidden = true // hide the adding mode
    item.querySelector('.editing-mode').hidden = false // show the editing mode
}

const clearGroceryList = (groceryList) => {
    localStorage.removeItem('groceryItems');
    groceryList.innerHTML = ""; // clear ul in the UI
}

const toggleClearListButton = (groceryList, clearGroceryListButton) => { // TODO: Test more cases because some appear to be not working 
    if (groceryList.children.length > 0) { // use simply the html element itself
        clearGroceryListButton.hidden = false;
    } else {
        clearGroceryListButton.hidden = true;
    }
}

const functions = { toggleClearListButton, clearGroceryList, createAndAddToLocalStorage, updateGroceryListElement, deleteGroceryItem, notify, addToLocalStorage, deleteFromLocalStorage };
export default functions;


