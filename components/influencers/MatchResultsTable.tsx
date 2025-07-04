const MatchResultsTable = ({
  matchedCreators,
  handleDownload,
}: {
  matchedCreators: any[];
  handleDownload: () => void;
}) => (
  <div className="mt-10">
    <div className="flex justify-between items-center mb-3">
      <h2 className="text-xl font-semibold text-white">
        {matchedCreators.length} Matched Creators
      </h2>
      <button
        onClick={handleDownload}
        className="inline-flex items-center bg-white text-black px-4 py-2 rounded border border-gray-300 hover:bg-gray-100 transition-all"
      >
        Download CSV
      </button>
    </div>

    <div className="overflow-x-auto border border-gray-300 rounded-lg shadow-sm mt-4">
      <table className="min-w-full text-sm text-black bg-white">
        <thead className="bg-black text-white">
          <tr>
            <th className="px-4 py-2 border-b border-gray-300">#</th>
            <th className="px-4 py-2 border-b border-gray-300">Name</th>
            <th className="px-4 py-2 border-b border-gray-300">
              Instagram Link
            </th>
            <th className="px-4 py-2 border-b border-gray-300">Username</th>
            <th className="px-4 py-2 border-b border-gray-300">Email</th>
            <th className="px-4 py-2 border-b border-gray-300">Contact No</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {matchedCreators.map((c, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="px-4 py-2">{i + 1}</td>
              <td className="px-4 py-2">{c.creator_name}</td>
              <td className="px-4 py-2">
                <a
                  href={c.instagram_link}
                  target="_blank"
                  className="text-black underline hover:text-gray-600"
                >
                  {c.instagram_link}
                </a>
              </td>
              <td className="px-4 py-2">{c.instagram_username}</td>
              <td className="px-4 py-2">{c.mail_id}</td>
              <td className="px-4 py-2">{c.contact_no}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default MatchResultsTable;
