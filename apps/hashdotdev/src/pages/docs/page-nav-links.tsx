import {
  Box,
  BoxProps,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { FunctionComponent } from "react";

import { FaIcon } from "../../components/icons/fa-icon";
import { Link } from "../../components/link";
import { SiteMapPage } from "./docs-sitemap";

/** @todo: make use of styled component when `FaIcon` component has been replaced */
const navArrowIconStyling: BoxProps["sx"] = {
  color: ({ palette }) => palette.teal[80],
  fontSize: 15,
  marginTop: 0.8,
  position: "relative",
  left: 0,
  transition: ({ transitions }) => transitions.create("left"),
};

type PageNavLinksProps = {
  prevPage?: SiteMapPage;
  nextPage?: SiteMapPage;
} & BoxProps;

export const PageNavLinks: FunctionComponent<PageNavLinksProps> = ({
  prevPage,
  nextPage,
  ...boxProps
}) => {
  const theme = useTheme();
  const hideIcons = useMediaQuery(theme.breakpoints.down(1200));

  return (
    <Box display="flex" justifyContent="space-between" {...boxProps}>
      <Box>
        {prevPage && (
          <Box display="flex" alignItems="flex-end">
            <Box>
              <Typography sx={{ color: theme.palette.gray[70] }} component="p">
                Previous
              </Typography>
              <Box
                display="flex"
                sx={{
                  marginLeft: hideIcons ? 0 : "-31px",
                  "& svg": {
                    display: hideIcons ? "none" : "inherit",
                  },
                  "&:hover": {
                    color: theme.palette.teal[80],
                    "& svg": {
                      left: `-${theme.spacing(1)}`,
                    },
                  },
                }}
              >
                <FaIcon
                  sx={[
                    {
                      marginRight: 2,
                    },
                    navArrowIconStyling,
                  ]}
                  name="arrow-left"
                  type="regular"
                />
                <Link
                  sx={{
                    maxWidth: hideIcons ? 150 : 200,
                  }}
                  href={prevPage.href}
                >
                  {prevPage.title}
                </Link>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
      <Box>
        {nextPage && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="flex-end"
            sx={{ position: "relative", left: hideIcons ? 0 : "31px" }}
          >
            <Typography sx={{ color: theme.palette.gray[70] }} component="p">
              Next
            </Typography>
            <Box
              display="flex"
              sx={{
                marginRight: hideIcons ? 0 : "-31px",
                "& svg": {
                  display: hideIcons ? "none" : "inherit",
                },
                "&:hover": {
                  color: theme.palette.teal[80],
                  "& svg": {
                    left: theme.spacing(1),
                  },
                },
              }}
            >
              <Link
                sx={{
                  textAlign: "right",
                  maxWidth: hideIcons ? 150 : 200,
                }}
                href={nextPage.href}
              >
                {nextPage.title}
              </Link>
              <FaIcon
                sx={[
                  {
                    marginLeft: 2,
                  },
                  navArrowIconStyling,
                ]}
                name="arrow-right"
                type="regular"
              />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};
