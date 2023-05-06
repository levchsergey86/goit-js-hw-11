import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import debounce from 'lodash.debounce';
import Notiflix from 'notiflix';
import 'simplelightbox/dist/simple-lightbox.min.css';

const gallery = document.querySelector('.gallery');
const input = document.querySelector('input[name="searchQuery"]');
const form = document.getElementById('search-form');
const paginationBtn = document.querySelector('.js-pagination');
const endMessage = document.querySelector('.js-end-message');
form.addEventListener('submit', onSubmit);
paginationBtn.addEventListener('click', onPagination);
let currentPage = 1;
let totalHits = 0;
const galleryLightBox = new SimpleLightbox('.gallery a');

async function fetchImages(page) {
  const searchValue = input.value.trim();
  const options = {
    key: '35805355-59b54dec7b4c23d216fe98668',
    q: searchValue,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: page,
    per_page: 20,
  };
  if (searchValue === '') {
    gallery.innerHTML = '';
    return;
  }
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: options,
    });
    const hits = response.data.hits;
    totalHits = response.data.totalHits;
    if (hits.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    gallery.insertAdjacentHTML('beforeend', createMarkup(hits));
    galleryLightBox.refresh();
    if (currentPage * 20 >= totalHits) {
      paginationBtn.hidden = true;
      if (totalHits > 0) {
        Notiflix.Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
      }
    } else {
      paginationBtn.hidden = false;
    }
  } catch (error) {
    console.error(error);
  }
}

function onPagination() {
  currentPage += 1;
  fetchImages(currentPage);
}

function onSubmit(event) {
  event.preventDefault();
  currentPage = 1;
  totalHits = 0;
  gallery.innerHTML = '';
  paginationBtn.hidden = true;
  fetchImages(currentPage);
}

function createMarkup(arr) {
  return arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `<div class="photo-card">
                <a class="gallery-link" href=${largeImageURL}>
                    <div class="photo-img">
                        <img src="${
                          webformatURL ||
                          'https://artsel.com.ua/uploads/shop/nophoto/nophoto.jpg'
                        }" alt="${tags}" loading="lazy" />   
                    </div>           
                    <div class="info">
                        <p class="info-item">
                        <b>Likes </b>${likes}
                        </p>
                        <p class="info-item">
                        <b>Views </b>${views}
                        </p>
                    </div>
                    <div class="info">
                        <p class="info-item">
                        <b>Comments </b>${comments}
                        </p>
                        <p class="info-item">
                        <b>Downloads </b>${downloads}
                        </p>
                    </div>
                </a> 
            </div>`
    )
    .join('');
}
