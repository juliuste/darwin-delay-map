'use strict'

const mapboxgl = require('mapbox-gl')
const pick = require('lodash/pick')
let rawData = require('./data/0513.json')
const stationCodesPartial = require('./stations/stationCodesPartial.json')
let stationCodesFull = require('./stations/stationCodesFull.json')
const crsCodes = require('./stations/crsCodes.json')
const point = require('@turf/helpers').point
const moment = require('moment-timezone')

stationCodesFull = stationCodesFull.map(x => ({
	longitude: x.lon,
	latitude: x.lat,
	crs: x.crs
}))

const disruptions = {
	"general": 1,
	"signalling": 2,
	"line": 3,
	"train": 4,
	"weather": 5,
	"levelcrossing": 2
}

console.log(rawData.length)
rawData = rawData.map(d => {
	const crs = crsCodes.find(x => x.code === d.tpl)
	if (crs) {
		let fullObject = stationCodesPartial.find(x => x.crs === crs.crs)
		if (!fullObject) fullObject = stationCodesFull.find(x => x.crs === crs.crs)
		if (fullObject && fullObject.longitude && fullObject.latitude) {
			const coords = pick(fullObject, ['latitude', 'longitude'])
			const p = point([coords.longitude, coords.latitude])
			// p.properties = d
			const hour = +moment.tz(d.date, 'Europe/London').format('HH')
			const minute = Math.round(+moment.tz(d.date, 'Europe/London').format('mm')/10)

			p.properties.delayed = disruptions[d.lateReason] || 0
			p.properties.time = 6*hour + minute
			return p
		}
	}
return null
})
rawData = rawData.filter(x => !!x)
console.log(rawData.filter(x => x.properties.delayed).length)

rawData = {
	type: "FeatureCollection",
	features: rawData
}

mapboxgl.accessToken = "pk.eyJ1IjoianVsaXVzdGUiLCJhIjoiY2o1aTBkNjZjMjM5eDMycDhsdGk4MXhveiJ9.jNUSp4gVSLau7UzFuNGAiA"
const map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/mapbox/streets-v9',
	zoom: 5,
	hash: true,
	center: [-5.53, 54.83]
})
map.addControl(new mapboxgl.NavigationControl())

const el = document.getElementById('map')

const resize = () => {
	const w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
	const h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
	el.style.width = w + 'px'
	el.style.height = h + 'px'
	map.resize()
}
resize()
window.addEventListener('resize', resize)

const refresh = counter => {
	map.setFilter('disruptions', ['==', ['number', ['get', 'time']], counter])
	let hour = ''+Math.floor(counter/6)
	if (hour.length === 1) hour = '0'+hour
	let minute = ''+((counter % 6)*10)
	if (minute.length === 1) minute = '0'+minute
	document.querySelector('#clockContent').innerHTML = hour+':'+minute
}

map.on('load', () => {
	map.addLayer({
		id: 'disruptions',
		type: 'circle',
		source: {
			type: 'geojson',
			data: rawData // replace this with the url of your own geojson
		},
		paint: {
			'circle-radius': 6,
			'circle-color': [
				'interpolate',
				['linear'],
				['number', ['get', 'delayed']],
				0, '#00B84C', // no delay
				1, '#A73BFF', // general
				2, '#C70000', // signalling
				3, '#FF00D0', // line
				4, '#FFAC12', // train
				5, '#964400' // weather
				// 1, '#CF0049' // general
			]
		}
	}, 'admin-2-boundaries-dispute')

	let counter = 6*5

	let interval
	const clear = () => clearInterval(interval)

	refresh(counter)
	interval = setInterval(() => {
		refresh(counter++)
		if (counter === 24*6) clear()
	}, 500)
})
