# Brackets

Brackets is a public website with two modes: **Creator** and **Learner**. It allows creators to manage question banks and learners to explore published content.

## Setup Instructions

Follow these steps to set up the project on your local machine:

### 1. Install Dependencies

Run the following command to install required packages:

```sh
npm install dotenv
```

### 2. Install and Configure NVM

If you haven't installed **NVM (Node Version Manager)**, install it using:

```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

Load NVM into your terminal session:

```sh
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

### 3. Install and Use Node.js 20

```sh
nvm install 20
nvm use 20
```

To make Node.js 20 the default version:

```sh
nvm alias default 20
```

Verify the installation:

```sh
node -v
```

### 4. Run Drizzle Migrations

Generate migration files:

```sh
npx drizzle-kit generate
```

Push migrations to the database:

```sh
npx drizzle-kit push
```

### 5. Start the Development Server

```sh
npm run dev
```

---
