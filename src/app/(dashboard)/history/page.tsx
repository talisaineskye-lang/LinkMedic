import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Image from "next/image";
import { History, Undo2 } from "lucide-react";

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  // No channel filter for now - will be re-added with multi-channel support
  const channelFilter = {};

  // Get all fixed links with video data (filtered by active channel)
  const fixedLinks = await prisma.affiliateLink.findMany({
    where: {
      video: { userId: session.user.id, ...channelFilter },
      isFixed: true,
    },
    select: {
      id: true,
      originalUrl: true,
      suggestedLink: true,
      suggestedTitle: true,
      dateFixed: true,
      video: {
        select: {
          id: true,
          title: true,
          thumbnailUrl: true,
        },
      },
    },
    orderBy: {
      dateFixed: "desc",
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <History className="w-6 h-6" />
          History
        </h1>
        <p className="text-slate-400 mt-1">Track all link changes</p>
      </div>

      {/* Table */}
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg backdrop-blur overflow-hidden">
        {fixedLinks.length === 0 ? (
          <div className="p-12 text-center">
            <History className="w-16 h-16 mx-auto text-slate-600 mb-4" />
            <p className="text-xl font-semibold text-white mb-2">No History Yet</p>
            <p className="text-slate-400 max-w-md mx-auto">
              When you fix broken links in the Fix Center, they&apos;ll appear here so you can track all your changes.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50 border-b border-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Video
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Original Link
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Replaced With
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Fixed On
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {fixedLinks.map((link) => (
                  <tr key={link.id} className="hover:bg-slate-700/20 transition">
                    {/* Video */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {link.video.thumbnailUrl ? (
                          <Image
                            src={link.video.thumbnailUrl}
                            alt={link.video.title}
                            width={64}
                            height={36}
                            className="rounded object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-9 bg-slate-700 rounded flex-shrink-0" />
                        )}
                        <p className="text-sm text-white font-medium truncate max-w-[200px]" title={link.video.title}>
                          {link.video.title.length > 45
                            ? link.video.title.slice(0, 45) + "..."
                            : link.video.title}
                        </p>
                      </div>
                    </td>

                    {/* Original Link */}
                    <td className="px-6 py-4">
                      <a
                        href={link.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-red-400/70 hover:text-red-400 hover:underline truncate block max-w-[180px] line-through"
                        title={link.originalUrl}
                      >
                        {link.originalUrl.length > 40 ? link.originalUrl.slice(0, 40) + "..." : link.originalUrl}
                      </a>
                    </td>

                    {/* Replaced With */}
                    <td className="px-6 py-4">
                      {link.suggestedLink ? (
                        <div>
                          <a
                            href={link.suggestedLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-emerald-400 hover:underline truncate block max-w-[180px]"
                            title={link.suggestedTitle || link.suggestedLink}
                          >
                            {link.suggestedTitle
                              ? link.suggestedTitle.length > 40
                                ? link.suggestedTitle.slice(0, 40) + "..."
                                : link.suggestedTitle
                              : link.suggestedLink.slice(0, 40) + "..."}
                          </a>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-500 italic">Manual fix</span>
                      )}
                    </td>

                    {/* Fixed On */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-300">
                        {link.dateFixed
                          ? new Date(link.dateFixed).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "-"}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 text-center">
                      <form action={`/api/links/undo-fix`} method="POST">
                        <input type="hidden" name="linkId" value={link.id} />
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white transition"
                        >
                          <Undo2 className="w-3 h-3" />
                          Undo
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      {fixedLinks.length > 0 && (
        <p className="text-sm text-slate-500 text-center">
          {fixedLinks.length} link{fixedLinks.length !== 1 ? "s" : ""} fixed
        </p>
      )}
    </div>
  );
}
