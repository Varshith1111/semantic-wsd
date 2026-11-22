interface Props {
  matrix: Record<string, Record<string, number>>;
}

export default function ConfusionMatrix({ matrix }: Props) {
  const labels = Object.keys(matrix);
  if (labels.length === 0) {
    return <p className="text-slate-400 text-sm">No confusion matrix data available.</p>;
  }

  // Find max value for color scaling
  let maxVal = 0;
  labels.forEach((row) =>
    labels.forEach((col) => {
      const v = matrix[row]?.[col] ?? 0;
      if (v > maxVal) maxVal = v;
    })
  );

  const getCellColor = (val: number) => {
    if (maxVal === 0) return 'rgba(59,130,246,0.05)';
    const ratio = val / maxVal;
    return `rgba(59,130,246,${(ratio * 0.7 + 0.05).toFixed(2)})`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="border-collapse text-xs sm:text-sm">
        <thead>
          <tr>
            <th className="p-2 text-slate-400 font-medium text-left">Actual \ Predicted</th>
            {labels.map((l) => (
              <th
                key={l}
                className="p-2 text-slate-300 font-medium text-center max-w-[100px] truncate"
                title={l}
              >
                {l.length > 12 ? l.slice(0, 12) + '…' : l}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {labels.map((row) => (
            <tr key={row}>
              <td
                className="p-2 text-slate-300 font-medium max-w-[100px] truncate"
                title={row}
              >
                {row.length > 12 ? row.slice(0, 12) + '…' : row}
              </td>
              {labels.map((col) => {
                const val = matrix[row]?.[col] ?? 0;
                const isDiag = row === col;
                return (
                  <td
                    key={col}
                    className={`p-2 text-center rounded-sm font-mono ${
                      isDiag ? 'ring-1 ring-blue-400/40' : ''
                    }`}
                    style={{ backgroundColor: getCellColor(val) }}
                  >
                    <span className={val > 0 ? 'text-white' : 'text-slate-500'}>
                      {val}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
