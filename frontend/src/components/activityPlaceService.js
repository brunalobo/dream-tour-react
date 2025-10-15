import { PLACE_TYPES, parseFromLocalidade } from "../common/Place";
import { API_ROUTES } from "../consts/api";
import Service from "./Service";
import {
	formatDateToService,
	transformObjectArrayToPlaceCollection,
} from "./utils";

/**
 * @typedef {Object} Localidade
 * @property {number} id
 * @property {string} nome
 * @property {string} estado
 * @property {number} latitude
 * @property {number} longitude
 * @property {string} municipio
 * @property {boolean} is_raia
 */

/**
 * @param {*} enqueueStackbar
 * @returns {PlaceCollection}
 */
export async function listAllActivityPlaces(enqueueStackbar) {
	/**
	 * @type {Localidade[]}
	 */
	const localidades = await Service.get(
		`${import.meta.env.URL_BASE}${API_ROUTES.ACTIVITY_PLACES}`,
	);
	return transformObjectArrayToPlaceCollection(
		localidades,
		parseFromLocalidade,
	);
}

/**
 *
 * @param {number} activityPlaceId
 * @param {*} enqueueStackbar
 * @returns {import("../common/Place").ActivityPlaceItem}
 */
export async function getActivityPlaceById(activityPlaceId, enqueueStackbar) {
	/**
	 * @type Localidade
	 */
	const localidade = await Service.get(
		`${import.meta.env.URL_BASE}${API_ROUTES.ACTIVITY_PLACE}/${activityPlaceId}`,
	);
	return parseFromLocalidade(localidade);
}

/**
 * @typedef {Object} LocalidadeMetoceanInfoHour
 * todo @property {string} baln - balneabilidade da água (retorna string com horário)
 * @property {number} dp - direção de pico da onda total
 * @property {number} dp_sea - direação de pico da onda sea
 * @property {number} dp_swell - direção de pico da onda swell
 * @property {number} gust10m - velocidade da rajada
 * @property {number} hs - altura significativa da onda total
 * @property {number} hs_sea - altura significativa da onda sea
 * @property {number} hs_swell - altura significativa da onda swell
 * @property {number} htide - maré alta
 * @property {number} ltide - maré baixa
 * @property {number} prec_acc - precipitação acumulada
 * @property {number} prec_rate - taxa de precipitação
 * @property {string} sunr - sunrise
 * @property {string} suns - sunset
 * @property {string} thtide - horário da maré alta
 * @property {number} tide - maré instantânea
 * @property {string} tltide - horário da maré baixa
 * todo @property {number} tmp2m - temperatura atual
 * @property {number} tmax2m - temperatura máxima
 * @property {number} tmin2m - temperatura mínima
 * todo @property {number} uv_rate - taxa de uv
 * @property {number} tp - período de pico da onda total
 * @property {number} tp_sea - período de pico da onda sea
 * @property {number} tp_swell - período de pico da onda swell
 * @property {number} tsm - temperatura da água
 * @property {number} wdir10m - direção do vento
 * @property {number} wspd10m - velocidade do vento
 * todo @property {number} x - altura 1 onda (??)
 * todo @property {number} x - altura 2 onda (??)
 */

/**
 * @typedef {Object.<string, LocalidadeMetoceanInfoHour>} LocalidadeMetoceanInfoDay
 */

/**
 * @param {Object} params
 * @param {number} params.activityPlaceId
 * @param {string|Date} params.startDate
 * @param {string|Date} params.endDate
 * @param {*} params.enqueueStackbar
 * @returns {Promise<LocalidadeMetoceanInfoDay>}
 */
export async function getActivityPlaceMetoceanInfo({
	activityPlaceId,
	startDate,
	endDate,
	enqueueStackbar,
}) {
	const requestOptions = {
		params: {
			location_id: activityPlaceId,
		},
	};
	if (startDate) {
		requestOptions.params.start_date = formatDateToService(startDate);
	}
	if (endDate) {
		requestOptions.params.end_date = formatDateToService(endDate);
	}

	/**
	 * @type {LocalidadeMetoceanInfoDay}
	 */
	const localidadeData = await Service.get(
		`${import.meta.env.URL_CACHE_BASE}${API_ROUTES.METOCEAN_INFO}`,
		requestOptions,
	);
	return localidadeData;
}

/**
 *
 * @param {string} searchTerm
 * @param {*} enqueueStackbar
 * @returns {Promise<import("../common/SearchResult").SearchResult[]>}
 */
export async function searchActivityPlaces(searchTerm, enqueueStackbar) {
	const apList = await Service.get(
		`${import.meta.env.URL_BASE}${API_ROUTES.ACTIVITY_PLACE}/${API_ROUTES.SEARCH}`,
		{
			params: {
				text: searchTerm,
				check_estado: true,
				check_municipio: true,
			},
		},
	);
	if (Array.isArray(apList)) {
		return apList.map((ap) => {
			return {
				id: ap.id,
				displayName: ap.nome,
				findedObject: parseFromLocalidade(ap),
				type: PLACE_TYPES.ActivityPlaceItem,
			};
		});
	}
	if (Object.keys(apList).length > 0) {
		return [
			{
				id: apList.id,
				displayName: apList.nome,
				findedObject: parseFromLocalidade(apList),
				type: PLACE_TYPES.ActivityPlaceItem,
			},
		];
	}
	return [];
}
