// Global memory state
let countryStateDatabase = [];

document.addEventListener("DOMContentLoaded", async () => {
    lucide.createIcons();
    initializeInterfaceChronology();
    await synchronizeGlobalDatabase();
    bindInterfaceControls();
});

function initializeInterfaceChronology() {
    const schedulingOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    document.getElementById("live-date-badge").textContent = new Date().toLocaleDateString('en-US', schedulingOptions);
}

// Fetch Countries and States
async function synchronizeGlobalDatabase() {
    try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries/states');
        const data = await response.json();
        countryStateDatabase = data.data; 
        populateCountryRegistry();
    } catch (fault) {
        console.error("Error:", fault);
        document.getElementById('global-country-select').innerHTML = '<option>Registry error.</option>';
    }
}

function populateCountryRegistry() {
    const targetDropdown = document.getElementById("global-country-select");
    targetDropdown.innerHTML = '<option value="" disabled selected>Select Target Country...</option>';
    
    countryStateDatabase.sort((a, b) => a.name.localeCompare(b.name)).forEach(countryData => {
        targetDropdown.add(new Option(countryData.name, countryData.name));
    });
}

// Fetch Cities for a specific State
async function fetchCitiesForState(country, state) {
    const citySelect = document.getElementById("global-city-select");
    citySelect.innerHTML = '<option value="" disabled selected>Loading cities...</option>';
    citySelect.disabled = true;

    try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ country: country, state: state })
        });
        const data = await response.json();

        citySelect.innerHTML = '<option value="" disabled selected>Select City...</option>';
        if (data.data && data.data.length > 0) {
            data.data.forEach(city => {
                citySelect.add(new Option(city, city));
            });
            citySelect.disabled = false;
        } else {
            citySelect.innerHTML = '<option value="N/A">No cities found</option>';
            document.getElementById("execute-scan-btn").disabled = false; // Allow scanning just the state
        }
    } catch (error) {
        citySelect.innerHTML = '<option value="N/A">City fetch failed</option>';
        document.getElementById("execute-scan-btn").disabled = false;
    }
}

function bindInterfaceControls() {
    const cMenu = document.getElementById("global-country-select");
    const sMenu = document.getElementById("global-state-select");
    const cityMenu = document.getElementById("global-city-select");
    const launchBtn = document.getElementById("execute-scan-btn");
    const manualInput = document.getElementById("manual-city-search");

    // 1. Country Changes -> Load States
    cMenu.addEventListener("change", (event) => {
        const match = countryStateDatabase.find(item => item.name === event.target.value);
        sMenu.innerHTML = '<option value="" disabled selected>Select State / Province...</option>';
        cityMenu.innerHTML = '<option value="" disabled selected>Select state first</option>';
        cityMenu.disabled = true;
        launchBtn.disabled = true;
        
        if (match && match.states.length > 0) {
            match.states.sort((a, b) => a.name.localeCompare(b.name)).forEach(stateData => {
                sMenu.add(new Option(stateData.name, stateData.name));
            });
            sMenu.disabled = false;
        } else {
            sMenu.innerHTML = '<option value="N/A">No States</option>';
            sMenu.disabled = true;
            launchBtn.disabled = false;
        }
    });

    // 2. State Changes -> Load Cities
    sMenu.addEventListener("change", (event) => {
        if (event.target.value !== "N/A") {
            fetchCitiesForState(cMenu.value, event.target.value);
            launchBtn.disabled = true; // Wait for city selection
        }
    });

    // 3. City Changes -> Enable Scan
    cityMenu.addEventListener("change", () => launchBtn.disabled = false);

    // 4. Scan Button Logic
    launchBtn.addEventListener("click", () => {
        let query = cMenu.value;
        if (sMenu.value && sMenu.value !== "N/A") query = `${sMenu.value}, ${query}`;
        if (cityMenu.value && cityMenu.value !== "N/A") query = `${cityMenu.value}, ${query}`;
        
        resolveGeographicPosition(query);
    });

    manualInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter" && event.target.value.trim() !== "") {
            resolveGeographicPosition(event.target.value);
        }
    });
}

// Convert string to GPS 
async function resolveGeographicPosition(query) {
    document.getElementById("active-location").textContent = "Establishing Lock...";
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
        const geometryMatrix = await response.json();
        
        if (geometryMatrix.length > 0) {
            // Keep the name short and clean for the UI
            const nameParts = geometryMatrix[0].display_name.split(',');
            const shortName = nameParts.length > 1 ? `${nameParts[0]}, ${nameParts[nameParts.length-1]}` : nameParts[0];
            
            extractMeteorologicalTelemetry(geometryMatrix[0].lat, geometryMatrix[0].lon, shortName);
        } else {
            alert(`Target zone "${query}" could not be cross-referenced.`);
            document.getElementById("active-location").textContent = "Zero Results";
        }
    } catch (networkFault) {
        alert("Satellite communication failure.");
    }
}

// Fetch Weather Data
async function extractMeteorologicalTelemetry(latitude, longitude, designation) {
    const coreEndpoint = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max&timezone=auto`;
    try {
        const internalBuffer = await fetch(coreEndpoint);
        const processingData = await internalBuffer.json();
        refreshDashboardInterface(processingData, designation);
    } catch (fault) {
        console.error("Telemetry Error", fault);
    }
}

// Update UI
function refreshDashboardInterface(payload, identity) {
    const immediateData = payload.current;
    
    document.getElementById("active-location").textContent = identity;
    document.getElementById("active-temp").textContent = `${Math.round(immediateData.temperature_2m)}°C`;
    document.getElementById("tile-wind").textContent = immediateData.wind_speed_10m;
    document.getElementById("tile-humidity").textContent = immediateData.relative_humidity_2m;
    document.getElementById("tile-feels").textContent = Math.round(immediateData.apparent_temperature);
    document.getElementById("tile-rain").textContent = immediateData.precipitation;

    const matrixMapping = {
        0: { desc: "Clear Spatial Field", element: "sun" },
        1: { desc: "Slight Atmospheric Disturbance", element: "cloud-sun" },
        2: { desc: "Scattered Formations", element: "cloud" },
        3: { desc: "Total Dense Overcast", element: "cloud" },
        45: { desc: "Low Visibility Fog", element: "cloud-fog" },
        51: { desc: "Mild Vapor Drizzle", element: "cloud-drizzle" },
        61: { desc: "Precipitation State", element: "cloud-rain" },
        71: { desc: "Crystalline Snowfall", element: "snowflake" },
        95: { desc: "Convective Storm Front", element: "cloud-lightning" }
    };

    const conditionData = matrixMapping[immediateData.weather_code] || { desc: "Standard Conditions", element: "cloud" };
    document.getElementById("active-condition").textContent = conditionData.desc;
    document.getElementById("hero-graphic-element").innerHTML = `<i data-lucide="${conditionData.element}" class="giant-icon"></i>`;

    const layoutScroller = document.getElementById("forecast-row-container");
    layoutScroller.innerHTML = "";
    
    for(let index = 0; index < 5; index++) {
        const indexCondition = matrixMapping[payload.daily.weather_code[index]] || { element: "cloud" };
        const loopDate = new Date(payload.daily.time[index]);
        const calculatedDay = index === 0 ? "Today" : ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][loopDate.getDay()];
        
        layoutScroller.innerHTML += `
            <div class="forecast-element">
                <span class="forecast-day-label">${calculatedDay}</span>
                <i data-lucide="${indexCondition.element}"></i>
                <span class="forecast-temp-readout">${Math.round(payload.daily.temperature_2m_max[index])}°</span>
            </div>
        `;
    }
    
    lucide.createIcons();
}