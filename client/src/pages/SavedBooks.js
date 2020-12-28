import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { Jumbotron, Container, CardColumns, Card, Button } from 'react-bootstrap';

// import { getMe, deleteBook } from '../utils/API';
import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';
import { useQuery, useMutation } from '@apollo/react-hooks';
// import { Redirect, useParams } from 'react-router-dom';
import { GET_ME } from "../utils/queries"
import { REMOVE_BOOK } from "../utils/mutations"

const SavedBooks = () => {
  
  const { loading, data } = useQuery(GET_ME);
  const user = data?.me || {};
  console.log(user)
  const [userData, setUserData] = useState(user);
  console.log(userData)

  useEffect(() => {
    if (!loading) {
      setUserData(user);
    }
  })
  const [removeBook] = useMutation(REMOVE_BOOK, {
    update(cache, { data: {removeBook} }) {
      console.log(removeBook.savedBooks);
      const { me } = cache.readQuery({ query: GET_ME });
      cache.writeQuery({
        query: GET_ME,
        data: { me: { ...me, savedBooks: removeBook.savedBooks } }
      });
    }
  }
  );
  if (!Auth.loggedIn()) {
    return <Redirect to="/" />;
  }
  // if (!loading) {
  //   setUserData(user);
  // }
  // use this to determine if `useEffect()` hook needs to run again
  const userDataLength = Object.keys(userData).length;

  // useEffect(() => {
  //   const getUserData = async () => {
  //     try {
  //       const token = Auth.loggedIn() ? Auth.getToken() : null;

  //       if (!token) {
  //         return false;
  //       }

  //       const response = await getMe(token);

  //       if (!response.ok) {
  //         throw new Error('something went wrong!');
  //       }

  //       const user = await response.json();
  //       setUserData(user);
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   };

  //   getUserData();
  // }, [userDataLength]);

  
  // create function that accepts the book's mongo _id value as param and deletes the book from the database
  const handleDeleteBook = async (bookId) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;
    console.log(bookId)
    if (!token) {
      return false;
    }
    try {
      // add thought to database
      await removeBook({
        variables: { bookId: bookId }
      });

      // upon success, remove book's id from cache
      removeBookId(bookId);
      setUserData(user);
    } catch (err) {
      console.error(err);
    }
    // try {
    //   const response = await deleteBook(bookId, token);

    //   if (!response.ok) {
    //     throw new Error('something went wrong!');
    //   }

    //   const updatedUser = await response.json();
    //   setUserData(updatedUser);
    //   // upon success, remove book's id from localStorage
    //   removeBookId(bookId);
    // } catch (err) {
    //   console.error(err);
    // }
  };

  // if data isn't here yet, say so
  if (!userDataLength) {
    return <h2>You have to be logged in to view this page. Please log in above</h2>;
  }

  return (
    <>
      <Jumbotron fluid className='text-light bg-dark'>
        <Container>
          <h1>Viewing saved books!</h1>
        </Container>
      </Jumbotron>
      <Container>
        <h2>
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${userData.savedBooks.length === 1 ? 'book' : 'books'}:`
            : 'You have no saved books!'}
        </h2>
        <CardColumns>
          {userData.savedBooks.map((book) => {
            return (
              <Card key={book.bookId} border='dark'>
                {book.image ? <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' /> : null}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className='small'>Authors: {book.authors}</p>
                  <Card.Text>{book.description}</Card.Text>
                  <Button className='btn-block btn-danger' onClick={() => handleDeleteBook(book.bookId)}>
                    Delete this Book!
                  </Button>
                </Card.Body>
              </Card>
            );
          })}
        </CardColumns>
      </Container>
    </>
  );
};

export default SavedBooks;
