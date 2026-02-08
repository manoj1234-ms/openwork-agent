<div align="center">

<h1>🚀 OpenWork Agent</h1>

<p>
  <img src="https://img.shields.io/npm/v/openwork-agent" />
  <img src="https://img.shields.io/npm/dw/openwork-agent" />
  <img src="https://img.shields.io/npm/l/openwork-agent" />
</p>

<p>
  <strong>AI-powered backend code generator for any technology stack</strong>
</p>

<p>
  Generate <strong>production-ready backend projects in seconds</strong><br/>
  with Docker, CI/CD, authentication, security, and best practices.
</p>

<pre><code>npx openwork-agent create my-api</code></pre>

<p>
  <a href="#installation">Installation</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#supported-technologies">Technologies</a> •
  <a href="#contributing">Contributing</a>
</p>

</div>

<hr/>

<h2>❓ What Problem Does OpenWork Agent Solve?</h2>

<p>Backend setup usually means:</p>

<ul>
  <li>Copy-pasting boilerplate from random GitHub repositories</li>
  <li>Manually configuring Docker, databases, and CI/CD</li>
  <li>Forgetting security, testing, or best practices</li>
</ul>

<p>
  <strong>OpenWork Agent solves this in one command.</strong><br/>
  You get a clean, scalable, and secure backend instantly — ready for development or production.
</p>

<hr/>

<h2>✨ Key Features</h2>

<ul>
  <li>🌍 Multi-language & multi-framework support</li>
  <li>🎯 Production-ready project structure</li>
  <li>🗄️ Database integration out of the box</li>
  <li>🐳 Docker & docker-compose included</li>
  <li>🚀 CI/CD with GitHub Actions</li>
  <li>🔐 Authentication, validation & security defaults</li>
  <li>💬 Interactive & CLI-based usage</li>
  <li>📋 Customizable template system</li>
</ul>

<hr/>

<h2 id="installation">📦 Installation</h2>

<h3>Quick Run (Recommended)</h3>
<pre><code>npx openwork-agent create my-api</code></pre>

<h3>Global Install</h3>
<pre><code>npm install -g openwork-agent</code></pre>

<h3>Yarn / pnpm</h3>
<pre><code>yarn global add openwork-agent
pnpm add -g openwork-agent</code></pre>

<hr/>

<h2 id="quick-start">🚀 Quick Start</h2>

<h3>Interactive Mode</h3>
<pre><code>openwork-agent create my-awesome-api</code></pre>

<h3>Specific Tech Stack</h3>
<pre><code>openwork-agent create my-fastapi-app \
  --tech python \
  --framework fastapi \
  --database postgresql
</code></pre>

<h3>Docker + Tests</h3>
<pre><code>openwork-agent create enterprise-api \
  --tech node \
  --framework express \
  --database mongodb \
  --docker \
  --tests
</code></pre>

<hr/>

<h2 id="supported-technologies">🧰 Supported Technologies</h2>

<h3>JavaScript / Node.js</h3>
<ul>
  <li>Express, NestJS, Fastify</li>
  <li>MongoDB, PostgreSQL, MySQL</li>
</ul>

<h3>Python</h3>
<ul>
  <li>FastAPI, Django, Flask</li>
  <li>PostgreSQL, MongoDB</li>
</ul>

<h3>Java</h3>
<ul>
  <li>Spring Boot, Quarkus</li>
  <li>MySQL, PostgreSQL</li>
</ul>

<h3>Go</h3>
<ul>
  <li>Gin, Echo</li>
</ul>

<h3>Rust</h3>
<ul>
  <li>Actix-web, Axum</li>
</ul>

<h3>PHP</h3>
<ul>
  <li>Laravel, Symfony</li>
</ul>

<hr/>

<h2>🆚 Why Choose OpenWork Agent?</h2>

<table>
  <thead>
    <tr>
      <th>Feature</th>
      <th>OpenWork Agent</th>
      <th>Yeoman</th>
      <th>Manual Setup</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Multi-language</td>
      <td>✅</td>
      <td>❌</td>
      <td>❌</td>
    </tr>
    <tr>
      <td>Docker ready</td>
      <td>✅</td>
      <td>❌</td>
      <td>❌</td>
    </tr>
    <tr>
      <td>CI/CD included</td>
      <td>✅</td>
      <td>❌</td>
      <td>❌</td>
    </tr>
    <tr>
      <td>Security defaults</td>
      <td>✅</td>
      <td>❌</td>
      <td>❌</td>
    </tr>
    <tr>
      <td>AI-assisted</td>
      <td>✅</td>
      <td>❌</td>
      <td>❌</td>
    </tr>
  </tbody>
</table>

<hr/>

<h2 id="contributing">🤝 Contributing</h2>

<pre><code>git clone https://github.com/openwork-agent/openwork-agent.git
cd openwork-agent
npm install
npm test
npm link
</code></pre>

<hr/>

<div align="center">

<p><strong>⭐ Star this repo if it helped you!</strong></p>

<p>
Built with ❤️ by <strong>Manoj Sharma</strong>
</p>

</div>
