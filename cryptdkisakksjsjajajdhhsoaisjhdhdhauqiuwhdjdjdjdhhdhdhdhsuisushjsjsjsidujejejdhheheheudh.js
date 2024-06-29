import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
        import { getDatabase, ref, set, push, onChildAdded, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
        import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
    
        // Firebase configuration
        const firebaseConfig = {
        apiKey: "AIzaSyDcTf6anqbIPdNaFXjEaqqSxNhdYki4ZFM",
        authDomain: "appchat-9bfeb.firebaseapp.com",
        databaseURL: "https://appchat-9bfeb-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "appchat-9bfeb",
        storageBucket: "appchat-9bfeb.appspot.com",
        messagingSenderId: "1012809974964",
        appId: "1:1012809974964:web:ff967f83e2095e887883e1",
        measurementId: "G-NYW7VX043F"
    };

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const analytics = getAnalytics(app);
        const database = getDatabase(app);
    
        // Function to send message
        window.sendMessage = function() {
            const messageInput = document.getElementById("messageInput");
            const messageText = messageInput.value.trim();
            const username = localStorage.getItem('username') || 'Guest';
    
            if (messageText !== "") {
                if (/^[a-zA-Z0-9-_,.!?() ]+$/.test(messageText)) {
                    const messagesRef = ref(database, 'messages');
                    const newMessageRef = push(messagesRef);
                    set(newMessageRef, {
                        username: username,
                        text: messageText,
                        timestamp: new Date().toISOString()
                    }).catch(error => {
                        console.error("Error sending message:", error);
                        alert("Failed to send message. Please try again later.");
                    });
    
                    messageInput.value = "";
                } else {
                    alert("Invalid characters in the message. Please try again.");
                }
            } else {
                alert("Please enter a message.");
            }
        }
    
        // Function to display message
        function displayMessage(username, text, timestamp) {
            const chatBody = document.getElementById("chatBody");
            const messageDiv = document.createElement("div");
            messageDiv.classList.add("messenger");
            const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const userClass = username === localStorage.getItem('username') ? 'user-messenger' : '';
            messageDiv.innerHTML = `<div class="${userClass}"><span class="user">${username}</span><span class="time">${time}</span><div class="text">${text}</div></div>`;
            chatBody.appendChild(messageDiv);
            chatBody.scrollTop = chatBody.scrollHeight;
        }
    
        // Listening for new messages
        const messagesRef = ref(database, 'messages');
        onChildAdded(messagesRef, (snapshot) => {
            const message = snapshot.val();
            displayMessage(message.username, message.text, message.timestamp);
            // Send notification to Service Worker
            if ('serviceWorker' in navigator && 'PushManager' in window) {
                navigator.serviceWorker.ready.then(function(registration) {
                    registration.active.postMessage({
                        title: "New Message",
                        body: `${message.username}: ${message.text}`
                    });
                });
            }
        });
    
        // Redirect to login if username not found
        window.onload = function() {
            const username = localStorage.getItem('username');
            if (!username) {
                redirectToLogin();
            } else if (username === 'admin') {
                const resetBtn = document.querySelector('.reset-btn');
                resetBtn.style.display = 'block';
            }
        }
    
        function redirectToLogin() {
            window.location.href = "index.html";
        }
    
        // Function to reset chat (only for admin)
        window.resetChat = function() {
            const username = localStorage.getItem('username');
            if (username === 'admin') {
                const confirmReset = confirm("Are you sure you want to reset the chat? This action cannot be undone.");
                if (confirmReset) {
                    const messagesRef = ref(database, 'messages');
                    remove(messagesRef).then(() => {
                        alert("Chat reset successful!");
                    }).catch((error) => {
                        console.error("Error resetting chat:", error);
                        alert("Failed to reset chat. Please try again later.");
                    });
                }
            } else {
                alert("You don't have permission to reset the chat!");
            }
        }
    
        // Function to toggle sidebar
        window.toggleSidebar = function() {
            const sidebar = document.getElementById('sidebar');
            if (sidebar.style.right === '0px') {
                sidebar.style.right = '-200px';
            } else {
                sidebar.style.right = '0px';
            }
        }
    
        window.closeSidebar = function() {
            document.getElementById('sidebar').style.right = '-200px';
        }
    </script>

    <script>
        // Register Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('service-worker.js')
                .then(function(registration) {
                    console.log('Service Worker registered with scope:', registration.scope);
                })
                .catch(function(error) {
                    console.error('Service Worker registration failed:', error);
                });
        }
// Function to send message when Enter key is pressed
document.getElementById("messageInput").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault(); // Prevent default behavior (e.g. adding newline)
        sendMessage(); // Call sendMessage function
    }
});