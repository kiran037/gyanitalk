import { getDashboardChartData } from "../../fetch";
import ClientChart from "./clientChart";


export default async function MonthlyDashboardChart() {
  const data = await getDashboardChartData();

  return <ClientChart data={data} />;
}