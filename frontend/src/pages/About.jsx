
export default function About() {
  return (
    <div className="min-h-screen font-['Inter'] bg-gray-900 text-gray-300 px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-extrabold text-white mb-8">About This Project</h1>
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-indigo-400 mb-4">Project Overview</h2>
          <p>
            This project is a comprehensive coding practice and interview preparation platform named <strong>CodeXero</strong>. It offers tailored Data Structures and Algorithms (DSA) practice, real-time contests, mock interviews powered by AI, and performance analytics to help users master coding skills and land their dream jobs.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-indigo-400 mb-4">Frontend Structure</h2>
          <p>
            The frontend is built using React and Tailwind CSS for styling. It provides a responsive and interactive user interface with multiple pages and components.
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>src/pages/</strong>: Contains the main page components such as Welcome, About, Practice pages, Profile, and more. Each page corresponds to a route in the application.</li>
            <li><strong>src/components/</strong>: Reusable UI components like Navbar, Footer, Admin panels, Chat AI, and others that are used across different pages.</li>
            <li><strong>src/assets/</strong>: Static assets like images and icons used in the UI.</li>
            <li><strong>src/store/</strong>: Redux store setup and slices for state management.</li>
            <li><strong>src/utils/</strong>: Utility functions and API clients for frontend operations.</li>
            <li><strong>src/index.css</strong> and <strong>src/App.jsx</strong>: Main CSS and root React component setup.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-indigo-400 mb-4">Backend Structure</h2>
          <p>
            The backend is built with Node.js and Express, providing RESTful API endpoints and business logic for the platform.
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>src/controllers/</strong>: Contains controller files handling different API routes such as practice behavioral, mock HR interviews, DSA practice, user authentication, contest leaderboard, and more.</li>
            <li><strong>src/models/</strong>: Mongoose models defining the database schemas for users, problems, submissions, contest scores, solution videos, and more.</li>
            <li><strong>src/routes/</strong>: Express route definitions linking endpoints to controllers.</li>
            <li><strong>src/middleware/</strong>: Middleware for authentication, authorization, and other request processing.</li>
            <li><strong>src/config/</strong>: Configuration files for database connection, passport authentication, Redis caching, and other environment setups.</li>
            <li><strong>src/utils/</strong>: Utility functions for validation, problem utilities, and other backend helpers.</li>
            <li><strong>src/index.js</strong>: Entry point of the backend server initializing Express app and middleware.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-indigo-400 mb-4">Key Features</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Interactive coding practice with curated problems by data structure and algorithm categories.</li>
            <li>AI-powered mock interviews simulating real interview scenarios.</li>
            <li>Real-time contests with leaderboards and rewards.</li>
            <li>Performance analytics to track progress and identify weaknesses.</li>
            <li>Community sections for students, professionals, and companies to connect and collaborate.</li>
            <li>Responsive and modern UI with animations and interactive elements.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-indigo-400 mb-4">Conclusion</h2>
          <p>
            This project combines modern frontend and backend technologies to deliver a powerful platform for coding interview preparation. The modular structure and clear separation of concerns make it maintainable and extensible for future enhancements.
          </p>
        </section>
      </div>
    </div>
  );
}
