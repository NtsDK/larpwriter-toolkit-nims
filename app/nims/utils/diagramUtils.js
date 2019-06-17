const makePieData = (counts, label2tooltip) => {
  const sum = R.sum(R.values(counts));
  const pieData = R.toPairs(counts).map(pair => ({ label: pair[0], value: pair[1] }));
  pieData.forEach((pieCell) => {
    pieCell.tooltipLabel = label2tooltip(pieCell.label);
    if (sum > 0) {
      pieCell.tooltipLabel += `: ${((pieCell.value / sum) * 100).toFixed(0)}% (${pieCell.value}/${sum})`;
    }
  });
  return pieData;
};

const makeBindingStatsPie = (counts, t) => {
  const pieData = R.toPairs(counts).map(pair => ({ label: pair[0], value: pair[1] }));
  pieData.forEach((pieCell) => {
    pieCell.tooltipLabel = `${t(`constant.${pieCell.label}`)}: ${pieCell.value}`;
  });
  return pieData;
};

function makeHistData(data) {
  const prepared = [];
  const { step, groups } = data;
  const min = R.apply(Math.min, R.keys(groups));
  const max = R.apply(Math.max, R.keys(groups));

  for (let i = min; i < max + 1; i++) {
    if (groups[i]) {
      prepared.push({
        value: groups[i],
        label: `${i * step}-${(i * step) + (step - 1)}`,
      });
    } else {
      prepared.push({
        value: 0,
        label: ''
      });
    }
  }
  return prepared;
}

export { makePieData, makeBindingStatsPie, makeHistData };
