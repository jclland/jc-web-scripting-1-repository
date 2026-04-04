// get elemnets
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const status = document.getElementById("status");
const results = document.getElementById("results");

// click event
searchBtn.addEventListener("click", runSearch);

async function runSearch() {
	const term = searchInput.value.trim();

	// blank input
	if (!term) {
		status.textContent = "Please enter a search term.";
		results.innerHTML = "";
		return;
	}

	// loading
	status.textContent = "Loading...";
	results.innerHTML = "";

	try {
		const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(term)}`;

		const response = await fetch(url);

		if (!response.ok) {
			status.textContent = "Error loading data.";
			return;
		}

		const data = await response.json();

		// no results
		if (!data.meals) {
			status.textContent = "No results found.";
			return;
		}

		// success
		status.textContent = `Found ${data.meals.length} result(s).`;

		// display results
		results.innerHTML = data.meals.map(meal => `
			<div class="card">
				<h3>${meal.strMeal}</h3>
				<p><strong>Category:</strong> ${meal.strCategory}</p>
				<p><strong>Area:</strong> ${meal.strArea}</p>
				<img src="${meal.strMealThumb}" alt="${meal.strMeal}">
			</div>
		`).join("");

	} catch (error) {
		status.textContent = "Something went wrong. Please try again.";
	}
}