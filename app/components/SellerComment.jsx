import { MessageSquareTextIcon } from "lucide-react"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"

const SellerComment = ({ loadingState, car, translation: t }) => {
  const loading = loadingState
  const comments = car?.sellerComments || car?.sellercomments || ""

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 p-3 bg-purple-600 rounded-md">
        <MessageSquareTextIcon className="h-5 w-5 text-white" />
        <h3 className="text-sm font-semibold text-white">{t("sellerComments")}</h3>
      </div>

      {/* Content */}
      <div>
        {loading ? (
          <div className="space-y-2 p-3 border rounded-md">
            <Skeleton height={16} />
            <Skeleton height={16} />
            <Skeleton height={16} width="80%" />
          </div>
        ) : comments ? (
          <div className="p-3 border rounded-md">
            <p className="text-sm text-gray-700 dark:text-gray-100">{comments}</p>
          </div>
        ) : (
          <div className="p-6 text-center border rounded-md">
            <MessageSquareTextIcon className="w-6 h-6 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
            <p className="text-sm text-gray-700 dark:text-gray-300">No Comments Available</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SellerComment
