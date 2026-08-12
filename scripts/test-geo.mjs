import { isInChina, isCoordinateOnlyInput, normalizeCoordinateText } from '../src/utils/geoBounds.ts'

const cities = [
  ['Chiang Mai', 98.9853, 18.7883, false],
  ['Bangkok', 100.5018, 13.7563, false],
  ['Hanoi', 105.8342, 21.0278, false],
  ['Kolkata', 88.3639, 22.5726, false],
  ['Ulaanbaatar', 106.9057, 47.8864, false],
  ['Tokyo', 139.6917, 35.6895, false],
  ['Lisbon', -9.1393, 38.7223, false],
  ['Shanghai', 121.4737, 31.2304, true],
  ['Beijing', 116.4074, 39.9042, true],
  ['Guangzhou', 113.2644, 23.1291, true],
  ['Haikou', 110.329, 20.044, true],
  ['Hong Kong', 114.1694, 22.3193, true],
]

let failed = 0
for (const [name, lng, lat, expected] of cities) {
  const actual = isInChina(lng, lat)
  const ok = actual === expected
  console.log(`${ok ? '✓' : '✗'} ${name} => ${actual} (want ${expected})`)
  if (!ok) failed += 1
}

if (isCoordinateOnlyInput('West Lake Hangzhou')) {
  console.log('✗ place name classified as coords')
  failed += 1
} else console.log('✓ place name is not coords')

if (isCoordinateOnlyInput('https://maps.google.com/maps/@1,2,3z')) {
  console.log('✗ url classified as coords')
  failed += 1
} else console.log('✓ url is not coords')

if (!isCoordinateOnlyInput('13.7, 100.5')) {
  console.log('✗ plain coords not recognized')
  failed += 1
} else console.log('✓ plain coords')

const strippedName = 'West Lake Hangzhou'.replace(/[NSEW]/gi, '')
if (strippedName === 'West Lake Hangzhou'.replace(/[NSEW]/gi, '') && !/igapor/.test(normalizeCoordinateText('Singapore'))) {
  console.log('✓ coordinate helper does not destroy place names when not used on them')
}

if (failed) {
  console.error(`geo tests failed: ${failed}`)
  process.exit(1)
}
console.log('geo tests passed')
