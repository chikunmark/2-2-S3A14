// 簡化用
const BASE_URL = "https://movie-list.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/v1/movies/"
const POSTER_URL = BASE_URL + "/posters/"
const dataPanel = document.querySelector("#data-panel")
const searchForm = document.querySelector("#search-form")
const searchInput = document.querySelector("#search-input")
const paginator = document.querySelector("#paginator")
const displayMode = document.querySelector(".display-mode")

let currentPage = 1 // 設定當前頁數，以 1 作為起始值
const MOVIES_PER_PAGE = 12 // 設定每頁應顯示的電影數目

const movies = [] // 作為電影資料的存放處
let filteredMovies = [] // 搜尋結果的存放處

// 判斷要用 list 或 card 形式做 render，並擇一執行
function decideAndStartRender(data) {
  dataPanel.matches(".render-list")
    ? renderMovieList_List(data)
    : renderMovieList_Card(data)
}

// 以 list 形式渲染電影清單
function renderMovieList_List(data) {
  let finalHTML = "" // 設定最後要 render 的 HTML code

  // 加工 innerHTML
  data.forEach(function (item) {
    finalHTML += `
    <li class="list-group-item d-flex justify-content-between">
        <h6>${item.title}</h6>
        <span class="text-muted">
          <button
            class="btn btn-primary btn-show-movie"
            data-bs-toggle="modal"
            data-bs-target="#movie-modal"
            data-id="${item.id}"
          >
            More
          </button>
          <button
            class="btn btn-info btn-add-favorite"
            data-id="${item.id}"
          >
            +
          </button>
        </span>
      </li>
    `
  })
  finalHTML = `<ul class="list-group">` + finalHTML + `</ul>`

  // 擺進目的地
  dataPanel.innerHTML = finalHTML
}

// 以 card 形式渲染電影清單
function renderMovieList_Card(data) {
  let finalHTML = "" // 設定最後要 render 的 HTML code

  // processing
  data.forEach((item) => {
    finalHTML += `
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
                <button class="btn btn-info btn-add-favorite" data-id="${
                  item.id
                }">+</button>
              </div>
            </div>
          </div>
        </div>
		`
  })

  // 擺進目的地
  dataPanel.innerHTML = finalHTML
}

// 渲染頁數條
function renderPaginator(amount) {
  // 設定總共該有幾頁 (項目總數 除以 每頁該秀多少項)
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  // // 設定最後要 render 的 HTML code
  let finalHTML = ``

  // 有多少頁，就做多少個 page item (<li>)
  for (let page = 1; page <= numberOfPages; page++) {
    finalHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }

  // 把 code 擺進目的地
  paginator.innerHTML = finalHTML
}

// 依頁數切出想要資料 (元素為 object 的 array)，並回傳作 render 材料
function getMoviesByPage(page) {
  // 設定資料來源，若有搜尋，則拿搜尋結果，若無，則拿全部電影資料
  const data = filteredMovies.length ? filteredMovies : movies
  // 設定切的起始 index
  const startIndex = (page - 1) * MOVIES_PER_PAGE

  // return 切割結果
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

// 渲染 modal，用來介紹電影
function showMovieModal(id) {
  // 簡化用
  const modalTitle = document.querySelector("#movie-modal-title")
  const modalImage = document.querySelector("#movie-modal-image")
  const modalDate = document.querySelector("#movie-modal-date")
  const modalDescription = document.querySelector("#movie-modal-description")

  // 藉 API 取得資料，並將資料一一灌入相應 html element
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

// 將某部電影加入最愛
function addToFavorite(id) {
  // 設定 list，如果 localStorage 已有資料，就用它，沒有，就先指定為 []
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || []
  // 設定變數，一旦電影資料內的 id 吻合，就將該資料保存
  const movie = movies.find((movie) => movie.id === id)

  // 比對 object，如果已有，return alert 訊息
  if (list.some((movie) => movie.id === id)) {
    return alert(`本作已加入`)
  }
  // 如果沒有，把該 movie push 進 list
  list.push(movie)

  // 把更新的 list 更新至 local storage
  localStorage.setItem("favoriteMovies", JSON.stringify(list))
}

// 監視 dataPanel，一旦點擊到特定目標，就起動特定動作 (顯示電影介紹，或是加到我的最愛)
dataPanel.addEventListener("click", function onPanelClicked(event) {
  // 一旦 target 的 class name 有 "btn-show-movie"，秀電影介紹
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id))
  } // 一旦 target 的 class name 有 "btn-add-favorite"，加到我的最愛
  else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

// 監控搜尋格，一旦 submit，就開始搜尋、傳遞渲染指令
searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault() // 停止預設動作，防止頁面更新
  const keyword = searchInput.value.trim().toLowerCase() // 額外用 trim，防止前後打空格的可能

  // 設定搜尋結果，以 keyword 為準，留下所有吻合項目
  filteredMovies = movies.filter((movie) => {
    return movie.title.toLowerCase().includes(keyword) // 回傳 T/F 值，作為判定標準
  })

  // 如果沒找到 (吻合項目為零)，擇回傳警告，說找不到
  if (filteredMovies.length === 0) {
    return alert(`Can not find movie with keyword: ${searchInput.value}`)
    // return alert(`Can not find movie with keyword: ${keyword}`) // 助教寫的，小問題，沒按輸入的字串顯示而已;
  }

  currentPage = 1
  decideAndStartRender(getMoviesByPage(currentPage)) // 渲染頁面
  renderPaginator(filteredMovies.length) // 渲染頁數條
})

// 監控頁數條，若被點擊擇按頁數換頁
paginator.addEventListener("click", function onPaginatorClicked(event) {
  if (event.target.tagName !== "A") return // 防止點到其他東西 (其實目前也沒有 XD)

  // 把目標的 data-page 數值設定為當前頁數
  currentPage = Number(event.target.dataset.page)

  // 依當前頁數 (cuurentPage) 渲染電影項目
  decideAndStartRender(getMoviesByPage(currentPage))
})

// 監視 display mode，一旦特定圖飾被點，則藉 class name 增減，改變顯示模式
displayMode.addEventListener("click", function (event) {
  // list 顯示的條件、行動
  if (event.target.matches(".fa-bars")) {
    dataPanel.classList.add("render-list")
    decideAndStartRender(getMoviesByPage(currentPage))
  } // card 顯示的條件、行動
  else {
    dataPanel.classList.remove("render-list")
    decideAndStartRender(getMoviesByPage(currentPage))
  }
})

// 藉 API 取得資料，作第一次渲染
axios
  .get(INDEX_URL)
  .then(function (response) {
    // 把電影資料 object 一一 push 進 movies (其實用 let movies，之後在這 assign 更簡潔)
    movies.push(...response.data.results)

    // 渲染電影資料與頁數條
    currentPage = 1
    decideAndStartRender(getMoviesByPage(currentPage))
    renderPaginator(movies.length)
  })

  // 若遇錯誤，回傳錯誤訊息
  .catch((err) => console.log(err))
