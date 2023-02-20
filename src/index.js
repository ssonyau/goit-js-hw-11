 import { Notify } from 'notiflix/build/notiflix-notify-aio';
 import SimpleLightbox from "simplelightbox";
 import "simplelightbox/dist/simple-lightbox.min.css";

 import { ImagesApiService } from "./js/fetchPhoto";
 import { createMarkup } from "./js/markupCreate";
 import { refs } from "./js/refs";

 let lightbox = new SimpleLightbox('.gallery a')
const imagesAPI = new ImagesApiService();
 
const options = {
     root: null,
     rootMargin: '100px',
     threshold: 1.0
 }

 const callback = async function(entries, observer) {
     entries.forEach(async entry => {
         if (entry.isIntersecting) {
             imagesAPI.incrementPage()
             observer.unobserve(entry.target);

             try {
                 const {hits} = await imagesAPI.getImages();
                 const markup = createMarkup(hits);
                 renderMarkup(markup);

                 lightbox.refresh();

                 if (!imagesAPI.isShowLoadMore) {                   
                    Notiflix.Notify.failure("We're sorry, but you've reached the end of search results.")
                     return;
                 }
                 if (imagesAPI.isShowLoadMore) {
                     const target = document.querySelector('.photo-card:last-child')
                 Intersection.observe(target);
                 }              
             } catch (error) {
                 onError(error)
                 clearPage()
             }
         }
     });
 };
 const Intersection = new IntersectionObserver(callback, options);

 const onFormSubmit = async (evt) => {
     evt.preventDefault();
     imagesAPI.resetPage();
     refs.gallery.innerHTML = '';
     refs.btnMore.classList.add('is-hidden');
     const { elements: { searchQuery } } = evt.currentTarget;

     if (!searchQuery.value) {
         Notify.failure("Sorry, there are no images matching your search query. Please try again.")
         return;
     }
     imagesAPI.query = searchQuery.value.trim().replace(/ /ig, '+');

     try {
         const { hits, totalHits } = await imagesAPI.getImages();
         if (!totalHits) {
             Notify.failure("Sorry, there are no images matching your search query. Please try again.")
             return;
         }
         const markup = createMarkup(hits);
         renderMarkup(markup);
         imagesAPI.calculateTotalPages(totalHits);
         
         Notify.success(`Hooray! We found ${totalHits} images.`);
   if (imagesAPI.isShowLoadMore) {
      const target = document.querySelector('.photo-card:last-child')
         Intersection.observe(target);
    }

          lightbox.refresh();

     } catch (error) {
         onError(error)
         clearPage()
     }
 }
 refs.form.addEventListener('submit', onFormSubmit)

 function clearPage() {
  imagesAPI.resetPage();
  refs.list.innerHTML = '';
  refs.btnMore.classList.add('is-hidden');
 }

 function renderMarkup(markup) {
     refs.gallery.insertAdjacentHTML('beforeend', markup)
 }

 function onError (error) {
     console.log(error);
     Notify.failure(`${error.message}`);
 }
function getScroll() {
    const { height: cardHeight } = document
        .querySelector(".gallery")
        .firstElementChild.getBoundingClientRect();

    window.scrollBy({
        top: cardHeight * 2,
        behavior: "smooth",
    });
}