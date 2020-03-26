const RGB2Hex = (color)=>{
  let values = color
    .replace(/rgba?\(/, '')
    .replace(/\)/, '')
    .replace(/[\s+]/g, '')
    .split(',');
  let a = parseFloat(values[3] || 1),
      r = Math.floor(a * parseInt(values[0]) + (1 - a) * 255),
      g = Math.floor(a * parseInt(values[1]) + (1 - a) * 255),
      b = Math.floor(a * parseInt(values[2]) + (1 - a) * 255);
  return "#" +
    ("0" + r.toString(16)).slice(-2) +
    ("0" + g.toString(16)).slice(-2) +
    ("0" + b.toString(16)).slice(-2);
}

export default RGB2Hex
