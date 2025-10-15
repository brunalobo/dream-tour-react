import useActivityPlacesStore from "../../../../store/activityPlacesStore";
import { roundDateHour } from "../../../../utils/dateUtils";
import LatestUpdateCard from "../../ui/LatestUpdateCard/LatestUpdateCard";

/**
 * @param {Object} props
 * @returns
 */
export default function CurrentTab() {
	const { activityPlaceMetoceanInfoDay } = useActivityPlacesStore();

	const selectedDayInfo = {};
	const sortedDateKeys = Object.keys(activityPlaceMetoceanInfoDay ?? {}).sort();
	const startIndex = sortedDateKeys.indexOf(
		roundDateHour(new Date(), true, true),
	);
	if (activityPlaceMetoceanInfoDay) {
		for (let i = startIndex; i < startIndex + 24; i++) {
			selectedDayInfo[sortedDateKeys[i]] =
				activityPlaceMetoceanInfoDay[sortedDateKeys[i]];
		}
	}

	return (
		<section style={{ zIndex: 1, overflowX: "hidden" }}>
			<div style={{ padding: "16px" }}>
				<LatestUpdateCard />
			</div>
		</section>
	);
}
