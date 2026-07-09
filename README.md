# 🌩️ Aero Weather Dashboard

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)

> A next-generation, fully responsive weather forecasting dashboard designed with a modern glassmorphism aesthetic. 

Aero Weather utilizes a live, cascading location selector (**Country → State → City**) that dynamically fetches regional data globally. By relying entirely on client-side JavaScript and open-source APIs, it provides seamless real-time weather telemetry without the need for API keys, backend servers, or massive hardcoded databases.

*(Note: Add a screenshot of your website here by dragging and dropping an image into this README)*
<!-- ![Aero Weather Preview](./preview.png) -->

---

## ✨ Features

* **🌍 Dynamic Global Registry:** Cascading dropdown menus that dynamically fetch and filter every country, state, and city globally using live API resources.
* **🌡️ Real-Time Telemetry:** Displays localized current data including exact temperature, wind velocity, relative humidity, apparent thermal index, and precipitation.
* **📅 Extended 5-Day Forecast:** Computes and visualizes a multi-day meteorological outlook complete with dynamic condition icons.
* **🔍 Smart Manual Search:** Fully operational fallback search bar accepting direct natural text queries (e.g., "Kyoto", "Nairobi").
* **💎 Premium Glassmorphism UI:** Built using cutting-edge CSS design elements, smooth interactive animations, and responsive CSS Grid/Flexbox layouts.
* **🔓 Zero Auth Dependency:** Fully client-side engine running entirely on open-source, keyless public APIs.

---

## 🛠️ Tech Stack & APIs

**Core Frontend:**
* Semantic HTML5
* CSS3 (Custom Properties, Grid, Flexbox, Backdrop-filter)
* Vanilla JavaScript (ES6+ Async/Await, Fetch API)
* [Lucide Icons](https://lucide.dev/)

**Public Data Providers:**
* 📍 **Location Database:** [CountriesNow API](https://countriesnow.space/) *(Powers the Country/State/City dropdown cascade)*
* 🗺️ **Geocoding Engine:** [OpenStreetMap Nominatim API](https://nominatim.openstreetmap.org/) *(Translates location strings into exact latitude/longitude)*
* ☁️ **Weather Telemetry:** [Open-Meteo API](https://open-meteo.com/) *(Processes GPS coordinates into real-time weather matrices)*

---



**1. Clone the repository:**
```bash
git clone [https://github.com/yourusername/AeroWeather.git](https://github.com/yourusername/AeroWeather.git)
