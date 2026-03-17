export default function Home() {
  const endpoints = [
    {
      resource: "Users",
      routes: [
        { method: "GET", path: "/api/users", description: "List all users" },
        { method: "GET", path: "/api/users/[id]", description: "Get user by ID" },
        { method: "POST", path: "/api/users", description: "Create a user" },
        { method: "PUT", path: "/api/users/[id]", description: "Update a user" },
        { method: "DELETE", path: "/api/users/[id]", description: "Delete a user" },
      ],
    },
    {
      resource: "Articles",
      routes: [
        { method: "GET", path: "/api/articles", description: "List all articles" },
        { method: "GET", path: "/api/articles/[id]", description: "Get article by ID" },
        { method: "POST", path: "/api/articles", description: "Create an article" },
        { method: "PUT", path: "/api/articles/[id]", description: "Update an article" },
        { method: "DELETE", path: "/api/articles/[id]", description: "Delete an article" },
      ],
    },
    {
      resource: "Comments",
      routes: [
        { method: "GET", path: "/api/comments", description: "List all comments" },
        { method: "GET", path: "/api/comments/[id]", description: "Get comment by ID" },
        { method: "POST", path: "/api/comments", description: "Create a comment" },
        { method: "PUT", path: "/api/comments/[id]", description: "Update a comment" },
        { method: "DELETE", path: "/api/comments/[id]", description: "Delete a comment" },
      ],
    },
  ];

  const methodColours: Record<string, string> = {
    GET: "bg-blue-100 text-blue-800",
    POST: "bg-green-100 text-green-800",
    PUT: "bg-yellow-100 text-yellow-800",
    DELETE: "bg-red-100 text-red-800",
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-[#003399] text-white shadow-md">
        <div className="mx-auto max-w-5xl px-6 py-6 flex items-center gap-4">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight leading-tight">
              Sheffield Wednesday News
            </h1>
            <p className="text-blue-200 text-sm mt-1">
              Your home for the latest Owls updates
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10 space-y-10">
        {/* Status banner */}
        <section className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Project Status
          </h2>
          <p className="text-gray-600 mb-4">
            Here&apos;s how we&apos;re looking. The REST API is fully implemented with
            complete CRUD support for all three resources.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { label: "Users API", status: "✅ Complete" },
              { label: "Articles API", status: "✅ Complete" },
              { label: "Comments API", status: "✅ Complete" },
            ].map(({ label, status }) => (
              <div
                key={label}
                className="rounded-lg bg-green-50 border border-green-200 px-4 py-3"
              >
                <p className="font-medium text-green-800">{label}</p>
                <p className="text-green-600 text-sm">{status}</p>
              </div>
            ))}
          </div>
        </section>

        {/* API Endpoints */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Available API Endpoints
          </h2>
          <div className="space-y-6">
            {endpoints.map(({ resource, routes }) => (
              <div
                key={resource}
                className="rounded-xl bg-white border border-gray-200 shadow-sm overflow-hidden"
              >
                <div className="bg-[#003399] px-5 py-3">
                  <h3 className="text-white font-semibold">{resource}</h3>
                </div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 uppercase text-xs tracking-wider">
                    <tr>
                      <th className="px-5 py-3 text-left w-20">Method</th>
                      <th className="px-5 py-3 text-left">Path</th>
                      <th className="px-5 py-3 text-left">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {routes.map(({ method, path, description }) => (
                      <tr key={`${method}-${path}`} className="hover:bg-gray-50">
                        <td className="px-5 py-3">
                          <span
                            className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${methodColours[method]}`}
                          >
                            {method}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-mono text-gray-700">
                          {path}
                        </td>
                        <td className="px-5 py-3 text-gray-600">
                          {description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </section>

        {/* Tech stack */}
        <section className="rounded-xl bg-white border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Tech Stack
          </h2>
          <ul className="grid grid-cols-2 gap-2 text-sm text-gray-700 sm:grid-cols-4">
            {["Next.js 16", "React 19", "Prisma ORM", "PostgreSQL", "TypeScript", "Tailwind CSS"].map(
              (tech) => (
                <li
                  key={tech}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-center font-medium"
                >
                  {tech}
                </li>
              )
            )}
          </ul>
        </section>
      </main>

      <footer className="mt-10 bg-[#003399] text-blue-200 text-center text-sm py-4">
        Sheffield Wednesday News &mdash; Up the Owls! 🦉
      </footer>
    </div>
  );
}
