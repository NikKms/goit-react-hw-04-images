import React, { useState, useEffect } from 'react';
import { fetchItems } from 'services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Searchbar } from 'components/Searchbar';
import { ImageGallery } from 'components/ImageGallery';
import { Button } from 'components/Button';
import { Loader } from 'components/Loader';
import { Modal } from 'components/Modal';
import { Container } from './App.styled';

const toastConfig = {
  position: 'top-right',
  autoClose: 2000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: 'light',
};

export const App = () => {
  const [images, setImages] = useState([]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImages = async (query, page) => {
      try {
        setLoading(true);
        const response = await fetchItems(query, page);
        const newImages = response.data.hits;

        if (newImages.length === 0) {
          toast.info('Sorry, no results found', toastConfig);
          setImages([]);
          return;
        }

        if (page === 1) {
          setImages(newImages);
        } else {
          setImages(prevImages => [...prevImages, ...newImages]);
        }
      } catch (error) {
        setError(error.message);
        toast.error(error.message, toastConfig);
      } finally {
        setLoading(false);
      }
    };

    if (query.length === 0 && page === 1) return;

    fetchImages(query, page);
  }, [query, page]);

  const handleSubmit = query => {
    const lowercaseQuery = query.toLowerCase().trim();
    setQuery(lowercaseQuery);
    setPage(1);
  };

  const toggleModal = image => {
    setShowModal(prevShowModal => !prevShowModal);
    setSelectedImage(prevSelectedImage => (prevSelectedImage ? null : image));
  };

  return (
    <Container>
      <>
        <Searchbar onSubmit={handleSubmit} />
        {loading && <Loader />}

        {error !== null && <p>Error: {error.message}</p>}

        {query === '' ? (
          <p
            style={{
              marginLeft: 'auto',
              marginRight: 'auto',
              fontSize: '24px',
              fontWeight: 'bold',
            }}
          >
            Please enter a value in the search field
          </p>
        ) : (
          images &&
          images.length > 0 && (
            <>
              <ImageGallery images={images} openModal={toggleModal} />
              {images.length % 12 === 0 && images.length >= 12 && !loading && (
                <Button
                  onClick={() => {
                    setPage(prevPage => prevPage + 1);
                  }}
                />
              )}
            </>
          )
        )}

        {showModal && <Modal image={selectedImage} onClose={toggleModal} />}
        <ToastContainer />
      </>
    </Container>
  );
};
