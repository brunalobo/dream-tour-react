import { ArrowBack } from "@mui/icons-material";
import { Container } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Fragment, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import activityPlaceImageDefault from "../../assets/praia.svg";
import { ActionIconAllBlueButton } from "../../components/atoms/buttons/ActionButton/ActionButton";
import { ActivityPlaceHeader } from "../../components/molecules/ActivityPlaceHeader/ActivityPlaceHeader";
import CurrentTab from "../../components/organisms/tabs/CurrentTab/CurrentTab";
import ForecastTab from "../../components/organisms/tabs/ForecastTab/ForecastTab";
import WeekTab from "../../components/organisms/tabs/WeekTab";
import NavigationTab from "../../components/organisms/ui/NavigationTab";
import { ROUTES } from "../../consts/routes";
import {
	getActivityPlaceById,
	getActivityPlaceMetoceanInfo,
} from "../../services/activityPlaceService";
import useActivityPlacesStore from "../../store/activityPlacesStore";
import { infoMenuStates, useInfoMenuStore } from "../../store/infoMenuStore";
import { useSearchStore } from "../../store/searchStore";
import { useTitleBarStore } from "../../store/titleBarStore";

/**
 *
 * @returns
 */
function ActivityPlacePage() {
	const preload = new createjs.LoadQueue();
	const location = useLocation();
	const navigate = useNavigate();
	const { activityPlaceId } = useParams();
	const { setActivityPlaceMetoceanInfoDay } = useActivityPlacesStore();
	const { setTitleBarLeftActionButton, setTitleBarRightActionButton } =
		useTitleBarStore();
	const { closeSearch } = useSearchStore();
	const { infoMenuContent, setState } = useInfoMenuStore();

	const infoMenuContentRef = useRef(null);
	infoMenuContentRef.current = infoMenuContent;

	const [activityPlace, setActivityPlace] = useState(null);
	const [activityPlaceImage, setActivityPlaceImage] = useState(null);
	const [applyPlaceImageFilter, setApplyPlaceImageFilter] = useState(false);

	const metoceanInfoDay = useQuery({
		queryKey: ["activityPlaceMetoceanInfoDay", activityPlaceId],
		queryFn: async () => {
			const data = await getActivityPlaceMetoceanInfo({
				activityPlaceId: activityPlaceId,
			});
			return data;
		},
		enabled: activityPlaceId != null,
	});

	async function loadActivityPlace() {
		setActivityPlace(await getActivityPlaceById(activityPlaceId));
	}

	function handleGoBack(e) {
		closeSearch();
		navigate(ROUTES.MAIN);
		e.preventDefault();
		e.stopPropagation();
	}

	useEffect(() => {
		setState(infoMenuStates.OPENED);
		setTitleBarRightActionButton(null);
		if (location.state) {
			setActivityPlace(JSON.parse(location.state));
		} else {
			loadActivityPlace();
		}
		setTitleBarLeftActionButton(
			<ActionIconAllBlueButton onClick={handleGoBack}>
				<ArrowBack />
			</ActionIconAllBlueButton>,
		);
	}, []);

	useEffect(() => {
		if (metoceanInfoDay.data) {
			setActivityPlaceMetoceanInfoDay(metoceanInfoDay.data.time_series);
			if (activityPlace?.is_raia) {
				preload.loadFile(activityPlaceImageDefault);
				setActivityPlaceImage(activityPlaceImageDefault);
				setApplyPlaceImageFilter(false);
			} else if (metoceanInfoDay.data.image_path) {
				preload.loadFile(metoceanInfoDay.data.image_path);
				setActivityPlaceImage(metoceanInfoDay.data.image_path);
				setApplyPlaceImageFilter(true);
			} else {
				preload.loadFile(activityPlaceImageDefault);
				setActivityPlaceImage(activityPlaceImageDefault);
				setApplyPlaceImageFilter(false);
			}
		}
	}, [metoceanInfoDay.data, activityPlace]);

	return (
		<Container
			style={{
				padding: 0,
				height: "100%",
				paddingBottom: "1.25rem",
				overflow: "auto",
			}}
		>
			{activityPlace && (
				<Fragment>
					<ActivityPlaceHeader
						activityPlace={activityPlace}
						activityPlaceImage={activityPlaceImage}
						applyPlaceImageFilter={applyPlaceImageFilter}
					/>
					<NavigationTab>
						<div label="Agora">
							<CurrentTab />
						</div>
						<div label="Semana">
							<WeekTab />
						</div>
						<div label="Dia a dia">
							<ForecastTab />
						</div>
					</NavigationTab>
				</Fragment>
			)}
		</Container>
	);
}

export { ActivityPlacePage };
