import { DeltaMetricType } from "~/@generated/graphql/graphql";
import { useProjctMetricDelta } from "~/graphql/hooks/queries";
import { useCurrentProject } from "~/lib/hooks/useCurrentProject";
import { useTimeframeSelector } from "~/lib/providers/TimeframeSelectorContext";

export const useProjectOverviewMetrics = () => {
  const { project } = useCurrentProject();
  const { startDate, endDate } = useTimeframeSelector();

  const useMetric = (metric: DeltaMetricType) =>
    useProjctMetricDelta(
      {
        projectId: project?.id,
        metric,
        startDate,
        endDate,
      },
      {
        enabled: !!project && !!startDate && !!endDate,
      }
    );

  const requests = undefined // useMetric(DeltaMetricType.TotalRequests);
  const cost = undefined // useMetric(DeltaMetricType.TotalCost);
  const avgExecutionDuration = undefined // useMetric(DeltaMetricType.AverageRequestDuration  );
  const successRate = undefined // useMetric(DeltaMetricType.SuccessResponses);

  return {
    requests,
    cost,
    avgExecutionDuration,
    successRate,
  };
};
