import { Share } from "@mui/icons-material";
import { Skeleton, Stack } from "@mui/material";
import { ActionIconButton } from "../../atoms/buttons/ActionButton/ActionButton";
import SectionTitle from "../../atoms/titles/SectionTitle";
import SubSectionTitle from "../../atoms/titles/SubSectionTitle";
import "./ActivityPlaceHeader.css";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../consts/routes";

/**
 *
 * @param {Object} props
 * @param {any} props.activityPlace
 * @param {string} props.activityPlaceImage
 * @param {boolean} props.applyPlaceImageFilter
 * @returns
 */
function ActivityPlaceHeader({
	activityPlace,
	activityPlaceImage,
	applyPlaceImageFilter,
}) {
	const navigate = useNavigate();

	function handleShareActivityPlace(e) {
		navigate(
			`${ROUTES.ACTIVITYPLACE.replace(":activityPlaceId", activityPlace.id)}/share`,
			{ state: JSON.stringify(activityPlace) },
		);
	}

	return (
		<Stack
			direction="column"
			justifyContent="flex-start"
			alignItems="flex-start"
		>
			{activityPlaceImage ? (
				<img
					className={
						applyPlaceImageFilter
							? "ActivityPlaceHeader-img-filter"
							: "ActivityPlaceHeader-img"
					}
					src={activityPlaceImage}
					alt={`Imagem representativa para ${activityPlace.name}.`}
				/>
			) : (
				<Skeleton variant="rectangular" width="100%" height="165px" />
			)}
			<section className="ActivityPlaceHeader-titles" style={{ zIndex: 1 }}>
				<Stack direction="row" justifyContent="space-between">
					<Stack className="backgroundSectionTitle">
						<SectionTitle title={activityPlace.name} />
					</Stack>
					{navigator.canShare && (
						<ActionIconButton onClick={handleShareActivityPlace}>
							<Share />
						</ActionIconButton>
					)}
				</Stack>
				<SubSectionTitle
					title={`${activityPlace?.city ?? "—"}${activityPlace?.stateUF ? `, ${activityPlace?.stateUF}` : ""}`}
				/>
			</section>
		</Stack>
	);
}

export { ActivityPlaceHeader };
