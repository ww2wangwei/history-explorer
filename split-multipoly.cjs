// 把 MultiPolygon GeoJSON 拆成多个 Polygon feature
const fs = require('fs')
const path = require('path')

const dir = 'public/geo/world/eras'
const files = fs.readdirSync(dir).filter(f => f.endsWith('.geojson'))

let totalFixed = 0
for (const file of files) {
  const filePath = path.join(dir, file)
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))

  let modified = false
  const newFeatures = []
  for (const feature of data.features) {
    if (feature.geometry?.type === 'MultiPolygon') {
      modified = true
      const polys = feature.geometry.coordinates
      console.log(`${file}: ${feature.properties.name} - ${polys.length} polygons`)
      for (let i = 0; i < polys.length; i++) {
        newFeatures.push({
          type: 'Feature',
          properties: { ...feature.properties, subId: `${feature.properties.id}-${i}` },
          geometry: { type: 'Polygon', coordinates: polys[i] },
        })
      }
      totalFixed += polys.length - 1
    } else {
      newFeatures.push(feature)
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, JSON.stringify({ type: 'FeatureCollection', features: newFeatures }, null, 2))
    console.log(`  -> saved ${file}`)
  }
}

console.log(`\nFixed ${totalFixed} extra polygons`)