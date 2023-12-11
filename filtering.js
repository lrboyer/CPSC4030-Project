async function loadInitialDataset() {
    try {
        const loadedData = await d3.csv("Amazon_Customer_Behavior_Survey.csv");
        return loadedData;
    } catch (error) {
        throw error;
    }
}

async function createAndUpdate() {
    try {
        const initialDataset = await loadInitialDataset();

        // Create the stacked bar chart
        createStackedBarChart(initialDataset);
        const filterButton = document.getElementById("filterButton");

        // Initial state
        let isFiltered = false;
        let filteredData = initialDataset;

        // Event listener for the filter button
        filterButton.addEventListener("click", function () {
            if (isFiltered) { // If already filtered, reset to the initial dataset
                filteredData = initialDataset
                isFiltered = false;
            }
            else { // If not filtered, filter the dataset
                //FILTER LOGIC WILLL EXPAND ON

                /* IF NEED BE HERE IS SOME TO INDIVIUALLY GET AGE AND GENDER
                    const ageGroups = Array.from(new Set(dataset.map(d => d['Age Group'])));
                    ageGroups.sort((a, b) => {
                        const ageA = parseInt(a.split('-')[0]);
                        const ageB = parseInt(b.split('-')[0]);
                        return ageA - ageB;
                    });

                    const genders = Array.from(new Set(dataset.map(d => d.Gender)));
                */
                filteredData = filteredData.filter(d => d.Gender === 'Female' || d.Gender === 'Male');
                filteredData = filteredData.filter(d => {
                    return d.age >= 21 && d.age <= 30;
                });

                isFiltered = true;
            }

            //update all visuals
            updateStackedBarChart(filteredData);
        });

    } catch (error) {
        console.error("Error:", error);
    }
}

createAndUpdate();