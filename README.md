# SVD Image Restoration & Compression

This is a full-stack web application designed to demonstrate Singular Value Decomposition (SVD) for image compression and restoration. It features a modern, highly interactive frontend built with React, and a powerful computational engine utilizing Web Workers to crunch matrix mathematics asynchronously without blocking the UI.

The project visualizes how varying the number of singular values ($k$) affects image quality, allowing users to scrub through different compression levels and compare them against the original image in real-time.

## Project Structure

- `src/components/`: Contains the React UI components, divided into sections like the Hero/Demo and the interactive Playground.
- `src/engine/`: Contains the core SVD mathematics, Web Worker logic, and matrix conversion utilities.
- `scripts/`: Contains Node.js utilities (like `precalc.ts`) for generating high-quality static assets during development.
- `public/`: Contains static assets and the pre-calculated hero image SVD stops.

---

## Running the Application

This project is built with Vite and requires Node.js to run locally.

**Prerequisites:**

- Node.js 20+ and npm

**Instructions:**

1.  Clone the repository.
2.  Open your terminal in the project's root directory.
3.  Install the dependencies:

    ```sh
    npm install
    ```

4.  Start the development server:

    ```sh
    npm run dev
    ```

5.  That's it! The application will be available at **[http://localhost:5173](http://localhost:5173)** (or the port specified by Vite in your terminal).

_(Optional)_ If you want to regenerate the static default images for the landing page, you can run the precalculation script:

```sh
npx tsx scripts/precalc.ts
```

---

## Technology Stack

- **Core**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Motion (Framer Motion)
- **Math Engine**: `svd.ts`, Web Workers, OffscreenCanvas
- **Pre-calculation**: Node.js, `sharp`

---

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
