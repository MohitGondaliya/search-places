document.addEventListener("DOMContentLoaded", function () {
  // API settings and key stored in environment variables
  const API_KEY = ENTER_APIKEY; //8ba0386c07msh640fe3698ca9284p168f12jsn44619a54ec2b
  const API_URL = "https://wft-geo-db.p.rapidapi.com/v1/geo/cities";

  let currentPage = 1;
  let itemsPerPage = 5;
  let totalItems = 0;
  let debounceTimeout;

  const searchBox = document.getElementById("search-box");
  const resultsTable = document.getElementById("results-table");
  const paginationContainer = document.getElementById("pagination-container");
  const limitBox = document.getElementById("limit-box");
  const warningMessage = document.getElementById("warning-message");
  const pageNumbersContainer = document.getElementById("page-numbers");
  const prevPageButton = document.getElementById("prev-page");
  const nextPageButton = document.getElementById("next-page");

  // Update results per page
  limitBox.addEventListener("keyup", () => {
    itemsPerPage = parseInt(limitBox.value) || 5;
    if (itemsPerPage > 10) {
      warningMessage.style.display = "block";
      limitBox.value = 10; // Set to max limit
      itemsPerPage = 10;
    } else {
      warningMessage.style.display = "none";
    }

    // Re-fetch results when the limit changes
    const query = searchBox.value.trim();
    if (query) {
      fetchResults(query, itemsPerPage, 1); // Reset to page 1 when limit changes
      currentPage = 1; // Reset current page
    }
  });

  // Search functionality
  searchBox.addEventListener("keyup", (e) => {
    clearTimeout(debounceTimeout);
    if (e.key === "Enter") {
      debounceTimeout = setTimeout(() => {
        const query = searchBox.value.trim();
        if (query) {
          fetchResults(query, itemsPerPage, currentPage);
        } else {
          displayMessage("Start searching");
        }
      }, 300); // Adjust the debounce time as needed
    }
  });

  // Previous page event listener
  prevPageButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      const query = searchBox.value.trim();
      fetchResults(query, itemsPerPage, currentPage);
    }
  });

  // Next page event listener
  nextPageButton.addEventListener("click", () => {
    currentPage++;
    const query = searchBox.value.trim();
    fetchResults(query, itemsPerPage, currentPage);
  });

  // Fetch results from API
  async function fetchResults(query, limit, page) {
    const options = {
      method: "GET",
      url: `${API_URL}`,
      params: {
        namePrefix: query,
        limit: limit,
        offset: (page - 1) * limit,
      },
      headers: {
        "x-rapidapi-key": API_KEY,
        "x-rapidapi-host": "wft-geo-db.p.rapidapi.com",
      },
    };

    try {
      const response = await axios.request(options);
      totalItems = response.data.metadata.totalCount;
      displayResults(response.data.data);
      updatePagination();
    } catch (error) {
      console.error(error);
    }
  }

  // Display results in table
  function displayResults(data) {
    resultsTable.innerHTML = "";

    if (data.length === 0) {
      displayMessage("No result found");
      paginationContainer.style.display = "none"; // Hide pagination
      return;
    }

    data.forEach((place, index) => {
      const row = `<tr>
      <td>${(currentPage - 1) * itemsPerPage + index + 1}</td>
      <td>${place.city}</td>
      <td><img src="https://flagsapi.com/${
        place.countryCode
      }/shiny/64.png" alt="${place.country}" /> ${place.country}</td>
    </tr>`;
      resultsTable.innerHTML += row;
    });

    paginationContainer.style.display = "flex"; // Show pagination
  }

  // Pagination logic
  function updatePagination() {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    pageNumbersContainer.innerHTML = "";

    if (totalPages === 0) {
      paginationContainer.style.display = "none"; // Hide if no pages
      return;
    }

    // Update page numbers
    for (let i = 1; i <= totalPages; i++) {
      const pageButton = document.createElement("button");
      pageButton.textContent = i;
      pageButton.className = "btn btn-page page-link";

      // Add click event for each page button
      pageButton.onclick = () => {
        currentPage = i;
        const query = searchBox.value.trim();
        fetchResults(query, itemsPerPage, currentPage);
        updatePagination(); // Update pagination to add active class
      };

      // Add active class to the current page button
      if (i === currentPage) {
        pageButton.classList.add("active");
      }

      pageNumbersContainer.appendChild(pageButton);
    }

    // Enable/disable previous and next buttons
    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage === totalPages;
  }

  function displayMessage(message) {
    resultsTable.innerHTML = `<tr><td colspan="3" class="text-center">${message}</td></tr>`;
  }

  document.addEventListener("keydown", (e) => {
    const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    if ((isMac ? e.metaKey : e.ctrlKey) && e.key === "/") {
      e.preventDefault(); // Prevent default behavior of the shortcut
      searchBox.focus(); // Focus on the search box
    }
  });
});
