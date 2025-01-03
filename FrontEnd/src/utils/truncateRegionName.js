export default function truncateRegionName(regionName) {
    if (!regionName) return '';
    return regionName.replace(/область/g, 'обл.');
  }