import { useEffect, useMemo, useState } from "react";
import { Alert, Col, Input, Radio, Row, message } from "antd";
import ReactECharts, { EChartsOption } from "echarts-for-react";
import { Percentile, PortAnalysis } from "../../src/lib/models";

enum ChartType {
  Count = "count",
  DurationDistributions = "duration-distributions",
}
enum DataView {
  Top5 = "top-5",
  Bottom5 = "bottom-5",
  All = "all",
}

export default function Dashboard() {
  const [portAnalyses, setPortAnalyses] = useState<PortAnalysis[]>();
  const [chartType, setChartType] = useState<ChartType>(ChartType.Count);
  const [view, setView] = useState<DataView>(DataView.All);
  const [filter, setFilter] = useState("");

  const filteredPortAnalyses = useMemo(
    () => filterPortAnalyses(portAnalyses ?? [], view, filter),
    [portAnalyses, view, filter]
  );

  const chartOption = useMemo<EChartsOption>(() => {
    return {
      title: {
        text:
          chartType === ChartType.Count
            ? "Number of port calls"
            : "Port call duration distributions",
      },
      responsive: true,
      tooltip: { trigger: "axis" },
      xAxis: {
        name:
          chartType === ChartType.Count
            ? "Number of port calls"
            : "Duration (hours)",
        nameLocation: "middle",
        type: "value",
      },
      yAxis: {
        type: "category",
        data: filteredPortAnalyses.map((pi) => pi.port.name),
      },
      dataZoom: [
        {
          type: "inside",
          id: "insideY",
          yAxisIndex: 0,
          start: 0,
          end: 75,
          zoomOnMouseWheel: false,
          moveOnMouseMove: true,
          moveOnMouseWheel: true,
        },
        {
          type: "slider",
          yAxisIndex: 0,
          width: 20,
          start: 0,
          end: 75,
        },
      ],
      series: [
        chartType === ChartType.Count
          ? {
              name: "Number of port calls",
              type: "bar",
              data: filteredPortAnalyses.map((pi) => pi.portCalls.length),
            }
          : {
              name: "Distribution of port call durations (hours)",
              type: "boxplot",
              data: filteredPortAnalyses.map((pi) => {
                return [
                  formatMsToHours(pi.durationPercentiles[Percentile.P05]),
                  formatMsToHours(pi.durationPercentiles[Percentile.P20]),
                  formatMsToHours(pi.durationPercentiles[Percentile.P50]),
                  formatMsToHours(pi.durationPercentiles[Percentile.P75]),
                  formatMsToHours(pi.durationPercentiles[Percentile.P90]),
                ];
              }),
              itemStyle: { color: "#b8c5f2" },
            },
      ],
    };
  }, [filteredPortAnalyses, chartType]);

  useEffect(() => {
    fetch("/api/analysis")
      .then((res) => res.json())
      .then((data) => setPortAnalyses(data))
      .catch((err) => {
        message.error(`Failed to load analysis`);
        console.error(err);
      });
  }, []);

  return (
    <>
      <Row justify="space-between" style={{ padding: 10 }}>
        <Col flex="1 0 100px">
          <Radio.Group
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
          >
            <Radio.Button value="count">Show count</Radio.Button>
            <Radio.Button value="duration-distributions">
              Show durations
            </Radio.Button>
          </Radio.Group>
        </Col>
        <Col flex="1 0 100px">
          <Row justify="center">
            <Col>
              <Radio.Group
                value={view}
                onChange={(e) => setView(e.target.value)}
              >
                <Radio.Button value="top-5">Top 5 by count</Radio.Button>
                <Radio.Button value="bottom-5">Bottom 5 by count</Radio.Button>
                <Radio.Button value="all">All</Radio.Button>
              </Radio.Group>
            </Col>
          </Row>
          <Row justify="center" style={{ marginTop: 4 }}>
            <Col>
              <Input
                type="search"
                placeholder="Filter by port"
                value={filter}
                onChange={(e) => setFilter(e.target.value.toLocaleLowerCase())}
                allowClear
                addonBefore="🔍"
              />
            </Col>
          </Row>
        </Col>
        <Col flex="1 0 100px">
          <Row justify="end">
            <Alert
              type="warning"
              message={
                <>
                  <div>
                    Chart may contain more entries that fits the screen.
                  </div>
                  <div>Vertical scrolling is enabled.</div>
                </>
              }
            />
          </Row>
        </Col>
      </Row>

      <ReactECharts option={chartOption} style={{ height: "100%" }} />
    </>
  );
}

const formatMsToHours = (ms: number) => {
  return (ms / 1000 / 60 / 60).toFixed(2);
};

function filterPortAnalyses(
  analyses: PortAnalysis[],
  view: DataView,
  filter: string
) {
  let output = analyses;
  switch (view) {
    case "top-5":
      output = analyses?.slice(0, 5);
      break;
    case "bottom-5":
      output = analyses?.slice(-5);
      break;
  }

  return output.filter(
    (pi) =>
      pi.port.id.toLocaleLowerCase() === filter ||
      pi.port.name.toLocaleLowerCase().includes(filter)
  );
}
