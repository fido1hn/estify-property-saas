
import { useQuery } from "@tanstack/react-query";
import { getSummaryMetrics, getMonthlyRevenue, getOccupancyTrend, getRevenueDistribution, getFeaturedProperty } from "../services/apiAnalytics";

export function useFeaturedProperty() {
  const { isPending, data: property, error } = useQuery({
    queryKey: ["featuredProperty"],
    queryFn: getFeaturedProperty,
  });

  return { isPending, error, property };
}

export function useSummaryMetrics() {
  const { isPending, data: metrics, error } = useQuery({
    queryKey: ["summaryMetrics"],
    queryFn: getSummaryMetrics,
  });

  return { isPending, error, metrics };
}

export function useMonthlyRevenue() {
  const { isPending, data: revenueData, error } = useQuery({
    queryKey: ["monthlyRevenue"],
    queryFn: getMonthlyRevenue,
  });

  return { isPending, error, revenueData };
}

export function useOccupancyTrend() {
  const { isPending, data: occupancyData, error } = useQuery({
    queryKey: ["occupancyTrend"],
    queryFn: getOccupancyTrend,
  });

  return { isPending, error, occupancyData };
}

export function useRevenueDistribution() {
  const { isPending, data: distributionData, error } = useQuery({
    queryKey: ["revenueDistribution"],
    queryFn: getRevenueDistribution,
  });

  return { isPending, error, distributionData };
}
