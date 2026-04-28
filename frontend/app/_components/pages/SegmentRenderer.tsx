import { Suspense } from "react";
import BlockRenderer from "@/app/_components/BlockRenderer";
import { SegmentData } from "@/app/types/salesforce-types";
import SegmentProductList from "../products/SegmentProductList";

interface SegmentRendererProps {
  segment: SegmentData;
  salesforceData?: any;
  filters?: any;
}

export function SegmentRenderer({
  segment,
  salesforceData,
  filters,
}: SegmentRendererProps) {
  const blocks = segment.blocks || [];

  return (
    <>
      {blocks.length === 0 ? (
       <>
          {salesforceData && (
            <Suspense fallback={null}>
              <SegmentProductList 
                products={salesforceData.products || []}
                pagination={salesforceData.pagination}
                filters={filters}
                segmentName={segment.name}
                segmentSlug={segment.slug}
              />
            </Suspense>
          )}
        </>
      ) : (
        <Suspense fallback={null}>
          <BlockRenderer 
            blocks={blocks} 
            salesforceData={salesforceData} 
            segmentName={segment.name}
            segmentSlug={segment.slug}
            filters={filters}
          />
        </Suspense>
      )}
    </>
  );
}