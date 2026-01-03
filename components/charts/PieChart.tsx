'use client';

interface PieChartProps {
    data: { label: string; value: number; color: string }[];
    size?: number;
}

export function PieChart({ data, size = 200 }: PieChartProps) {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = -90; // Start from top

    const slices = data.map((item) => {
        const percentage = (item.value / total) * 100;
        const angle = (percentage / 100) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;

        currentAngle = endAngle;

        // Calculate path for pie slice
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;
        const radius = size / 2;
        const centerX = size / 2;
        const centerY = size / 2;

        const x1 = centerX + radius * Math.cos(startRad);
        const y1 = centerY + radius * Math.sin(startRad);
        const x2 = centerX + radius * Math.cos(endRad);
        const y2 = centerY + radius * Math.sin(endRad);

        const largeArc = angle > 180 ? 1 : 0;

        const path = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
            'Z',
        ].join(' ');

        return {
            ...item,
            path,
            percentage,
        };
    });

    return (
        <div className="flex items-center gap-8">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {slices.map((slice, index) => (
                    <g key={index}>
                        <path
                            d={slice.path}
                            fill={slice.color}
                            className="transition-opacity hover:opacity-80 cursor-pointer"
                        />
                    </g>
                ))}
            </svg>

            <div className="space-y-2">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                        <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: item.color }}
                        />
                        <div className="text-sm">
                            <div className="font-medium text-slate-900">{item.label}</div>
                            <div className="text-slate-600">
                                ${item.value.toFixed(2)} ({slices[index].percentage.toFixed(1)}%)
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
