import { Suspense } from "react";
import { SearchResults } from "./search-results";
import { SearchResultsSkeleton } from "./search-results-skeleton";

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<SearchResultsSkeleton />}>
      <SearchResults />
    </Suspense>
  );
} 