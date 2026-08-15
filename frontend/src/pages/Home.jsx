import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";


function Home() {
  const { user } = useAuth();

  return (
    <main>
      <section className="bg-slate-900 px-6 py-24 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 font-semibold text-blue-400">
            RESOURCE SCHEDULING
          </p>

          <h1 className="max-w-3xl text-4xl font-bold md:text-6xl">
            Book equipment and meeting rooms without scheduling conflicts.
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-slate-300">
            Find available laptops, hardware, and rooms, then reserve
            them for the dates you need.
          </p>

          {user ? (
            <Link
              to="/catalog"
              className="mt-8 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700"
            >
              Browse Resources
            </Link>
          ) : (
            <div className="mt-8 flex gap-4">
              <Link
                to="/login"
                className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-700"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="inline-block rounded-lg border-2 border-blue-600 px-6 py-3 font-semibold hover:bg-blue-600 hover:bg-opacity-10"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default Home;

