# Safety Mentor Bot

This is a Next.js application that uses AI to provide personalized workplace safety training. It generates a tailored quiz based on a user's role and provides a compliance report and course recommendations based on their results.

## Running Locally

To run this project on your local machine, you'll need to set up your environment and run two separate development servers.

### 1. Set Up Environment Variables

The project uses the Google Gemini API for its AI capabilities. You'll need to get an API key and make it available to the application.

1.  Create a file named `.env.local` in the root of the project.
2.  Add your API key to this file:

    ```bash
    # Get your key from https://aistudio.google.com/app/apikey
    GEMINI_API_KEY="YOUR_API_KEY_HERE"
    ```

### 2. Install Dependencies

Install all the necessary npm packages by running the following command in your terminal:

```bash
npm install
```

### 3. Run the Development Servers

This project requires two servers running simultaneously:

*   **Next.js Frontend Server**: This serves the web application itself.
*   **Genkit AI Server**: This runs the AI flows that power the quiz generation and evaluation.

Open two separate terminal windows or tabs and run the following commands:

**In the first terminal (for the Next.js app):**

```bash
npm run dev
```

This will start the Next.js application, which will be accessible at [http://localhost:9002](http://localhost:9002).

**In the second terminal (for the Genkit AI flows):**

```bash
npm run genkit:dev
```

This starts the Genkit development server, which your Next.js application will call for AI functionality.

Once both servers are running, you can open your browser to [http://localhost:9002](http://localhost:9002) to use the application.
