<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bee Web</title>
    <link rel="stylesheet" href="style.css" />
    <!-- Font Awesome Cdn link -->
    <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
    <!-- noUiSlider -->
    <link 
        rel="stylesheet" 
        href="https://cdn.jsdelivr.net/npm/nouislider@15.7.0/dist/nouislider.min.css">

</head>
<body>
    <div class="sidebar">
        <div class="logo"></div>
            <ul class="menu">

                <li class="menu-item active" data-target="dashboard">
                    <a href="#">
                        <i class="fa-solid fa-house"></i>
                        <span>Dashboard</span>
                    </a>
                </li>
                <li class="menu-item" data-target="apiary_information">
                    <a href="#">
                        <i class="fa-solid fa-passport"></i>
                        <span>Apiary information</span>
                    </a>
                </li>
                <li class="menu-item" data-target="hcc_inspection">
                    <a href="#">
                        <i class="fa-solid fa-stethoscope"></i>
                        <span>HCC Inspection</span>
                    </a>
                </li>
                <li class="menu-item" data-target="hive_information">
                    <a href="#">
                        <i class="fa-solid fa-circle-info"></i>
                        <span>Hive information</span>
                    </a>
                </li?>
                <li class="menu-item" data-target="hourly_weather">
                    <a href="#">
                        <i class="fa-solid fa-clock"></i>
                        <span>Hourly Weather</span>
                    </a>
                </li>
                <li class="menu-item" data-target="weather_observation">
                    <a href="#">
                        <i class="fa-solid fa-cloud"></i>
                        <span>Weather Observation</span>
                    </a>
                </li>    
                <li class="menu-item" data-target="weather_station">
                    <a href="#">
                        <i class="fa-solid fa-location-dot"></i>
                        <span>Weather Station</span>
                    </a>
                </li>
                
                <!-- web exit  -->
                <li class="logout menu-item">
                    <a href="#" onclick="window.location.href='http://localhost/bee_web/login/logout.php'">
                        <i class="fa-solid fa-right-from-bracket"></i>
                        <span>Log out</span>
                    </a>
                </li>                            
            </ul>
    </div>

    <div class="main--content">
        <div class="header--wrapper">
            <div class="header--title">
                <span>SQL</span>
                <h2>Query</h2>
            </div>
            <form name="searchForm" class="search--box" action="search.php" method="POST">
                <input type="text" name="search_query" placeholder="Search">
                <button type="submit"><i class="fa-solid fa-search"></i></button>
            </form>
            <div class="user--info">
                <img src="../img/user.jpg" alt="" />
            </div>
        </div>

        <!-- Dynamic container -->
        <div class="tabular--wrapper" id="content-area">
            <h3 class="main--title">Predicting Honeybee Health from Hive & Weather 🐝</h3>
            
            <div class="dashboard-grid">
                <!-- Columna 1: Apiary Health -->
                <div class="dashboard-column">
                    <div class="health-summary">
                        <h2 class="health-title">📊 Apiary Health Dashboard</h2>
                        <div class="health-stats">
                            <div class="stat-card healthy">
                                <div class="stat-value" id="healthy-count">873</div>
                                <div class="stat-label">Healthy Apiaries</div>
                                <div class="stat-percent">36%</div>
                            </div>
                            <div class="stat-card unhealthy">
                                <div class="stat-value" id="unhealthy-count">1,531</div>
                                <div class="stat-label">Needs Attention</div>
                                <div class="stat-percent">64%</div>
                            </div>
                        </div>
                        <div class="health-visual">
                            <canvas id="pieChart"></canvas>
                        </div>
                    </div>
                </div>
                
                <!-- Columna 2: Weather Graphs -->
                <div class="dashboard-column">
                    <!-- Weather Conditions -->
                    <div class="weather-chart-container chart-container">
                        <div class="chart-header">
                            <h4>🌤️ Weather Conditions Analysis</h4>
                        </div>
                        <div class="chart-wrapper">
                            <canvas id="weatherChart"></canvas>
                        </div>
                    </div>
                    
                    <!-- Weather Patterns -->
                    <div class="weather-patterns chart-container">
                        <div class="chart-header">
                            <h4>🌞 Daylight Hours vs Temperature</h4>
                            <div class="time-filter" hidden>
                                <select id="heatmap-range">
                                    <option value="7">Last 7 Days</option>
                                    <option value="30" selected>Last 30 Days</option>
                                    <option value="90">Last 3 Months</option>
                                </select>
                            </div>
                        </div>
                        <div class="heatmap-wrapper">
                            <canvas id="heatmapChart"></canvas>
                            <div class="heatmap-legend" hidden>
                                <div class="legend-title">Temperature (°F)</div>
                                <div class="legend-gradient" hidden>
                                    <span style="background-color: #1e88e5;">&lt;50</span>
                                    <span style="background-color: #4CAF50;">50-65</span>
                                    <span style="background-color: #ffba08;">65-80</span>
                                    <span style="background-color: #e85d04;">&gt;80</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Pop up -->
    <div id="popup" class="popup-overlay">
        <div class="popup-content">
            <span class="close-popup"><i class="fas fa-times"></i></span>
            <div id="popup-results"></div>
        </div>
    </div>

    <!-- Filter pop up -->
        <div id="filter-popup" class="filter-popup hidden">
            <div class="filter-options">
                <div id="filter-content"></div>
            </div>
        </div>

    <script src="app.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/nouislider@15.7.0/dist/nouislider.min.js"></script>
</body>
</html>