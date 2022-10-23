const book_list = [];
const RENDER_EVENT = "render-bookshelf"

/*
* Event HTML Yang Dipanggil Ketika Dokumen HTML Telah Selesai Load dan Parsing 
* Tanpa Menunggu Stylesheets atau CSS, Images, atau Subframes Selesai Diproses.
*/
document.addEventListener('DOMContentLoaded', function() {
    const submitForm = document.getElementById('inputBook');
    submitForm.addEventListener('submit', function(event) {
        event.preventDefault();
        addBooks();
        ResetAllForm()
    });

    //Untuk Memuat Data Pada Storage Jika Ada
    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

//Mengatur Tombol Centang "Selesai Sibaca"
const inputBookIsComplete = document.getElementById("inputBookIsComplete");
inputBookIsComplete.addEventListener("click", function() {
    if (inputBookIsComplete.checked) {
        document.getElementById("bookType").innerHTML = "<strong>Selesai Dibaca</strong>";
    } else {
        document.getElementById("bookType").innerHTML = "<strong>Belum Selesai Dibaca</strong>";
    }
});

//Function Untuk Menambahkan Buku
function addBooks() {
    const inputBookTitle = document.getElementById("inputBookTitle").value;
    const inputBookAuthor = document.getElementById("inputBookAuthor").value;
    const inputBookYear = document.getElementById("inputBookYear").value;
    const inputBookIsCompleted = document.getElementById("inputBookIsComplete").checked;
    
    const generatedID = generateId();
    const bookshelfObject = generateBookshelfObject(generatedID, inputBookTitle, inputBookAuthor, inputBookYear, inputBookIsCompleted);
    book_list.push(bookshelfObject);

    document.dispatchEvent(new Event(RENDER_EVENT))

    saveData();
}

//Function Untuk Generate ID Unik Pada Setiap Buku Yang Diinput
function generateId() {
    return +new Date();
}

//Function Untuk Membuat Object Baru Dari Data Input User
function generateBookshelfObject(idBook, titleBook, authorBook, yearBook, isComplete) {
    return {
        idBook,
        titleBook,
        authorBook,
        yearBook,
        isComplete
    }
}


//MANIPULASI DOCUMENT OBJECT MODEL
function makeBooks(bookshelfObject) {
    const textTitleBook = document.createElement("h3");
    textTitleBook.innerText = bookshelfObject.titleBook;

    const textAuthorBook = document.createElement("p");
    textAuthorBook.innerText = `Penulis Buku: ${bookshelfObject.authorBook}`;

    const textYearBook = document.createElement("p");
    textYearBook.innerText = `Tahun Terbit : ${bookshelfObject.yearBook}`;

    const textContainer = document.createElement("div");
    textContainer.classList.add("inner");
    textContainer.append(textTitleBook, textAuthorBook, textYearBook);

    const container = document.createElement("div");
    container.classList.add("item", "card");
    container.append(textContainer);
    container.setAttribute("id", `book-${bookshelfObject.idBook}`);

    //Menambahkan Tombol Pada Bagian "Belum Selesai Dibaca" dan "Selesai Dibaca"
    if(bookshelfObject.isComplete) {
        const undoButton = document.createElement("button");
        undoButton.classList.add("gren-complete");
        undoButton.addEventListener("click", function() {
            undoTaskFromCompleted(bookshelfObject.idBook);
        });

        const trashButton = document.createElement("button");
        trashButton.classList.add("red");
        trashButton.addEventListener("click", function() {
            removeTaskFromCompleted(bookshelfObject.idBook);
        });

        container.append(undoButton, trashButton);
    } else {
        const checkButton = document.createElement("button");
        checkButton.classList.add("gren-uncomplete");
        checkButton.addEventListener("click", function() {
            addTaskToCompleted(bookshelfObject.idBook);
        });

        const trashButton = document.createElement("button");
        trashButton.classList.add("red");
        trashButton.addEventListener("click", function() {
            removeTaskFromCompleted(bookshelfObject.idBook);
        });

        container.append(checkButton, trashButton);
    }
    return container;
}

//Mencari Buku Sesuai Dengan ID Pada Array
function findBook(bookId) {
    for(const bookItem of book_list) {
        if(bookItem.idBook === bookId) {
            return bookItem;
        }
    }
    return null;
}

//Menambahkan Tombol "Belum Selesai Dibaca"
function undoTaskFromCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if(bookTarget == null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));

    saveData();
}

//Menambahkan Tombol "Selesai Dibaca"
function addTaskToCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if(bookTarget == null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));

    saveData();
}

//Mencari Index Buku Sesuai Dengan ID Pada Array
function findBookIndex(bookId) {
    for(const bookItemIndex in book_list) {
        if(book_list[bookItemIndex].idBook === bookId) {
            return bookItemIndex;
        }
    }
    return -1;
}

//Menambahkan Tombol "Hapus Buku"
function removeTaskFromCompleted(bookId) {
    const bookTarget = findBookIndex(bookId);

    if(bookTarget == -1) return;

    book_list.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));

    saveData();
}

//Function Untuk Menghapus Formulir Ketika Memasukan Buku Kedalam Rak
function ResetAllForm() {
    document.getElementById("inputBookTitle").value = "";
    document.getElementById("inputBookAuthor").value = "";
    document.getElementById("inputBookYear").value = "";
    document.getElementById("inputBookIsComplete").checked = false;
}


//MENAMPILKAN PADA BROWSER
document.addEventListener(RENDER_EVENT, function () {
    const completedBOOKSList = document.getElementById("completeBookshelfList");
    completedBOOKSList.innerHTML = "";
    const uncompletedBOOKSList = document.getElementById("incompleteBookshelfList");
    uncompletedBOOKSList.innerHTML = "";

    for(const bookItem of book_list) {
        const bookElement = makeBooks(bookItem);
        if(bookItem.isComplete) {
            completedBOOKSList.append(bookElement);
        } else if(!bookItem.isComplete) {
            uncompletedBOOKSList.append(bookElement);
        }
    }
});


//MENYIMPAN DATA PADA BROWSER STORAGE
const SAVED_EVENT = "SAVED-BOOK";
const STORAGE_KEY = "BOOK-SHELF";

//Function Untuk Menyimpan data pada local storage
function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(book_list);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

//Function Untuk Memeriksa Ketersediaan Local Storage Browser
function isStorageExist() {
  if (typeof (Storage) === undefined) {
    alert('Browser tidak mendukung local storage!');
    return false;
  }
  return true;
}

//Function Untuk Membuat Data Tetap Ditampilkan Ketika Refresh atau Menutup Browser
function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);
 
  if (data !== null) {
    for (const books of data) {
        book_list.push(books);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}
