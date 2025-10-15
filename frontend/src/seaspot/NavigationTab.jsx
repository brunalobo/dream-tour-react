import { Box, Tab, Tabs } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useState } from "react";
import "./NavigationTab.css";
import { useTheme } from "@emotion/react";

/**
 * @param {any} children
 */

function NavigationTab({ children }) {
	const theme = useTheme();
	const [value, setValue] = useState(0);

	const handleChange = (event, newValue) => {
		setValue(newValue);
	};

	const AntTabs = styled(Tabs)({
		"& .MuiTabs-indicator": {
			backgroundColor: theme.palette.secondary.mainBlue,
		},
		"& .MuiTab-root.Mui-selected": {
			color: theme.palette.secondary.mainBlue,
		},
	});

	return (
		<section>
			<Box
				sx={{
					boxShadow: "0px 4px 4px 0px #00000040",
					position: "sticky",
					top: "0",
					background: "#fff",
					zIndex: 10,
				}}
			>
				<AntTabs
					value={value}
					onChange={handleChange}
					// variant="fullWidth"
					textColor="inherit"
				>
					{children.map((child, index) => (
						<Tab
							key={index}
							label={child.props.label}
							sx={{ textTransform: "none", fontSize: "16px" }}
						/>
					))}
				</AntTabs>
			</Box>
			{children[value]}
		</section>
	);
}

export default NavigationTab;
