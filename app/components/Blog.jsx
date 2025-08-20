"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, ChevronDown, ChevronUp, MessageCircle, Eye, Calendar } from "lucide-react"
import Image from "next/image"
import { useTranslations } from "next-intl"

const Blog = () => {
  const t = useTranslations("HomePage")
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showAll, setShowAll] = useState(false)

  const INITIAL_DISPLAY_COUNT = 3

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch("/api/blog")
        if (!response.ok) throw new Error("Failed to fetch blogs")
        const data = await response.json()
        setBlogs(data.blogs)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch blogs")
      } finally {
        setLoading(false)
      }
    }

    fetchBlogs()
  }, [])

  const formatCount = (count) => {
    if (count === 0) return "0"
    if (count === 1) return "1"
    if (count < 1000) return count.toString()
    if (count < 1000000) return (count / 1000).toFixed(1) + "K"
    return (count / 1000000).toFixed(1) + "M"
  }

  const getUniqueViewsCount = (views) => {
    if (!views || !Array.isArray(views)) return 0
    return new Set(views.map((view) => view.ip)).size
  }

  if (error) {
    return (
      <section className="relative py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block rounded-2xl bg-gradient-to-br from-red-50 to-red-100 border border-red-200 p-6 shadow-lg dark:from-red-900/20 dark:to-red-800/20 dark:border-red-800/30">
            <h3 className="mb-2 text-xl font-bold text-red-800 dark:text-red-200">Error Loading Blogs</h3>
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 md:text-4xl">{t("blogHeading")}</h2>
          <Link href={"/blogs"} className="group inline-flex">
            <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 font-medium text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105">
              <span>{t("viewAll")}</span>
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
            </div>
          </Link>
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="relative">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600 dark:border-purple-800 dark:border-t-purple-400"></div>
              <div className="absolute inset-0 h-12 w-12 animate-ping rounded-full border-4 border-purple-300 opacity-20"></div>
            </div>
          </div>
        )}

        {!loading && blogs.length > 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(showAll ? blogs : blogs.slice(0, INITIAL_DISPLAY_COUNT)).map((blog) => (
                <Link href={`/blog/${blog.slug}`} key={blog.slug}>
                  <article className="group relative h-full overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 hover:-translate-y-2 dark:bg-gray-800 border border-purple-100 dark:border-purple-800/30 flex flex-col">
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={blog.image || "/sydney.jpg"}
                        alt={blog.metaTitle || blog.h1 || "Blog post"}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="mb-4 flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 leading-tight group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                          {blog.h1 || blog.metaTitle}
                        </h3>
                        {blog.metaDescription && (
                          <p className="text-gray-700 dark:text-gray-300 line-clamp-3 leading-relaxed text-sm">
                            {blog.metaDescription}
                          </p>
                        )}
                      </div>

                      {/* Date */}
                      <div className="mb-4 flex items-center text-sm text-purple-700 dark:text-purple-400 font-medium">
                        <Calendar className="mr-2 h-4 w-4" />
                        <time dateTime={blog.createdAt}>
                          {new Date(blog.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </time>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between border-t border-purple-100 dark:border-purple-800/30 pt-4">
                        <div className="flex space-x-4 text-sm">
                          <div className="flex items-center bg-purple-50 dark:bg-purple-900/30 px-3 py-1 rounded-full">
                            <MessageCircle className="mr-1 h-4 w-4 text-purple-700 dark:text-purple-400" />
                            <span className="font-semibold text-purple-800 dark:text-purple-300">
                              {formatCount(blog.comments?.length || 0)}
                            </span>
                          </div>
                          <div className="flex items-center bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
                            <Eye className="mr-1 h-4 w-4 text-indigo-700 dark:text-indigo-400" />
                            <span className="font-semibold text-indigo-800 dark:text-indigo-300">
                              {formatCount(getUniqueViewsCount(blog.views))}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center text-sm font-bold text-purple-700 dark:text-purple-400 group-hover:text-purple-800 dark:group-hover:text-purple-300 transition-colors">
                          Read more
                          <ArrowUpRight className="ml-1 h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {blogs.length > INITIAL_DISPLAY_COUNT && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 font-medium text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
                >
                  <span>{showAll ? "Show Less" : `Show More (${blogs.length - INITIAL_DISPLAY_COUNT})`}</span>
                  {showAll ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>
            )}
          </div>
        )}

        {!loading && blogs.length === 0 && (
          <div className="py-8 text-center">
            <div className="mx-auto max-w-lg rounded-3xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 p-6 shadow-2xl dark:from-purple-900/20 dark:to-indigo-900/20 dark:border-purple-800/30">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-lg">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 01-2-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
              </div>
              <h3 className="mb-3 text-2xl font-bold text-purple-800 dark:text-purple-200">No Blogs Available</h3>
              <p className="text-purple-600 dark:text-purple-300 leading-relaxed">
                We're preparing fresh content. Check back soon for updates!
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default Blog
