"use client";

import { ApexOptions } from "apexcharts";
import Chart from "react-apexcharts";
import dayjs from "dayjs";
type ApiResponse = {
    labels: string[];
    callData: number[];
    chatData: number[];
    earningData: number[];
    userData: number[];
};

type Props = {
    data: ApiResponse;
};

const chartColors = {
    call: "#5750F1",
    chat: "#5475E5",
    earnings: "#ADBCF2",
    users: "#9DD9D2",
};

export default function ClientChart({ data }: Props) {
    const sharedOptions: ApexOptions = {
        chart: {
            type: "area",
            fontFamily: "inherit",
            zoom: { enabled: false },
            toolbar: { show: false },
        },
        stroke: { curve: "smooth", width: 3 },
        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 0.4,
                opacityFrom: 0.6,
                opacityTo: 0.1,
                stops: [0, 90, 100],
            },
        },
        xaxis: {
            categories: data.labels,
            labels: {
                formatter: (value: string, index: number) => {
                    return dayjs(value).format("MMM YYYY");
                },
                rotate: -45,
                style: {
                    fontSize: "12px",
                },
            },
            tickAmount: Math.ceil(data.labels.length / 2),
        },
        legend: { show: true },
        tooltip: { shared: true, intersect: false },
        dataLabels: { enabled: false },
    };

    const callChatOptions: ApexOptions = {
        ...sharedOptions,
        colors: [chartColors.call, chartColors.chat],
        yaxis: {
            title: { text: "Requests" },
            labels: {
                formatter: (val) => val.toFixed(0),
            },
        },
    };

    const earningOptions: ApexOptions = {
        ...sharedOptions,
        colors: [chartColors.earnings],
        yaxis: {
            title: { text: "Earnings (₹)" },
            labels: {
                formatter: (val) => `₹${val.toFixed(0)}`,
            },
        },
    };


    const usersOptions: ApexOptions = {
        ...sharedOptions,
        colors: [chartColors.users],
        yaxis: {
            title: { text: "Users" },
            labels: {
                formatter: (val) => `${val.toFixed(0)}`,
            },
        },
    };

    return (
        <>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-8">
                <div className="bg-white p-4 rounded-xl shadow">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Call & Chat Requests</h3>
                    <Chart
                        options={callChatOptions}
                        series={[
                            { name: "Call Requests", data: data.callData },
                            { name: "Chat Requests", data: data.chatData },
                        ]}
                        type="area"
                        height={300}
                    />
                </div>

                <div className="bg-white p-4 rounded-xl shadow">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Earnings</h3>
                    <Chart
                        options={earningOptions}
                        series={[{ name: "Earnings", data: data.earningData }]}
                        type="area"
                        height={300}
                    />
                </div>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-8">
                <div className="bg-white p-4 rounded-xl shadow">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Users {data.userData.reduce((a, b) => a + b, 0)}</h3>
                    <Chart
                        options={usersOptions}
                        series={[{ name: "Total Users", data: data.userData }]}
                        type="area"
                        height={300}
                    />
                </div>
            </div>

        </>

    );
}
