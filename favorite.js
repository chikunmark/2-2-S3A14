const BASE_URL = "https://movie-list.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/v1/movies/"
const POSTER_URL = BASE_URL + "/posters/"
const dataPanel = document.querySelector("#data-panel")
const searchForm = document.querySelector("#search-form")
const searchInput = document.querySelector("#search-input")

const movies = JSON.parse(localStorage.getItem("favoriteMovies"))
let testList = []

function renderMovieList(data) {
  let rawHTML = ""

  // processing
  data.forEach((item) => {
    // title, image
    // console.log(item);
    rawHTML += `
		<div class="col-sm-3">
          <div class="mb-2">
            <div class="card">
              <img
                src="${POSTER_URL + item.image}"
                class="card-img-top"
                alt="Movie Poster"
              />
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <div class="card-footer text-muted">
                <button
                  class="btn btn-primary btn-show-movie"
                  data-bs-toggle="modal"
                  data-bs-target="#movie-modal"
									data-id="${item.id}"
                >
                  More
                </button>
                <button class="btn btn-danger btn-remove-favorite" data-id="${
                  item.id
                }">X</button>
              </div>
            </div>
          </div>
        </div>
		`
  })

  dataPanel.innerHTML = rawHTML
  console.log(`renderMovieList 有被觸發`)
}

function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title")
  const modalImage = document.querySelector("#movie-modal-image")
  const modalDate = document.querySelector("#movie-modal-date")
  const modalDescription = document.querySelector("#movie-modal-description")

  console.log(INDEX_URL + id)

  axios.get(INDEX_URL + id).then((response) => {
    // response.data.results
    const data = response.data.results
    // console.log(data.id);
    modalTitle.innerText = data.title
    modalDate.innerText = "Release Date: " + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `
		<img src= "${POSTER_URL + data.image}" alt="movie-poster" class="image-fluid"/>
		`
  })
}

function addToFavorite(id) {
  // console.log(id);
  // function isMovieIdMatched(movie) {
  //   return movie.id === id;
  // }

  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || []
  // const movie = movies.find(isMovieIdMatched);
  const movie = movies.find((movie) => movie.id === id)

  if (list.some((movie) => movie.id === id)) {
    return alert(`本作已加入`)
  }

  list.push(movie)
  console.log(list)
  // console.log(movie);

  // const jsonString = JSON.stringify(list);
  // console.log("json string ", jsonString);
  // console.log(JSON.parse(jsonString));
  localStorage.setItem("favoriteMovies", JSON.stringify(list))
}

function removeFromFavorite(id) {
  const movieIndex = movies.findIndex((movie) => movie.id === id)

  movies.splice(movieIndex, 1)

  localStorage.setItem("favoriteMovies", JSON.stringify(movies))
  renderMovieList(movies)
}

dataPanel.addEventListener("click", function onPanelClicked(event) {
  console.log(event.target)
  if (event.target.matches(".btn-show-movie")) {
    // console.log(event);
    // console.log(event.target.dataset);
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches(".btn-remove-favorite")) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault()
  // console.log(searchInput.value);
  const keyword = searchInput.value.trim().toLowerCase()
  console.log(keyword)
  let filteredMovies = []
  console.log(filteredMovies)

  // if (!keyword.length) {
  //   return alert("Plesae enter a valid string");
  // }

  filteredMovies = movies.filter((movie) => {
    console.log(movie.title.toLowerCase().includes(keyword))
    return movie.title.toLowerCase().includes(keyword)
  })

  // for (const movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie);
  //   }
  // }

  console.log("filter 後矩陣長度 " + filteredMovies.length)
  console.log(filteredMovies)
  if (filteredMovies.length === 0) {
    return alert(`Can not find movie with keyword: ${searchInput.value}`)
    // return alert(`Can not find movie with keyword: ${keyword}`) // 助教寫的，小問題，沒按輸入的字串顯示而已;
  }

  renderMovieList(filteredMovies)
  // 這裡有些問題，空字串或其他方式也無法回去原始清單
  // 助教在先前加 return，解決這個問題
  console.log(`搜尋 movies 有跑到最後`)
})

renderMovieList(movies)

// console.log(axios.get(INDEX_URL));

// axios
//   .get(INDEX_URL)
//   .then(function (response) {
//     console.log(response.data.results);

//     //方法一
//     // for (const movie of response.data.results) {
//     //   movies.push(movie);
//     // }

//     //測試
//     // testList = response.data.results;
//     // console.log(`testList 內容見下行`);
//     // console.log(testList);
//     // const test = document.querySelector("#paginator");
//     // test.innerHTML = response.data.results;

//     //方法二
//     movies.push(...response.data.results);
//     // console.log(movies);
//     console.log(`預設列表 rendering 有啟動`);
//     renderMovieList(movies);
//   })
//   .catch((err) => console.log(err));

// localStorage.setItem("default_language", "english");
// console.log(localStorage.getItem("default_language"));
// localStorage.removeItem("default_language");
// console.log(localStorage.getItem("default_language"));
