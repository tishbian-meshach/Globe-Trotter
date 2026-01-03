'use client';

interface BarChartProps {
    data: { label: string; value: number }[];
    height?: number;
    color?: string;
}

export function BarChart({ data, height = 300, color = '#0F4C81' }: BarChartProps) {
    const maxValue = Math.max(...data.map((d) => d.value));
    const barWidth = 40;
    const gap = 20;
    const width = data.length * (barWidth + gap);

    return (
        <div className="overflow-x-auto">
            <svg width={width} height={height + 60} className="min-w-full">
                {/* Bars */}
                {data.map((item, index) => {
                    const barHeight = (item.value / maxValue) * height;
                    const x = index * (barWidth + gap);
                    const y = height - barHeight;

                    return (
                        <g key={index}>
                            {/* Bar */}
                            <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                fill={color}
                                className="transition-opacity hover:opacity-80 cursor-pointer"
                                rx="4"
                            />

                            {/* Value label */}
                            <text
                                x={x + barWidth / 2}
                                y={y - 5}
                                textAnchor="middle"
                                className="text-xs font-medium fill-slate-900"
                            >
                                ${item.value.toFixed(0)}
                            </text>

                            {/* X-axis label */}
                            <text
                                x={x + barWidth / 2}
                                y={height + 20}
                                textAnchor="middle"
                                className="text-sm fill-slate-600"
                            >
                                {item.label}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}
