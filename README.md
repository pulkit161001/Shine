<h1>Shine</h1>
<p>
A collaborative whiteboard application built on top of the MERN stack. You can draw designs and save them for later use. More than one user can use a single whiteboard which supports real-time communication. It has all the features required in a whiteboard like a pen, color picker, resizer, eraser, and functionality to load, save, update, clear, and delete the whiteboard. Inspired by <a href="https://webwhiteboard.com">webwhiteboard</a>
</br>
<pre>
Frontend: React.js, tailwind
Backend: Node.js, Express, MongoDB
other: axios, socket.io
</pre>
</p>

<h1>Demo Video</h1>


https://github.com/user-attachments/assets/1b7b40d6-934e-4817-85e2-d62474b5c9d7



<h1>Project Structure:</h1>

<h3>Frontend</h3>
<pre>
└─┬ /src
  ├─┬ /components
  │ └── Whiteboard.jsx
  ├─┬ /pages
  │ ├── Home.jsx
  │ └── Meeting.jsx
  ├─┬ /utils
  │ └── api.js
  ├─── App.jsx
  └─── main.jsx
</pre>

<h3>Backend</h3>
<pre>
├── server.js
├─┬ /models
│ └── Whiteboard.js
└─┬ /routes
  └── whiteboardRoutes.js
  
</pre>

<h1>Walkthrough of the code</h1>
<ul>
  <li><code>Whiteboard.jsx</code> for canvas drawing</li>
  <li><code>Home.jsx</code> for new whiteboard creation</li>
  <li><code>Meeting.jsx</code> for personalized saved whiteboard. Collaborative sync whiteboard achieved through socket.io</li>
  <li><code>Api.js</code> for connecting frontend to backend.</li>
  </br>
  <li><code>Server.js</code> MongoDB, socket.io connection.</li>
  <li><code>Whiteboard.js</code> Database schema.</li>
  <li><code>whiteboardRoutes.js</code> backend endpoint for CRUD operations</li>
</ul>

<h1>Setup instructions:</h1>

<ol>
<li><h3>Prerequisites</h3></li>
Make sure you have git and Node.js installed. You can check this by running

<pre>git --version
node -v</pre>


<li><h3>Clone the repository</h3></li>
Open terminal and select a folder where you want to clone the project
<pre>git clone https://github.com/PulkitMalhotra161001/Shine.git</pre>

<li><h3>Install dependencies</h3></li>
Navigate to project
<pre>cd Shine</pre>
<ul>
<li>Install frontend dependencies</li>
<pre>cd frontend
npm install</pre>
<li>Install backend dependencies</li>
<pre>cd backend
npm install</pre>
</ul>

<li><h3>Configure environment variables</h3></li>
In the backend folder you have to create a .env file. This file should contain the environment variables. e.g.
<pre>MONGO_DB_KEY = "mongodb+srv://pulkit161001:**************@cluster0.*******.mongodb.net"</pre>

<li><h3>Run the project</h3></li>
<ul>
<li>Start backend server</li>
<pre>cd backend
npm run dev</pre>
<li>Start frontend</li>
<pre>cd frontend
npm run dev</pre>
</ul>
</ol>
