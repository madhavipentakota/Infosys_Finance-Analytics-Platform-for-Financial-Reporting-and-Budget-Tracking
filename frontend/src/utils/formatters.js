export const formatCurrency = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '₹ 0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  }).format(val);
};

export const formatNumber = (val, decimals = 2) => {
  if (val === null || val === undefined || isNaN(val)) return '0';
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0
  }).format(val);
};

export const formatPercentage = (val, decimals = 1) => {
  if (val === null || val === undefined || isNaN(val)) return '0.0%';
  return `${Number(val).toFixed(decimals)}%`;
};

export const formatArea = (val, unit = 'ha') => {
  if (val === null || val === undefined || isNaN(val)) return `0 ${unit}`;
  return `${formatNumber(val, 1)} ${unit}`;
};

export const formatWeight = (val, unit = 'tonnes') => {
  if (val === null || val === undefined || isNaN(val)) return `0 ${unit}`;
  return `${formatNumber(val, 2)} ${unit}`;
};
