/**
 * Static location data for the UdK Berlin locations
 */

export interface Location {
	id: string;
	name: string;
	street: string;
	postcode: string;
	city: string;
	latitude: string;
	longitude: string;
}

export const locations: Location[] = [
	{
		id: 'hardenbergstrasse',
		name: 'Hardenbergstraße 33',
		street: 'Hardenbergstraße 33',
		postcode: '10623',
		city: 'Berlin',
		latitude: '52.509653',
		longitude: '13.3271929'
	},
	{
		id: 'bundesallee',
		name: 'Bundesallee 1-12',
		street: 'Bundesallee 1-12',
		postcode: '10719',
		city: 'Berlin',
		latitude: '52.4981932',
		longitude: '13.3274551'
	},
	{
		id: 'einsteinufer',
		name: 'Einsteinufer 43-53',
		street: 'Einsteinufer 43-53',
		postcode: '10587',
		city: 'Berlin',
		latitude: '52.5165548',
		longitude: '13.3202177'
	},
	{
		id: 'jazz-institut_berlin',
		name: 'Jazz-Institut Berlin',
		street: 'Einsteinufer 43-53',
		postcode: '10587',
		city: 'Berlin',
		latitude: '52.5169628',
		longitude: '13.3181485'
	},
	{
		id: 'fasanenstrasse',
		name: 'Fasanenstraße 1b',
		street: 'Fasanenstraße 1b',
		postcode: '10623',
		city: 'Berlin',
		latitude: '52.5093475',
		longitude: '13.3276388'
	},
	{
		id: 'unit_theater',
		name: 'UNI.T - Theater der UdK Berlin',
		street: 'Fasanenstraße 1b',
		postcode: '10623',
		city: 'Berlin',
		latitude: '52.5093475',
		longitude: '13.3276388'
	},
	{
		id: 'hzt',
		name: 'Hochschulübergreifendes Zentrum Tanz (HZT)',
		street: 'Uferstraße 23',
		postcode: '13357',
		city: 'Berlin',
		latitude: '52.5517727',
		longitude: '13.3700503'
	},
	{
		id: 'konzertsaal',
		name: 'Konzertsaal',
		street: 'Hardenbergstraße, Fasanenstraße 33 (Ecke)',
		postcode: '10623',
		city: 'Berlin',
		latitude: '52.5092561',
		longitude: '13.3275879'
	},
	{
		id: 'lietzenburger_strasse',
		name: 'Lietzenburger Straße 45',
		street: 'Lietzenburger Straße 45',
		postcode: '10777',
		city: 'Berlin',
		latitude: '52.4997893',
		longitude: '13.3314795'
	},
	{
		id: 'medienhaus',
		name: 'Medienhaus',
		street: 'Grunewaldstraße 2-5',
		postcode: '10823',
		city: 'Berlin',
		latitude: '52.4908577',
		longitude: '13.357244'
	},
	{
		id: 'strasse_des_17_juni_118',
		name: 'Straße des 17. Juni 118',
		street: 'Straße des 17. Juni 118',
		postcode: '10623',
		city: 'Berlin',
		latitude: '52.5138075',
		longitude: '13.3241008'
	},
	{
		id: 'universitaetsbibliothek',
		name: 'Universitätsbibliothek im Volkswagen-Haus',
		street: 'Fasanenstraße 88',
		postcode: '10623',
		city: 'Berlin',
		latitude: '52.5101646',
		longitude: '13.3278948'
	},
	{
		id: 'mierendorffstrasse',
		name: 'Mierendorffstraße 30',
		street: 'Mierendorffstraße 30',
		postcode: '10589',
		city: 'Berlin',
		latitude: '52.524442',
		longitude: '13.3027563'
	}
];

// Location mapping data (moved from JSON)
export interface LocationMatch {
	id: string;
	match: string[];
}

export const locationMatchData: LocationMatch[] = [
	{
		id: 'hardenbergstrasse',
		match: ['hardenbergstrasse-33', 'hardenbergstrasse']
	},
	{
		id: 'bundesallee',
		match: ['bundesallee-1-12', 'bundesallee']
	},
	{
		id: 'einsteinufer',
		match: ['einsteinufer-43-53', 'einsteinufer']
	},
	{
		id: 'jazz-institut_berlin',
		match: ['jazz-institut-berlin', 'jazz-institut', 'jazz-institut_berlin']
	},
	{
		id: 'fasanenstrasse',
		match: ['fasanenstrasse-1b', 'fasanenstrasse']
	},
	{
		id: 'unit_theater',
		match: ['uni-t-theater-der-udk-berlin', 'unit-theater']
	},
	{
		id: 'hzt',
		match: ['hzt', 'hzt-berlin', 'hochschuluebergreifendes-zentrum-tanz-hzt']
	},
	{
		id: 'konzertsaal',
		match: ['konzertsaal']
	},
	{
		id: 'lietzenburger_strasse',
		match: ['lietzenburger-strasse-45', 'lietzenburger-strasse']
	},
	{
		id: 'medienhaus',
		match: ['medienhaus', 'medienhaus-berlin']
	},
	{
		id: 'strasse_des_17_juni_118',
		match: ['strasse-des-17-juni', 'strasse-des-17-juni-118']
	},
	{
		id: 'universitaetsbibliothek',
		match: [
			'universitaetsbibliothek',
			'universitaetsbibliothek',
			'universitaetsbibliothek-im-volkswagen-haus'
		]
	},
	{
		id: 'mierendorffstrasse',
		match: ['mierendorffstrasse-30', 'mierendorffstrasse']
	}
];
