import { useState } from "react";

type Specification = {
  category: string;
  features: string[];
};

type ProductTabsProps = {
  description: string;
  specifications: Specification[];
  reviewsCount?: number;
};

export default function ProductTabs({
  description,
  specifications,
  reviewsCount = 0,
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<"description" | "specifications" | "reviews">("description");

  return (
    <div className="mb-12">
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("description")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "description"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab("specifications")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "specifications"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Specifications
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "reviews"
                ? "border-blue-600 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Reviews ({reviewsCount})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "description" && (
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{description}</p>
        </div>
      )}

      {activeTab === "specifications" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <tbody>
              {specifications.map((spec, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-gray-50 dark:bg-gray-900/50" : ""}>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100 w-1/4 align-top">
                    {spec.category}
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                    <ul className="space-y-2">
                      {spec.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <span className="text-blue-600 dark:text-blue-400 mr-2 mt-1">•</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "reviews" && (
        <div className="space-y-6">
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Reviews coming soon!</p>
          </div>
        </div>
      )}
    </div>
  );
}