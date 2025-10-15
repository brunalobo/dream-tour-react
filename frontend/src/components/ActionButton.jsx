import { useTheme } from "@emotion/react";
import {
	Button,
	IconButton,
	ToggleButtonGroup,
	styled,
	toggleButtonGroupClasses,
} from "@mui/material";

/**
 *
 * @param {Object} props
 * @param {any} props.theme
 * @returns
 */
export const ActionButton = styled(Button)(({ theme }) => ({
	backgroundColor: theme.palette.secondary.main,
	color: theme.palette.secondary.contrastText,
	borderRadius: "8px",
	textTransform: "initial",
	fontWeight: 700,
	width: "100%",
	"&:hover": {
		opacity: 0.9,
		backgroundColor: theme.palette.secondary.main,
		color: theme.palette.secondary.contrastText,
	},
	outline: "none!important",
}));

/**
 *
 * @param {Object} props
 * @param {any} props.theme
 *
 */
export const ActionTextButton = styled(Button)(({ theme }) => ({
	color: theme.palette.secondary.main,
	textTransform: "initial",
	fontWeight: 700,
	width: "100%",
	"&:hover": {
		opacity: 0.9,
	},
	outline: "none!important",
}));

/**
 *
 * @param {Object} props
 * @param {any} props.theme
 * @param {boolean} props.isSelected
 *
 */

export const ActionTextOutlinedButton = styled(Button)(
	({ theme, isSelected }) => ({
		color: theme.palette.primary.mainBlue,
		boxShadow: isSelected
			? `0px 0px 0px 2px ${theme.palette.primary.mainBlue}`
			: " 0px 5px 15px 0px #33333366",
		textTransform: "initial",
		fontWeight: 700,
		width: "100%",
		fontSize: "14px",
		borderRadius: "8px",
		position: "relative",
		textAlign: "center",
		"&:hover": {
			opacity: 0.9,
		},
		"&:selected": {
			boxShadow: "0px 0px 4px 0px red",
		},
		outline: "none!important",
	}),
);

/**
 *
 * @param {Object} props
 * @param {any} props.theme
 *
 */
export const StyledToggleButtonGroup = styled(ToggleButtonGroup)(
	({ theme }) => ({
		[`& .${toggleButtonGroupClasses.grouped}`]: {
			backgroundColor: theme.palette.primary.main,
			borderRadius: "16px",
			boxShadow: "0px 5px 10px 0px #33333366",
			color: theme.palette.secondary.light,
			fontSize: "14px",
			fontWeight: "bold",
			marginRight: "20px",
			padding: "20px 10px",
			outline: "none",
			textTransform: "none",
			textWrap: "nowrap",
			":hover": {
				border: "none",
				outline: "none",
			},
		},
		[`& .${toggleButtonGroupClasses.firstButton}`]: {
			marginLeft: "15px",
		},
		[`& .${toggleButtonGroupClasses.lastButton}`]: {
			marginRight: "15x",
		},
		[`& .${toggleButtonGroupClasses.selected}`]: {
			backgroundColor: "#fff!important",
			border: "2px solid #004765!important",
			color: "#004765!important",
			boxShadow: "none!important",
		},
	}),
);

/**
 *
 * @param {Object} props
 * @param {any} props.theme
 *
 */
export const ActionIconFilledButton = styled(IconButton)(({ theme }) => ({
	backgroundColor: theme.palette.secondary.main,
	color: theme.palette.secondary.contrastText,
	borderRadius: "0px",
	"&:hover": {
		opacity: 0.9,
		backgroundColor: theme.palette.secondary.main,
		color: theme.palette.secondary.contrastText,
	},
	outline: "none!important",
}));

/**
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */

export function ActionIconButton({ children, ...props }) {
	const theme = useTheme();

	return (
		<IconButton
			sx={{
				backgroundColor: theme.palette.primary.main,
				color: theme.palette.secondary.main,
				outline: "none !important",
				"&:hover": {
					backgroundColor: "#b3d5de",
					color: theme.palette.secondary.main,
				},
				"&.Mui-disabled": {
					backgroundColor: theme.palette.primary.main,
				},
			}}
			{...props}
		>
			{children}
		</IconButton>
	);
}

/**
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */

export function ActionIconAllBlueButton({ children, ...props }) {
	const theme = useTheme();

	return (
		<IconButton
			sx={{
				backgroundColor: theme.palette.primary.mainBlue,
				color: theme.palette.primary.supportBlue,
				outline: "none !important",
				"&:hover": {
					backgroundColor: theme.palette.primary.mainBlue,
					color: theme.palette.primary.supportBlue,
				},
				"&.Mui-disabled": {
					backgroundColor: theme.palette.primary.mainBlue,
				},
			}}
			{...props}
		>
			{children}
		</IconButton>
	);
}

/**
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */

export function ActionIconSupportBlueButton({ children, ...props }) {
	const theme = useTheme();

	return (
		<IconButton
			sx={{
				backgroundColor: theme.palette.primary.main,
				color: theme.palette.primary.supportBlue,
				outline: "none !important",
				"&:hover": {
					backgroundColor: theme.palette.primary.main,
					color: theme.palette.primary.supportBlue,
				},
				"&.Mui-disabled": {
					backgroundColor: theme.palette.primary.main,
				},
			}}
			{...props}
		>
			{children}
		</IconButton>
	);
}

/**
 *
 * @param {Object} props
 * @param {React.ReactNode} props.active
 * @param {React.ReactNode} props.children
 */
export function ActionIconPortalHourlyButton({ children, active, ...props }) {
	const theme = useTheme();

	return (
		<IconButton
			sx={{
				width: "32px",
				height: "32px",
				backgroundColor: active
					? theme.palette.primary.backgroundBlue
					: theme.palette.primary.main,
				color: active
					? theme.palette.primary.mainBlue
					: theme.palette.primary.mainBlue,
				outline: "none !important",
				"&:hover": {
					backgroundColor: theme.palette.primary.backgroundBlue,
					color: theme.palette.primary.mainBlue,
				},
				"&.Mui-disabled": {
					backgroundColor: theme.palette.primary.main,
				},
			}}
			{...props}
		>
			{children}
		</IconButton>
	);
}
