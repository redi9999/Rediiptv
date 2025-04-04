<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RedLoad - Multimedia Downloader</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
    <style>
        :root {
            --bg-primary: #FFFFFF;
            --bg-secondary: #F4F4F4;
            --text-primary: #1E1E1E;
            --accent-color: #007AFF;
            --border-radius: 16px;
        }
        
        [data-theme="dark"] {
            --bg-primary: #1a1a1a;
            --bg-secondary: #2d2d2d;
            --text-primary: #FFFFFF;
            --accent-color: #0A84FF;
        }

        body {
            background-color: var(--bg-primary);
            color: var(--text-primary);
            font-family: 'San Francisco', 'Helvetica Neue', Arial, sans-serif;
            transition: background-color 0.3s, color 0.3s;
        }

        [data-theme="dark"] .bg-white {
            background-color: var(--bg-secondary);
        }

        [data-theme="dark"] .text-gray-800 {
            color: var(--text-primary);
        }

        [data-theme="dark"] .border-gray-200 {
            border-color: #404040;
        }

        .slide-sidebar {
            transform: translateX(-100%);
            transition: transform 0.3s ease-in-out;
        }

        .slide-sidebar.active {
            transform: translateX(0);
        }

        .section {
            display: none;
        }

        .section.active {
            display: block;
        }

        .download-item {
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .download-item:hover {
            transform: scale(1.02);
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .notification-panel {
            position: fixed;
            right: -400px;
            top: 80px;
            width: 350px;
            transition: right 0.3s ease-in-out;
            z-index: 1000;
        }

        .notification-panel.active {
            right: 20px;
        }

        /* Auth Modal Styles */
        .auth-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 2000;
            justify-content: center;
            align-items: center;
        }

        .auth-modal.active {
            display: flex;
        }

        .auth-content {
            background: var(--bg-primary);
            padding: 2rem;
            border-radius: 12px;
            width: 90%;
            max-width: 400px;
            position: relative;
        }

        /* Profile Modal Styles */
        .profile-modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 2000;
            justify-content: center;
            align-items: center;
        }

        .profile-modal.active {
            display: flex;
        }

        .profile-content {
            background: var(--bg-primary);
            padding: 2rem;
            border-radius: 12px;
            width: 90%;
            max-width: 400px;
            position: relative;
        }

        /* Splash screen */
        #splash-screen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #007AFF;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        }

        .logo-container {
            margin-bottom: 30px;
        }

        .logo-letter {
            display: inline-block;
            font-size: 4rem;
            font-weight: bold;
            color: white;
            opacity: 0;
            transform: translateY(20px);
        }

        .progress-bar {
            width: 200px;
            height: 4px;
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            overflow: hidden;
        }

        .progress {
            height: 100%;
            width: 0%;
            background-color: white;
            border-radius: 4px;
        }

        /* Selection mode */
        .selection-checkbox {
            display: none;
            width: 20px;
            height: 20px;
            border-radius: 4px;
            border: 2px solid var(--accent-color);
            margin-right: 10px;
        }

        .selection-mode .selection-checkbox {
            display: flex;
        }

        .selection-checkbox.checked {
            background-color: var(--accent-color);
            position: relative;
        }

        .selection-checkbox.checked::after {
            content: "✓";
            position: absolute;
            color: white;
            font-size: 12px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }

        /* Animation Keyframes */
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideUp {
            from { transform: translateY(20px); }
            to { transform: translateY(0); }
        }
        
        @keyframes progress {
            from { width: 0%; }
            to { width: 100%; }
        }
    </style>
</head>
<body>
    <!-- Splash Screen -->
    <div id="splash-screen">
        <div class="logo-container">
            <span class="logo-letter" style="animation: fadeIn 0.5s ease 0s forwards, slideUp 0.5s ease 0s forwards;">R</span>
            <span class="logo-letter" style="animation: fadeIn 0.5s ease 0.2s forwards, slideUp 0.5s ease 0.2s forwards;">e</span>
            <span class="logo-letter" style="animation: fadeIn 0.5s ease 0.4s forwards, slideUp 0.5s ease 0.4s forwards;">d</span>
            <span class="logo-letter" style="animation: fadeIn 0.5s ease 0.6s forwards, slideUp 0.5s ease 0.6s forwards;">L</span>
            <span class="logo-letter" style="animation: fadeIn 0.5s ease 0.8s forwards, slideUp 0.5s ease 0.8s forwards;">o</span>
            <span class="logo-letter" style="animation: fadeIn 0.5s ease 1.0s forwards, slideUp 0.5s ease 1.0s forwards;">a</span>
            <span class="logo-letter" style="animation: fadeIn 0.5s ease 1.2s forwards, slideUp 0.5s ease 1.2s forwards;">d</span>
        </div>
        <div class="progress-bar">
            <div class="progress" style="animation: progress 2s ease-in-out forwards;"></div>
        </div>
    </div>

    <!-- Auth Modal -->
    <div id="auth-modal" class="auth-modal">
        <div class="auth-content shadow-lg">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800">Account</h2>
                <button id="close-auth" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <div id="auth-error" class="hidden bg-red-100 text-red-700 p-3 rounded mb-4"></div>

            <form id="auth-form" class="space-y-4">
                <input type="email" id="auth-email" placeholder="Email" 
                    class="w-full bg-gray-100 text-gray-800 p-3 rounded-lg border border-gray-200">
                
                <input type="password" id="auth-password" placeholder="Password" 
                    class="w-full bg-gray-100 text-gray-800 p-3 rounded-lg border border-gray-200">
                
                <button type="submit" id="auth-submit" 
                    class="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition">
                    Sign In
                </button>

                <p id="auth-switch" class="text-center text-blue-500 hover:text-blue-600 cursor-pointer">
                    Don't have an account? Sign Up
                </p>

                <div class="relative my-6">
                    <div class="absolute inset-0 flex items-center">
                        <div class="w-full border-t border-gray-300"></div>
                    </div>
                    <div class="relative flex justify-center text-sm">
                        <span class="px-2 bg-white text-gray-500">or</span>
                    </div>
                </div>

                <button type="button" id="google-auth" 
                    class="w-full border border-gray-300 p-3 rounded-lg hover:bg-gray-50 transition flex items-center justify-center">
                    <img src="https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png" 
                        alt="Google" class="w-5 h-5 mr-2">
                    Continue with Google
                </button>
            </form>
        </div>
    </div>

    <!-- Profile Modal -->
    <div id="profile-modal" class="profile-modal">
        <div class="profile-content shadow-lg">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800">Profile</h2>
                <button id="close-profile" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <div class="flex flex-col items-center mb-6">
                <div class="relative">
                    <img id="profile-image" src="https://via.placeholder.com/150" alt="Profile" 
                        class="w-24 h-24 rounded-full object-cover border-2 border-blue-500">
                    <button id="change-photo" class="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-2 shadow-lg">
                        <i class="fas fa-camera"></i>
                    </button>
                    <input type="file" id="photo-upload" accept="image/*" class="hidden">
                </div>
                <h3 id="profile-name" class="text-xl font-semibold mt-4">User</h3>
                <p id="profile-email" class="text-gray-500">user@example.com</p>
            </div>

            <div class="mb-6">
                <label for="display-name" class="block text-gray-700 mb-2">Display Name</label>
                <input type="text" id="display-name" placeholder="Your name" 
                    class="w-full bg-gray-100 text-gray-800 p-3 rounded-lg border border-gray-200">
            </div>

            <div class="flex space-x-3">
                <button id="save-profile" class="flex-1 bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition">
                    Save Changes
                </button>
                <button id="logout-btn" class="flex-1 bg-gray-200 text-gray-800 p-3 rounded-lg hover:bg-gray-300 transition">
                    Logout
                </button>
            </div>
        </div>
    </div>

    <!-- Sidebar -->
    <div id="sidebar" class="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-xl z-50 slide-sidebar p-6">
        <div class="flex flex-col space-y-6">
            <button id="close-sidebar" class="self-end text-gray-600 text-2xl">
                <i class="fas fa-times"></i>
            </button>
            <div class="space-y-4">
                <button id="home-option" class="sidebar-option w-full text-left p-3 hover:bg-gray-100 rounded-lg flex items-center">
                    <i class="fas fa-home mr-3 text-blue-500"></i> Home
                </button>
                <button id="download-option" class="sidebar-option w-full text-left p-3 hover:bg-gray-100 rounded-lg flex items-center">
                    <i class="fas fa-download mr-3 text-green-500"></i> Download
                </button>
                <button id="library-option" class="sidebar-option w-full text-left p-3 hover:bg-gray-100 rounded-lg flex items-center">
                    <i class="fas fa-archive mr-3 text-purple-500"></i> Library
                </button>
                <button id="settings-option" class="sidebar-option w-full text-left p-3 hover:bg-gray-100 rounded-lg flex items-center">
                    <i class="fas fa-cog mr-3 text-gray-500"></i> Settings
                </button>
            </div>
        </div>
    </div>

    <!-- Notification Panel -->
    <div id="notification-panel" class="notification-panel">
        <div class="bg-white shadow-lg rounded-lg p-4 border border-gray-200">
            <div class="flex justify-between items-center mb-3">
                <h3 class="font-bold text-gray-800">Notifications</h3>
                <button id="close-notifications" class="text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div id="notifications-container" class="space-y-2 max-h-96 overflow-y-auto">
                <!-- Notifications will be added here -->
            </div>
        </div>
    </div>

    <!-- Main Container -->
    <div class="container mx-auto max-w-md min-h-screen relative">
        <!-- Header -->
        <header class="p-6 flex justify-between items-center">
            <div class="flex items-center">
                <i class="fas fa-cloud-download-alt text-blue-500 mr-3 text-3xl"></i>
                <h1 class="text-3xl font-bold text-gray-800">RedLoad</h1>
            </div>
            <div class="flex space-x-4">
                <button id="notifications-btn" class="relative text-gray-600 hover:text-blue-500 transition">
                    <i class="fas fa-bell text-2xl"></i>
                    <span id="notification-badge" class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">0</span>
                </button>
                <button id="profile-btn" class="text-gray-600 hover:text-blue-500 transition">
                    <i class="fas fa-user-circle text-2xl"></i>
                </button>
                <button id="toggle-sidebar" class="text-gray-600 text-2xl">
                    <i class="fas fa-bars"></i>
                </button>
            </div>
        </header>

        <!-- Main Sections -->
        <main class="p-6">
            <!-- Home/Download Section -->
            <section id="home-section" class="section active">
                <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <select 
                        id="platform-select" 
                        class="w-full bg-gray-100 text-gray-800 p-3 rounded-lg mb-4 border border-gray-200"
                    >
                        <option value="">Select Platform</option>
                        <option value="tiktok">TikTok</option>
                        <option value="youtube">YouTube</option>
                        <option value="instagram">Instagram</option>
                        <option value="facebook">Facebook</option>
                    </select>

                    <input 
                        id="video-url-input" 
                        type="text" 
                        placeholder="Paste video/audio link" 
                        class="w-full bg-gray-100 text-gray-800 p-3 rounded-lg mb-4 border border-gray-200"
                    >

                    <button 
                        id="download-btn" 
                        class="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition"
                    >
                        Download Content
                    </button>

                    <div id="error-message" class="text-red-500 text-center mt-3 hidden"></div>

                    <!-- Platform Quick Access -->
                    <div class="grid grid-cols-4 gap-4 mt-6">
                        <button id="tiktok-btn" class="platform-btn bg-gray-100 p-4 rounded-xl flex justify-center items-center hover:bg-gray-200 transition">
                            <i class="fab fa-tiktok text-3xl text-black"></i>
                        </button>
                        <button id="youtube-btn" class="platform-btn bg-gray-100 p-4 rounded-xl flex justify-center items-center hover:bg-gray-200 transition">
                            <i class="fab fa-youtube text-3xl text-red-500"></i>
                        </button>
                        <button id="instagram-btn" class="platform-btn bg-gray-100 p-4 rounded-xl flex justify-center items-center hover:bg-gray-200 transition">
                            <i class="fab fa-instagram text-3xl text-pink-500"></i>
                        </button>
                        <button id="facebook-btn" class="platform-btn bg-gray-100 p-4 rounded-xl flex justify-center items-center hover:bg-gray-200 transition">
                            <i class="fab fa-facebook text-3xl text-blue-500"></i>
                        </button>
                    </div>
                </div>

                <!-- Download History Actions -->
                <div class="mt-6 flex justify-between items-center">
                    <h2 class="text-xl font-bold text-gray-800">Recent Downloads</h2>
                    <div class="flex space-x-2">
                        <button id="select-downloads" class="text-blue-500 hover:text-blue-600 transition">
                            <i class="fas fa-check-square mr-1"></i> Select
                        </button>
                        <button id="clear-downloads" class="text-red-500 hover:text-red-600 transition">
                            <i class="fas fa-trash-alt mr-1"></i> Clear All
                        </button>
                    </div>
                </div>

                <!-- Selection Actions (Hidden by Default) -->
                <div id="selection-actions" class="mt-2 flex justify-end space-x-2 hidden">
                    <button id="cancel-selection" class="text-gray-500 hover:text-gray-600 transition">
                        Cancel
                    </button>
                    <button id="delete-selected" class="text-red-500 hover:text-red-600 transition">
                        <i class="fas fa-trash-alt mr-1"></i> Delete Selected
                    </button>
                </div>

                <!-- Download History -->
                <div id="download-list" class="mt-2 space-y-4">
                    <!-- Downloads will be added here -->
                </div>
            </section>

            <!-- Library Section -->
            <section id="library-section" class="section">
                <h2 class="text-3xl mb-6 text-gray-800">Library</h2>
                <div class="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
                    <div class="mb-4">
                        <h3 class="text-xl mb-3 text-gray-800">Categories</h3>
                        <div class="grid grid-cols-3 gap-3">
                            <button class="bg-blue-100 text-blue-700 p-3 rounded-lg hover:bg-blue-200 transition">
                                Videos
                            </button>
                            <button class="bg-green-100 text-green-700 p-3 rounded-lg hover:bg-green-200 transition">
                                Audio
                            </button>
                            <button class="bg-purple-100 text-purple-700 p-3 rounded-lg hover:bg-purple-200 transition">
                                Photos
                            </button>
                        </div>
                    </div>
                    
                    <div class="mb-4">
                        <h3 class="text-xl mb-3 text-gray-800">Platforms</h3>
                        <div class="grid grid-cols-2 gap-3">
                            <button class="bg-gray-100 text-gray-700 p-3 rounded-lg hover:bg-gray-200 transition flex items-center justify-center">
                                <i class="fab fa-youtube text-red-500 mr-2"></i> YouTube
                            </button>
                            <button class="bg-gray-100 text-gray-700 p-3 rounded-lg hover:bg-gray-200 transition flex items-center justify-center">
                                <i class="fab fa-tiktok text-black mr-2"></i> TikTok
                            </button>
                            <button class="bg-gray-100 text-gray-700 p-3 rounded-lg hover:bg-gray-200 transition flex items-center justify-center">
                                <i class="fab fa-instagram text-pink-500 mr-2"></i> Instagram
                            </button>
                            <button class="bg-gray-100 text-gray-700 p-3 rounded-lg hover:bg-gray-200 transition flex items-center justify-center">
                                <i class="fab fa-facebook text-blue-500 mr-2"></i> Facebook
                            </button>
                        </div>
                    </div>
                    
                    <div>
                        <h3 class="text-xl mb-3 text-gray-800">Recent Downloads</h3>
                        <div id="library-items" class="space-y-3">
                            <!-- Library items will be dynamically added here -->
                        </div>
                    </div>
                </div>
            </section>

            <!-- Settings Section -->
            <section id="settings-section" class="section">
                <h2 class="text-3xl mb-6 text-gray-800">Settings</h2>
                <div class="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-6">
                    <div class="flex justify-between items-center">
                        <span class="text-gray-800">App Theme</span>
                        <select id="theme-select" class="bg-gray-100 text-gray-800 p-2 rounded border border-gray-200">
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="system">System</option>
                        </select>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-800">Download Directory</span>
                        <input type="text" id="download-directory" class="bg-gray-100 text-gray-800 p-2 rounded border border-gray-200" placeholder="/Downloads">
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-800">Preferred Format</span>
                        <select id="format-select" class="bg-gray-100 text-gray-800 p-2 rounded border border-gray-200">
                            <option value="mp4">MP4</option>
                            <option value="mp3">MP3</option>
                            <option value="wav">WAV</option>
                        </select>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-800">Default Quality</span>
                        <select id="default-quality" class="bg-gray-100 text-gray-800 p-2 rounded border border-gray-200">
                            <option value="highest">Highest</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-800">Language</span>
                        <select id="language-select" class="bg-gray-100 text-gray-800 p-2 rounded border border-gray-200">
                            <option value="en">English</option>
                            <option value="it">Italian</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                        </select>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-800">Notifications</span>
                        <label class="inline-flex items-center cursor-pointer">
                            <div class="relative">
                                <input id="notifications-toggle" type="checkbox" class="sr-only peer" checked>
                                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                            </div>
                        </label>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-800">Email Notifications</span>
                        <label class="inline-flex items-center cursor-pointer">
                            <div class="relative">
                                <input id="email-notifications-toggle" type="checkbox" class="sr-only peer">
                                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                            </div>
                        </label>
                    </div>
                    <button id="save-settings" class="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition">
                        Save Settings
                    </button>
                </div>
            </section>
        </main>
    </div>

    <!-- Firebase Integration -->
    <script type="module">
        // Import the functions you need from the SDKs you need
        import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
        import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-analytics.js";
        import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider, updateProfile } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
        import { getDatabase, ref, set, onValue, push, remove } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
        import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-storage.js";

        // Your web app's Firebase configuration
        const firebaseConfig = {
            apiKey: "AIzaSyDsG696dtUXBr2a0DXB1WXlmdx2RoHYItc",
            authDomain: "sing-in-sing-up-35ffc.firebaseapp.com",
            projectId: "sing-in-sing-up-35ffc",
            storageBucket: "sing-in-sing-up-35ffc.firebasestorage.app",
            messagingSenderId: "601804043161",
            appId: "1:601804043161:web:8eb591c60c93352411d908",
            measurementId: "G-JR8WR68YDY",
            databaseURL: "https://realtime-database-b5320-default-rtdb.firebaseio.com/"
        };

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const analytics = getAnalytics(app);
        const auth = getAuth(app);
        const database = getDatabase(app);
        const storage = getStorage(app);
        const googleProvider = new GoogleAuthProvider();

        // API Configuration
        const RAPID_API_KEY = 'c45e3a9bb9mshdc35687e676d5bap19dbdejsn6b4e0db401f0';
        const RAPID_API_HOST = 'social-media-video-downloader.p.rapidapi.com';

        // Application State
        let currentUser = null;
        let isLoginMode = true;
        let theme = localStorage.getItem('theme') || 'light';
        let downloads = [];
        let notifications = [];
        let isSelectionMode = false;
        let selectedItems = new Set();
        let settings = {
            theme: 'light',
            language: 'en',
            downloadDirectory: '/Downloads',
            preferredFormat: 'mp4',
            defaultQuality: 'highest',
            notificationsEnabled: true,
            emailNotificationsEnabled: false
        };

        // DOM Elements
        const splashScreen = document.getElementById('splash-screen');
        const sidebar = document.getElementById('sidebar');
        const notificationPanel = document.getElementById('notification-panel');
        const authModal = document.getElementById('auth-modal');
        const profileModal = document.getElementById('profile-modal');
        const notificationBadge = document.getElementById('notification-badge');
        const errorMessage = document.getElementById('error-message');
        const downloadList = document.getElementById('download-list');
        const libraryItems = document.getElementById('library-items');
        const selectionActions = document.getElementById('selection-actions');
        const authForm = document.getElementById('auth-form');
        const authErrorElement = document.getElementById('auth-error');
        const authEmailInput = document.getElementById('auth-email');
        const authPasswordInput = document.getElementById('auth-password');
        const authSubmitButton = document.getElementById('auth-submit');
        const authSwitchButton = document.getElementById('auth-switch');
        const googleAuthButton = document.getElementById('google-auth');
        const profileNameElement = document.getElementById('profile-name');
        const profileEmailElement = document.getElementById('profile-email');
        const profileImageElement = document.getElementById('profile-image');
        const displayNameInput = document.getElementById('display-name');
        const photoUploadInput = document.getElementById('photo-upload');
        const saveProfileButton = document.getElementById('save-profile');
        const logoutButton = document.getElementById('logout-btn');
        const changePhotoButton = document.getElementById('change-photo');
        const platformSelect = document.getElementById('platform-select');
        const videoUrlInput = document.getElementById('video-url-input');
        const downloadBtn = document.getElementById('download-btn');
        const themeSelect = document.getElementById('theme-select');
        const downloadDirectoryInput = document.getElementById('download-directory');
        const formatSelect = document.getElementById('format-select');
        const qualitySelect = document.getElementById('default-quality');
        const languageSelect = document.getElementById('language-select');
        const notificationsToggle = document.getElementById('notifications-toggle');
        const emailNotificationsToggle = document.getElementById('email-notifications-toggle');
        const saveSettingsButton = document.getElementById('save-settings');
        const selectDownloadsButton = document.getElementById('select-downloads');
        const clearDownloadsButton = document.getElementById('clear-downloads');
        const cancelSelectionButton = document.getElementById('cancel-selection');
        const deleteSelectedButton = document.getElementById('delete-selected');

        // Initialize Application
        document.addEventListener('DOMContentLoaded', function() {
            // Splash Screen
            setTimeout(() => {
                splashScreen.style.opacity = '0';
                splashScreen.style.transition = 'opacity 0.5s ease-in-out';
                setTimeout(() => {
                    splashScreen.style.display = 'none';
                }, 500);
            }, 3000);

            // Apply Saved Theme
            document.body.dataset.theme = theme;
            themeSelect.value = theme;

            // Auth State Listener
            onAuthStateChanged(auth, (user) => {
                currentUser = user;
                if (user) {
                    // User is signed in
                    profileNameElement.textContent = user.displayName || 'User';
                    profileEmailElement.textContent = user.email;
                    displayNameInput.value = user.displayName || '';
                    if (user.photoURL) {
                        profileImageElement.src = user.photoURL;
                    } else {
                        profileImageElement.src = 'https://via.placeholder.com/150?text=' + (user.displayName?.[0] || 'U');
                    }

                    // Load user downloads
                    const userDownloadsRef = ref(database, `users/${user.uid}/downloads`);
                    onValue(userDownloadsRef, (snapshot) => {
                        const data = snapshot.val();
                        if (data) {
                            downloads = Object.keys(data).map(key => ({
                                id: key,
                                ...data[key]
                            })).sort((a, b) => b.timestamp - a.timestamp);
                            renderDownloads();
                            renderLibrary();
                        } else {
                            downloads = [];
                            renderDownloads();
                            renderLibrary();
                        }
                    });

                    // Load user settings
                    const userSettingsRef = ref(database, `users/${user.uid}/settings`);
                    onValue(userSettingsRef, (snapshot) => {
                        const data = snapshot.val();
                        if (data) {
                            settings = {...settings, ...data};
                            applySettings();
                        }
                    });
                    
                    addNotification('Logged In', 'Welcome to RedLoad!', 'success');
                } else {
                    // User is signed out
                    profileNameElement.textContent = 'User';
                    profileEmailElement.textContent = 'Not logged in';
                    profileImageElement.src = 'https://via.placeholder.com/150?text=U';
                    displayNameInput.value = '';
                    downloads = [];
                    renderDownloads();
                    renderLibrary();
                }
            });

            // Event Listeners
            setupEventListeners();
        });

        // Setup Event Listeners
        function setupEventListeners() {
            // Sidebar Navigation
            document.getElementById('toggle-sidebar').addEventListener('click', () => {
                sidebar.classList.add('active');
            });

            document.getElementById('close-sidebar').addEventListener('click', () => {
                sidebar.classList.remove('active');
            });

            const sidebarOptions = document.querySelectorAll('.sidebar-option');
            sidebarOptions.forEach(option => {
                option.addEventListener('click', function() {
                    const sections = document.querySelectorAll('.section');
                    sections.forEach(section => section.classList.remove('active'));
                    
                    const sectionId = this.id.split('-')[0] + '-section';
                    document.getElementById(sectionId).classList.add('active');
                    
                    sidebar.classList.remove('active');
                });
            });

            // Notifications
            document.getElementById('notifications-btn').addEventListener('click', () => {
                notificationPanel.classList.toggle('active');
            });

            document.getElementById('close-notifications').addEventListener('click', () => {
                notificationPanel.classList.remove('active');
            });

            // Profile
            document.getElementById('profile-btn').addEventListener('click', () => {
                if (currentUser) {
                    profileModal.classList.add('active');
                } else {
                    authModal.classList.add('active');
                }
            });

            document.getElementById('close-profile').addEventListener('click', () => {
                profileModal.classList.remove('active');
            });

            // Auth Modal
            document.getElementById('close-auth').addEventListener('click', () => {
                authModal.classList.remove('active');
                authErrorElement.classList.add('hidden');
                authEmailInput.value = '';
                authPasswordInput.value = '';
            });

            // Auth Form
            authForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const email = authEmailInput.value.trim();
                const password = authPasswordInput.value;

                if (!email || !password) {
                    showAuthError('Please enter both email and password');
                    return;
                }

                if (isLoginMode) {
                    // Login
                    signInWithEmailAndPassword(auth, email, password)
                        .then(() => {
                            authModal.classList.remove('active');
                            clearAuthForm();
                        })
                        .catch((error) => {
                            showAuthError(getAuthErrorMessage(error.code));
                        });
                } else {
                    // Register
                    createUserWithEmailAndPassword(auth, email, password)
                        .then(() => {
                            authModal.classList.remove('active');
                            clearAuthForm();
                        })
                        .catch((error) => {
                            showAuthError(getAuthErrorMessage(error.code));
                        });
                }
            });

            // Google Auth
            googleAuthButton.addEventListener('click', () => {
                signInWithPopup(auth, googleProvider)
                    .then(() => {
                        authModal.classList.remove('active');
                    })
                    .catch((error) => {
                        showAuthError('Failed to sign in with Google');
                        console.error(error);
                    });
            });

            // Switch Auth Mode
            authSwitchButton.addEventListener('click', () => {
                isLoginMode = !isLoginMode;
                if (isLoginMode) {
                    authSwitchButton.textContent = "Don't have an account? Sign Up";
                    authSubmitButton.textContent = "Sign In";
                } else {
                    authSwitchButton.textContent = "Already have an account? Sign In";
                    authSubmitButton.textContent = "Sign Up";
                }
                clearAuthForm();
            });

            // Logout
            logoutButton.addEventListener('click', () => {
                signOut(auth)
                    .then(() => {
                        profileModal.classList.remove('active');
                        addNotification('Logged Out', 'You have been successfully logged out', 'info');
                    })
                    .catch((error) => {
                        addNotification('Logout Failed', 'There was an error logging out', 'error');
                        console.error(error);
                    });
            });

            // Profile Photo Upload
            changePhotoButton.addEventListener('click', () => {
                photoUploadInput.click();
            });

            photoUploadInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    const file = e.target.files[0];
                    uploadProfilePhoto(file);
                }
            });

            // Save Profile
            saveProfileButton.addEventListener('click', () => {
                updateUserProfile();
            });

            // Platform Quick Select
            const platformButtons = document.querySelectorAll('.platform-btn');
            platformButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const platform = this.id.split('-')[0];
                    platformSelect.value = platform;
                });
            });

            // Download Content
            downloadBtn.addEventListener('click', () => {
                downloadContent();
            });

            // Save Settings
            saveSettingsButton.addEventListener('click', () => {
                saveUserSettings();
            });

            // Theme Change
            themeSelect.addEventListener('change', function() {
                const newTheme = this.value;
                setTheme(newTheme);
            });

            // Selection Mode
            selectDownloadsButton.addEventListener('click', () => {
                isSelectionMode = true;
                document.getElementById('download-list').classList.add('selection-mode');
                selectionActions.classList.remove('hidden');
                selectDownloadsButton.classList.add('hidden');
                clearDownloadsButton.classList.add('hidden');
            });

            cancelSelectionButton.addEventListener('click', () => {
                isSelectionMode = false;
                document.getElementById('download-list').classList.remove('selection-mode');
                selectionActions.classList.add('hidden');
                selectDownloadsButton.classList.remove('hidden');
                clearDownloadsButton.classList.remove('hidden');
                selectedItems.clear();
                renderDownloads();
            });

            deleteSelectedButton.addEventListener('click', () => {
                deleteSelectedDownloads();
            });

            clearDownloadsButton.addEventListener('click', () => {
                clearAllDownloads();
            });
        }

        // Download Functions
        function downloadContent() {
            const platform = platformSelect.value;
            const url = videoUrlInput.value.trim();
            
            if (!platform) {
                showError('Please select a platform');
                return;
            }
            
            if (!url) {
                showError('Please enter a valid URL');
                return;
            }
            
            showError(''); // Clear previous errors
            downloadBtn.disabled = true;
            downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Loading...';
            
            const platformEndpoints = {
                'youtube': 'smvd/get/youtube',
                'tiktok': 'smvd/get/tiktok',
                'instagram': 'smvd/get/instagram',
                'facebook': 'smvd/get/facebook'
            };
            
            const endpoint = platformEndpoints[platform];
            const apiUrl = `https://${RAPID_API_HOST}/${endpoint}?url=${encodeURIComponent(url)}&quality=${settings.defaultQuality}`;
            
            fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'x-rapidapi-key': RAPID_API_KEY,
                    'x-rapidapi-host': RAPID_API_HOST
                }
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Server error: ' + response.status);
                }
                return response.json();
            })
            .then(result => {
                if (!result.success) {
                    throw new Error(result.message || 'Failed to download content');
                }
                
                const downloadItem = {
                    id: Date.now().toString(),
                    title: result.title || 'Untitled Content',
                    platform: platform,
                    thumbnail: result.picture || result.thumbnail || 'https://via.placeholder.com/640x360.png?text=No+Thumbnail',
                    links: result.links || [],
                    format: settings.preferredFormat,
                    quality: result.quality || settings.defaultQuality,
                    timestamp: Date.now()
                };
                
                // Save to database if logged in
                if (currentUser) {
                    const newDownloadRef = ref(database, `users/${currentUser.uid}/downloads/${downloadItem.id}`);
                    set(newDownloadRef, downloadItem);
                }
                
                // Add to state and render
                downloads.unshift(downloadItem);
                renderDownloads();
                renderLibrary();
                
                addNotification('Download Ready', 'Your content is ready to download', 'success');
                videoUrlInput.value = '';
            })
            .catch(error => {
                showError(error.message || 'An unknown error occurred');
                addNotification('Download Failed', error.message || 'An error occurred during download', 'error');
            })
            .finally(() => {
                downloadBtn.disabled = false;
                downloadBtn.innerHTML = 'Download Content';
            });
        }

        function renderDownloads() {
            downloadList.innerHTML = '';
            
            if (downloads.length === 0) {
                downloadList.innerHTML = `
                    <div class="text-center py-10 text-gray-500">
                        <i class="fas fa-download text-5xl mb-4"></i>
                        <p>No downloads yet</p>
                    </div>
                `;
                return;
            }
            
            downloads.forEach(item => {
                const downloadItem = document.createElement('div');
                downloadItem.classList.add('bg-white', 'p-4', 'rounded-lg', 'shadow-sm', 'border', 'border-gray-200', 'download-item', 'flex', 'flex-col');
                downloadItem.dataset.id = item.id;
                
                let selected = selectedItems.has(item.id);
                let selectionHTML = isSelectionMode ? `
                    <div class="selection-checkbox ${selected ? 'checked' : ''}" data-id="${item.id}"></div>
                ` : '';
                
                downloadItem.innerHTML = `
                    <div class="flex items-center space-x-3">
                        ${selectionHTML}
                        <img src="${item.thumbnail}" class="w-16 h-12 rounded object-cover" alt="Thumbnail">
                        <div class="flex-1">
                            <p class="font-semibold text-gray-800 truncate max-w-[200px]">${item.title}</p>
                            <p class="text-sm text-gray-500">${item.platform.charAt(0).toUpperCase() + item.platform.slice(1)}</p>
                        </div>
                        <div class="flex space-x-2">
                            <button class="text-red-500 hover:text-red-600 transition delete-download" data-id="${item.id}">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                    <div class="mt-3">
                        <select class="quality-select w-full p-2 rounded border border-gray-200 bg-gray-100 mb-2">
                            ${item.links.map((link, index) => `
                                <option value="${link.link}">Quality ${link.quality || `Option ${index + 1}`}</option>
                            `).join('')}
                        </select>
                        <button class="download-link-btn w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition">
                            Download
                        </button>
                    </div>
                `;
                
                downloadList.appendChild(downloadItem);
                
                const qualitySelect = downloadItem.querySelector('.quality-select');
                const downloadLinkBtn = downloadItem.querySelector('.download-link-btn');
                
                if (item.links.length === 0) {
                    qualitySelect.innerHTML = '<option>No download options available</option>';
                    qualitySelect.disabled = true;
                    downloadLinkBtn.disabled = true;
                }
                
                downloadLinkBtn.addEventListener('click', () => {
                    window.open(qualitySelect.value, '_blank');
                    addNotification('Download Started', 'Your download will begin shortly...', 'success');
                });
                
                const deleteButton = downloadItem.querySelector('.delete-download');
                if (deleteButton) {
                    deleteButton.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const id = deleteButton.dataset.id;
                        deleteDownload(id);
                    });
                }
                
                const selectionCheckbox = downloadItem.querySelector('.selection-checkbox');
                if (selectionCheckbox) {
                    selectionCheckbox.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const id = selectionCheckbox.dataset.id;
                        toggleSelection(id);
                    });
                    
                    if (isSelectionMode) {
                        downloadItem.addEventListener('click', () => {
                            const id = downloadItem.dataset.id;
                            toggleSelection(id);
                        });
                    }
                }
            });
        }

        function renderLibrary() {
            libraryItems.innerHTML = '';
            
            if (downloads.length === 0) {
                libraryItems.innerHTML = `
                    <div class="text-center py-6 text-gray-500">
                        <p>Your library is empty</p>
                    </div>
                `;
                return;
            }
            
            // Display only the 5 most recent items in the library view
            const recentDownloads = downloads.slice(0, 5);
            
            recentDownloads.forEach(item => {
                const libraryItem = document.createElement('div');
                libraryItem.classList.add('flex', 'items-center', 'space-x-3', 'p-3', 'bg-gray-50', 'rounded-lg');
                
                libraryItem.innerHTML = `
                    <img src="${item.thumbnail}" class="w-12 h-10 rounded object-cover" alt="Thumbnail">
                    <div class="flex-1">
                        <p class="font-semibold text-gray-800 truncate max-w-[200px]">${item.title}</p>
                        <p class="text-xs text-gray-500">${new Date(item.timestamp).toLocaleDateString()}</p>
                    </div>
                    <a href="#" class="text-blue-500 hover:text-blue-600 transition view-download" data-id="${item.id}">
                        <i class="fas fa-download"></i>
                    </a>
                `;
                
                libraryItems.appendChild(libraryItem);
                
                const viewButton = libraryItem.querySelector('.view-download');
                viewButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    // Switch to the home section and scroll to the download
                    const sections = document.querySelectorAll('.section');
                    sections.forEach(section => section.classList.remove('active'));
                    document.getElementById('home-section').classList.add('active');
                    
                    const downloadItem = document.querySelector(`.download-item[data-id="${item.id}"]`);
                    if (downloadItem) {
                        downloadItem.scrollIntoView({behavior: 'smooth'});
                        downloadItem.classList.add('bg-blue-50');
                        setTimeout(() => {
                            downloadItem.classList.remove('bg-blue-50');
                        }, 2000);
                    }
                });
            });
        }

        function toggleSelection(id) {
            if (selectedItems.has(id)) {
                selectedItems.delete(id);
            } else {
                selectedItems.add(id);
            }
            renderDownloads();
        }

        function deleteDownload(id) {
            if (confirm('Are you sure you want to delete this download?')) {
                if (currentUser) {
                    const downloadRef = ref(database, `users/${currentUser.uid}/downloads/${id}`);
                    remove(downloadRef);
                }
                
                downloads = downloads.filter(item => item.id !== id);
                renderDownloads();
                renderLibrary();
                addNotification('Item Deleted', 'Download has been removed', 'info');
            }
        }

        function deleteSelectedDownloads() {
            if (selectedItems.size === 0) {
                addNotification('No Items Selected', 'Please select items to delete', 'warning');
                return;
            }
            
            if (confirm(`Are you sure you want to delete ${selectedItems.size} selected item(s)?`)) {
                if (currentUser) {
                    selectedItems.forEach(id => {
                        const downloadRef = ref(database, `users/${currentUser.uid}/downloads/${id}`);
                        remove(downloadRef);
                    });
                }
                
                downloads = downloads.filter(item => !selectedItems.has(item.id));
                selectedItems.clear();
                isSelectionMode = false;
                document.getElementById('download-list').classList.remove('selection-mode');
                selectionActions.classList.add('hidden');
                selectDownloadsButton.classList.remove('hidden');
                clearDownloadsButton.classList.remove('hidden');
                renderDownloads();
                renderLibrary();
                addNotification('Items Deleted', `Removed ${selectedItems.size} item(s)`, 'info');
            }
        }

        function clearAllDownloads() {
            if (downloads.length === 0) return;
            
            if (confirm('Are you sure you want to clear all downloads?')) {
                if (currentUser) {
                    const downloadsRef = ref(database, `users/${currentUser.uid}/downloads`);
                    remove(downloadsRef);
                }
                
                downloads = [];
                renderDownloads();
                renderLibrary();
                addNotification('History Cleared', 'Your download history has been cleared', 'info');
            }
        }

        // Profile Functions
        function uploadProfilePhoto(file) {
            if (!currentUser) {
                addNotification('Not Logged In', 'Please log in to update your profile photo', 'error');
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) {
                addNotification('File Too Large', 'Please select an image smaller than 5MB', 'error');
                return;
            }
            
            const fileRef = storageRef(storage, `profile_photos/${currentUser.uid}`);
            
            uploadBytes(fileRef, file)
                .then(() => getDownloadURL(fileRef))
                .then(url => {
                    updateProfile(currentUser, {
                        photoURL: url
                    });
                    profileImageElement.src = url;
                    addNotification('Photo Updated', 'Your profile photo has been updated', 'success');
                })
                .catch(error => {
                    addNotification('Upload Failed', 'There was an error uploading your photo', 'error');
                    console.error(error);
                });
        }

        function updateUserProfile() {
            if (!currentUser) {
                addNotification('Not Logged In', 'Please log in to update your profile', 'error');
                return;
            }
            
            const newDisplayName = displayNameInput.value.trim();
            
            if (!newDisplayName) {
                addNotification('Invalid Name', 'Please enter a valid display name', 'error');
                return;
            }
            
            updateProfile(currentUser, {
                displayName: newDisplayName
            })
            .then(() => {
                profileNameElement.textContent = newDisplayName;
                addNotification('Profile Updated', 'Your profile has been successfully updated', 'success');
                
                // Also update user settings
                saveUserSettings();
            })
            .catch(error => {
                addNotification('Update Failed', 'There was an error updating your profile', 'error');
                console.error(error);
            });
        }

        // Settings Functions
        function saveUserSettings() {
            settings = {
                theme: themeSelect.value,
                language: languageSelect.value,
                downloadDirectory: downloadDirectoryInput.value,
                preferredFormat: formatSelect.value,
                defaultQuality: qualitySelect.value,
                notificationsEnabled: notificationsToggle.checked,
                emailNotificationsEnabled: emailNotificationsToggle.checked
            };
            
            if (currentUser) {
                const userSettingsRef = ref(database, `users/${currentUser.uid}/settings`);
                set(userSettingsRef, settings)
                    .then(() => {
                        addNotification('Settings Saved', 'Your settings have been updated', 'success');
                    })
                    .catch(error => {
                        addNotification('Save Failed', 'There was an error saving your settings', 'error');
                        console.error(error);
                    });
            } else {
                // Save locally for non-logged-in users
                localStorage.setItem('redload_settings', JSON.stringify(settings));
                addNotification('Settings Saved', 'Your settings have been updated locally', 'success');
            }
            
            applySettings();
        }

        function applySettings() {
            themeSelect.value = settings.theme;
            languageSelect.value = settings.language;
            downloadDirectoryInput.value = settings.downloadDirectory;
            formatSelect.value = settings.preferredFormat;
            qualitySelect.value = settings.defaultQuality;
            notificationsToggle.checked = settings.notificationsEnabled;
            emailNotificationsToggle.checked = settings.emailNotificationsEnabled;
            
            setTheme(settings.theme);
        }

        function setTheme(newTheme) {
            theme = newTheme;
            document.body.dataset.theme = newTheme === 'system' 
                ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') 
                : newTheme;
            localStorage.setItem('theme', newTheme);
        }

        // Notification Functions
        function addNotification(title, message, type = 'info') {
            const id = Date.now().toString();
            const notification = { id, title, message, type, timestamp: Date.now() };
            notifications.push(notification);
            
            renderNotifications();
            updateNotificationBadge();
            
            // Auto dismiss after 5 seconds
            setTimeout(() => {
                dismissNotification(id);
            }, 5000);
        }

        function dismissNotification(id) {
            notifications = notifications.filter(notification => notification.id !== id);
            renderNotifications();
            updateNotificationBadge();
        }

        function renderNotifications() {
            const container = document.getElementById('notifications-container');
            container.innerHTML = '';
            
            if (notifications.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-4 text-gray-500">
                        <p>No notifications</p>
                    </div>
                `;
                return;
            }
            
            notifications.forEach(notification => {
                const typeColors = {
                    'success': 'bg-green-50 text-green-800 border-green-200',
                    'error': 'bg-red-50 text-red-800 border-red-200',
                    'warning': 'bg-yellow-50 text-yellow-800 border-yellow-200',
                    'info': 'bg-blue-50 text-blue-800 border-blue-200'
                };
                
                const typeIcons = {
                    'success': 'fas fa-check-circle text-green-500',
                    'error': 'fas fa-exclamation-circle text-red-500',
                    'warning': 'fas fa-exclamation-triangle text-yellow-500',
                    'info': 'fas fa-info-circle text-blue-500'
                };
                
                const notificationElement = document.createElement('div');
                notificationElement.classList.add('p-3', 'rounded-lg', 'border', ...typeColors[notification.type].split(' '));
                
                notificationElement.innerHTML = `
                    <div class="flex items-start">
                        <div class="flex-shrink-0">
                            <i class="${typeIcons[notification.type]}"></i>
                        </div>
                        <div class="ml-3 flex-1">
                            <p class="font-medium">${notification.title}</p>
                            <p class="text-sm">${notification.message}</p>
                            <p class="text-xs mt-1 opacity-75">${timeAgo(notification.timestamp)}</p>
                        </div>
                        <button class="dismiss-notification text-gray-500 hover:text-gray-700" data-id="${notification.id}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                
                container.appendChild(notificationElement);
                
                notificationElement.querySelector('.dismiss-notification').addEventListener('click', (e) => {
                    const id = e.currentTarget.dataset.id;
                    dismissNotification(id);
                });
            });
        }

        function updateNotificationBadge() {
            notificationBadge.textContent = notifications.length;
            notificationBadge.style.display = notifications.length > 0 ? 'flex' : 'none';
        }

        // Helper Functions
        function showError(message) {
            if (message) {
                errorMessage.textContent = message;
                errorMessage.classList.remove('hidden');
            } else {
                errorMessage.classList.add('hidden');
            }
        }

        function showAuthError(message) {
            authErrorElement.textContent = message;
            authErrorElement.classList.remove('hidden');
        }

        function clearAuthForm() {
            authErrorElement.classList.add('hidden');
        }

        function getAuthErrorMessage(errorCode) {
            switch (errorCode) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    return 'Invalid email or password';
                case 'auth/email-already-in-use':
                    return 'Email already in use';
                case 'auth/weak-password':
                    return 'Password should be at least 6 characters';
                case 'auth/invalid-email':
                    return 'Invalid email address';
                default:
                    return 'Authentication failed. Please try again.';
            }
        }

        function timeAgo(timestamp) {
            const seconds = Math.floor((Date.now() - timestamp) / 1000);
            
            if (seconds < 60) return 'just now';
            
            const minutes = Math.floor(seconds / 60);
            if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
            
            const hours = Math.floor(minutes / 60);
            if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
            
            const days = Math.floor(hours / 24);
            return `${days} day${days !== 1 ? 's' : ''} ago`;
        }
    </script>
</body>
</html>
