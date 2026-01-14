const express = require('express');
let books = require("./booksdb.js");
const { stringify } = require('nodemon/lib/utils/index.js');
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (!isValid(username)) {
    users.push({ "username": username, "password": password });
    return res.status(200).json({ message: "User successfully registered. Now you can login." });
  }else{
    return res.status(409).json({ message: "User already exists!" });    
  }
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  new Promise((resolve, reject) => {
    resolve(books);
  })
  .then(bookList => res.send(JSON.stringify(bookList)))
  .catch(err => res.status(500).json({ message: "Error retrieving books" }));
});

// Get book details based on ISBN using Promise
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  new Promise((resolve, reject) => {
    const foundedBook = Object.values(books).find(book => book.isbn === isbn);
    if (foundedBook) {
      resolve(foundedBook);
    } else {
      reject("Book not found");
    }
  })
  .then(book => res.send(book))
  .catch(err => res.status(404).json({ message: err }));
});

// Get book details based on author using Promise
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  new Promise((resolve, reject) => {
    const foundedBooks = Object.values(books).filter(book => book.author === author);
    if (foundedBooks.length > 0) {
      resolve(foundedBooks);
    } else {
      reject("No books found for the given author");
    }
  })
  .then(books => res.send(books))
  .catch(err => res.status(404).json({ message: err }));
});

// Get all books based on title using Promise
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  new Promise((resolve, reject) => {
    const foundedBooks = Object.values(books)
      .filter(book => book.title === title)
      .map(book => ({
        author: book.author,
        reviews: book.reviews,
        isbn: book.isbn
      }));
    if (foundedBooks.length > 0) {
      resolve(foundedBooks);
    } else {
      reject("No books found with the given title");
    }
  })
  .then(books => res.send(books))
  .catch(err => res.status(404).json({ message: err }));
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  let foundedBook = Object.values(books)
    .find(book => book.isbn === isbn);
  return foundedBook ? res.send(foundedBook.reviews) : res.status(404).json({message: "Book not found"});
});

module.exports.general = public_users;
